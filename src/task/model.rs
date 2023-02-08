use chrono::{DateTime, Utc};
use std::str::FromStr;

#[derive(Serialize, Deserialize, Debug)]
pub enum TaskStatus {
    ToDo,
    InProgress,
    InReview,
    Done,
}

impl FromStr for TaskStatus {
    type Err = ();

    fn from_str(input: &str) -> Result<TaskStatus, Self::Err> {
        match input {
            "ToDo" => Ok(TaskStatus::ToDo),
            "InProgress" => Ok(TaskStatus::InProgress),
            "InReview" => Ok(TaskStatus::InReview),
            "Done" => Ok(TaskStatus::Done),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Task {
    pub id: uuid::Uuid,
    pub title: String,
    pub description: Option<String>,
    pub status: Option<TaskStatus>,
    pub group_id: Option<uuid::Uuid>,
    pub board_id: Option<uuid::Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}
