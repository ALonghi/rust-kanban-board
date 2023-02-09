use crate::dto::CreateTaskRequest;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use strum_macros::{Display, EnumString};

#[derive(Serialize, Deserialize, Debug, Clone, Copy, Display, EnumString)]
pub enum TaskStatus {
    #[strum(serialize = "to_do")]
    ToDo,
    #[strum(serialize = "in_progress")]
    InProgress,
    #[strum(serialize = "in_review")]
    InReview,
    #[strum(serialize = "done")]
    Done,
}

#[skip_serializing_none]
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Task {
    pub id: uuid::Uuid,
    pub title: String,
    pub description: Option<String>,
    pub status: Option<TaskStatus>,
    pub group_id: Option<uuid::Uuid>,
    pub board_id: uuid::Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Task {
    pub fn from_request(r: CreateTaskRequest) -> Self {
        Self {
            id: uuid::Uuid::new_v4(),
            title: r.title,
            description: r.description,
            status: r.status,
            group_id: r.group_id,
            board_id: r.board_id,
            created_at: Utc::now(),
            updated_at: None,
        }
    }
}
