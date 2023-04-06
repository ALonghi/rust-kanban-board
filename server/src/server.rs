use std::{sync::Arc, time::Duration};

use axum::{
    body::Bytes,
    http::{header, HeaderValue, Method},
    Router,
};
use tower::ServiceBuilder;
use tower_http::cors::AllowOrigin;
use tower_http::trace::{DefaultMakeSpan, DefaultOnResponse, TraceLayer};
use tower_http::{cors::CorsLayer, timeout::TimeoutLayer};
use tower_http::{LatencyUnit, ServiceBuilderExt};

use crate::config::AppState;
use crate::db::DB;
use crate::error::Result;
use crate::routes::get_routes;
use crate::EnvVars;

pub async fn app(env_vars: EnvVars) -> Result<Router> {
    // Build our database for holding the key/value pairs
    let state = AppState {
        client: DB::init(env_vars).await?.client,
    };

    let sensitive_headers: Arc<[_]> = vec![header::AUTHORIZATION, header::COOKIE].into();
    let cors = CorsLayer::new()
        // allow `GET` and `POST` when accessing the resource
        .allow_methods(vec![
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        // allow requests from any origin
        .allow_origin(AllowOrigin::any());

    // Build our middleware stack
    let middleware = ServiceBuilder::new()
        // Mark the `Authorization` and `Cookie` headers as sensitive so it doesn't show in logs
        .sensitive_request_headers(sensitive_headers.clone())
        // Add high level tracing/logging to all requests
        .layer(
            TraceLayer::new_for_http()
                .on_body_chunk(|chunk: &Bytes, latency: Duration, _: &tracing::Span| {
                    tracing::trace!(size_bytes = chunk.len(), latency = ?latency, "sending body chunk")
                })
                .make_span_with(DefaultMakeSpan::new().include_headers(true))
                .on_response(DefaultOnResponse::new().include_headers(true).latency_unit(LatencyUnit::Micros)),
        )
        .sensitive_response_headers(sensitive_headers)
        // Set a timeout
        .layer(TimeoutLayer::new(Duration::from_secs(10)))
        // Box the response body so it implements `Default` which is required by axum
        .map_response_body(axum::body::boxed)
        // Compress responses
        .compression()
        // Set a `Content-Type` if there isn't one already.
        .insert_response_header_if_not_present(
            header::CONTENT_TYPE,
            HeaderValue::from_static("application/json"),
        );

    // Build route service
    Ok(get_routes().layer(cors).layer(middleware).with_state(state))
}
