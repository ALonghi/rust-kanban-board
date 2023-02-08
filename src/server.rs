use std::{convert::Infallible, iter::once, net::SocketAddr, sync::Arc};

use http::header::{HeaderName, AUTHORIZATION, CONTENT_TYPE};
use hyper::Server;
use tokio::net::TcpListener;
use tower::make::Shared;
use tower::ServiceBuilder;
use tower_http::add_extension::AddExtensionLayer;
use tower_http::compression::CompressionLayer;
use tower_http::propagate_header::PropagateHeaderLayer;
use tower_http::sensitive_headers::SetSensitiveRequestHeadersLayer;
use tower_http::set_header::SetResponseHeaderLayer;
use tower_http::trace::TraceLayer;
use tower_http::validate_request::ValidateRequestHeaderLayer;

use crate::config::Environment;
use crate::content_length_from_response;

pub async fn serve_forever(listener: TcpListener) -> Result<(), hyper::Error> {
    if dotenv::dotenv().is_err() {
        eprintln!("Error reading .env file in the current folder!");
    }

    // Construct the shared state.
    let _env = match Environment::new().await {
        Ok(e) => e,
        Err(_e) => panic!("Unable to read environment configuration: {}", _e),
    };

    // Use tower's `ServiceBuilder` API to build a stack of tower middleware
    // wrapping our request handler.
    let service = ServiceBuilder::new()
        // Mark the `Authorization` request header as sensitive so it doesn't show in logs
        .layer(SetSensitiveRequestHeadersLayer::new(once(AUTHORIZATION)))
        // High level logging of requests and responses
        .layer(TraceLayer::new_for_http())
        // Share an `Arc<State>` with all requests
        .layer(AddExtensionLayer::new(Arc::new(_env)))
        // Compress responses
        .layer(CompressionLayer::new())
        // Propagate `X-Request-Id`s from requests to responses
        .layer(PropagateHeaderLayer::new(HeaderName::from_static(
            "x-request-id",
        )))
        // If the response has a known size set the `Content-Length` header
        .layer(SetResponseHeaderLayer::overriding(
            CONTENT_TYPE,
            content_length_from_response,
        ))
        // Accept only application/json, application/* and */* in a request's ACCEPT header
        .layer(ValidateRequestHeaderLayer::accept("application/json"));
    // Wrap a `Service` in our middleware stack

    // And run our service using `hyper`
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    Server::bind(&addr)
        .serve(Shared::new(service))
        .await
        .expect("server error");
}
