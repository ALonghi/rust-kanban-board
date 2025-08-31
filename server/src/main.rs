use std::net::{Ipv4Addr, SocketAddr};

use clap::Parser;
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

use crate::config::Config;
use crate::server::app;

mod board;
mod config;
mod db;
mod dto;
mod error;
mod routes;
mod server;
mod task;
mod util;

#[derive(Clone, Debug)]
pub struct EnvVars {
    mongo_uri: String,
}

#[tokio::main]
async fn main() {
    // Setup tracing
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::DEBUG)
        .finish();
    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    let env_vars = EnvVars {
        mongo_uri: std::env::var("MONGO_URI").expect("MONGO_URI environment variable must be set."),
    };
    // Parse command line arguments
    let config = Config::parse();

    // Run our service
    let addr = SocketAddr::from((Ipv4Addr::UNSPECIFIED, config.port));
    info!("listening on {}", addr);

    let app = app(env_vars).await.unwrap();
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .expect("server error");
}
