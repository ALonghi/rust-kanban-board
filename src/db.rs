use crate::error::Result;
use mongodb::options::ClientOptions;
use mongodb::Client;

#[derive(Clone, Debug)]
pub struct DB {
    pub client: Client,
}

impl DB {
    pub async fn init() -> Result<Self> {
        let mut client_options = ClientOptions::parse("mongodb://127.0.0.1:27017").await?;
        client_options.app_name = Some("booky".to_string());
        Ok(Self {
            client: Client::with_options(client_options)?,
        })
    }
}
