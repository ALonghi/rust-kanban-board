use chrono::{DateTime, Utc};

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Board {
    pub id: uuid::Uuid,
    pub title: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>
}