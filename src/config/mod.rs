use bson::Document;
use clap::Parser;
use mongodb::{Client, Collection, Database};

/// Simple key/value store with an HTTP API
#[derive(Debug, Parser)]
pub struct Config {
    /// The port to listen on
    #[clap(short = 'p', long, default_value = "3000")]
    pub port: u16,
}

#[derive(Clone, Debug)]
pub struct AppState {
    pub client: Client,
}

const DB_NAME: &str = "rust-kanban-board";

impl AppState {
    pub fn get_database(&self) -> Database {
        self.client.database(DB_NAME)
    }

    pub fn get_tasks_collection(&self) -> Collection<Document> {
        self.get_database().collection("tasks")
    }
}
