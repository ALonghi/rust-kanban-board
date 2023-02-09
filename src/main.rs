use std::net::{Ipv4Addr, SocketAddr};

use clap::Parser;

use crate::config::Config;
use crate::server::app;

mod config;
mod db;
mod dto;
mod error;
mod routes;
mod server;
mod task;
mod util;

#[tokio::main]
async fn main() {
    // Setup tracing
    tracing_subscriber::fmt::init();

    // Parse command line arguments
    let config = Config::parse();

    // Run our service
    let addr = SocketAddr::from((Ipv4Addr::UNSPECIFIED, config.port));
    tracing::info!("Listening on {}", addr);
    let app = app().await.unwrap();
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .expect("server error");
}
