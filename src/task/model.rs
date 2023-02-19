use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

use crate::dto::CreateTaskRequest;

#[skip_serializing_none]
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Task {
    pub id: uuid::Uuid,
    pub title: String,
    pub description: Option<String>,
    pub column_id: Option<uuid::Uuid>,
    pub above_task_id: Option<uuid::Uuid>,
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
            column_id: r.column_id,
            above_task_id: r.above_task_id,
            board_id: r.board_id,
            created_at: Utc::now(),
            updated_at: None,
        }
    }
}

#[skip_serializing_none]
#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct SortedTask {
    pub id: uuid::Uuid,
    pub title: String,
    pub description: Option<String>,
    pub column_id: Option<uuid::Uuid>,
    pub above_task_id: Option<uuid::Uuid>,
    pub position: usize,
    pub board_id: uuid::Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Task {
    pub fn to_sorted(&self, index: usize) -> SortedTask {
        SortedTask {
            id: self.id,
            title: self.title.clone(),
            description: self.description.clone(),
            column_id: self.column_id,
            above_task_id: self.above_task_id,
            position: index,
            board_id: self.board_id,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}
