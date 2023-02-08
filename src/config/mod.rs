use std::convert::Infallible;
use std::net::SocketAddr;

use mongodb::{options::ClientOptions, Client, Database};
use warp::Filter;

#[derive(Clone, Debug)]
pub struct Environment {
    db_pool: Client,
    config: Args,
}

#[derive(Clone, Debug)]
pub struct Args {
    debug: bool,
    db_url: String,
    db_name: String,
    pub host: SocketAddr,
}

impl Environment {
    pub async fn new() -> anyhow::Result<Self> {
        let args = Args::parse();
        let Args {
            db_url, db_name, ..
        } = &args;

        println!("DB URL: {:?}", &db_url);
        let mut db_config = ClientOptions::parse(db_url).await?;
        db_config.app_name = Some(String::from(db_name));
        db_config.server_selection_timeout = Some(std::time::Duration::new(5, 0));
        let db_pool = Client::with_options(db_config)?;

        Ok(Self {
            db_pool,
            config: args,
        })
    }

    pub fn db(&self) -> Database {
        let db = self.db_pool.database("rust-crud");
        return db;
    }

    pub fn config(&self) -> &Args {
        &self.config
    }
}

pub fn with_env(
    env: Environment,
) -> impl Filter<Extract = (Environment,), Error = Infallible> + Clone {
    warp::any().map(move || env.clone())
}
