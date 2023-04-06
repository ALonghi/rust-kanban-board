use mongodb::options::ClientOptions;
use mongodb::Client;

use crate::error::Result;

#[derive(Clone, Debug)]
pub struct DB {
    pub client: Client,
}

impl DB {
    pub async fn init() -> Result<Self> {
        let app_name = String::from("kanban-board-backend");
        let mut client_options = ClientOptions::parse(format!("mongodb+srv://root:TgjuOAwPkXlKrsSM@cluster0.d9l49vd.mongodb.net/?retryWrites=true&w=majority&appname={}", app_name)).await?;
        client_options.app_name = Some(app_name);
        Ok(Self {
            client: Client::with_options(client_options)?,
        })
    }
}
