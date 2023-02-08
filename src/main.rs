use std::{convert::Infallible, iter::once, net::SocketAddr, sync::Arc};

use http::{
    header::{HeaderName, AUTHORIZATION, CONTENT_TYPE},
    HeaderValue, Request, Response,
};
use hyper::body::HttpBody;
use hyper::{server::Server, service::make_service_fn, Body, Error};
use tokio::net::TcpListener;
use tower::{make::Shared, service_fn, ServiceBuilder};
use tower_http::{
    add_extension::AddExtensionLayer, auth::RequireAuthorizationLayer,
    compression::CompressionLayer, propagate_header::PropagateHeaderLayer,
    sensitive_headers::SetSensitiveRequestHeadersLayer, set_header::SetResponseHeaderLayer,
    trace::TraceLayer, validate_request::ValidateRequestHeaderLayer,
};

use crate::config::Environment;
use crate::server::serve_forever;

mod config;
mod error;
mod server;
mod task;

#[tokio::main]
async fn main() {
    // Setup tracing
    tracing_subscriber::fmt::init();

    // Parse command line arguments
    let config = Config::parse();

    // Create a `TcpListener`
    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    let listener = TcpListener::bind(addr).unwrap();

    // Run our service
    serve_forever(listener).await.expect("server error");
}

fn content_length_from_response<B>(response: &Response<B>) -> Option<HeaderValue>
where
    B: HttpBody,
{
    response
        .body()
        .size_hint()
        .exact()
        .map(|size| HeaderValue::from_str(&size.to_string()).unwrap())
}
