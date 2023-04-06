use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use std::collections::LinkedList;

use crate::task::model::SortedTask;
use crate::{board::model::BoardColumn, task::model::Task};

#[skip_serializing_none]
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Response<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error_message: Option<String>,
}

#[skip_serializing_none]
#[derive(Deserialize, Debug, Clone)]
pub struct CreateTaskRequest {
    pub title: String,
    pub description: Option<String>,
    pub column_id: Option<uuid::Uuid>,
    pub above_task_id: Option<uuid::Uuid>,
    pub board_id: uuid::Uuid,
}

#[skip_serializing_none]
#[derive(Deserialize, Debug, Clone)]
pub struct CreateBoardRequest {
    pub title: String,
    pub description: Option<String>,
}

#[skip_serializing_none]
#[derive(Deserialize, Debug, Clone)]
pub struct UpdateBoardRequest {
    pub id: uuid::Uuid,
    pub title: String,
    pub description: Option<String>,
    pub columns: Vec<UpdateBoardRequestColumn>,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[skip_serializing_none]
#[derive(Clone, Deserialize, Debug)]
pub struct UpdateBoardRequestColumn {
    pub id: Option<uuid::Uuid>,
    pub name: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[skip_serializing_none]
#[derive(Clone, Deserialize, Debug)]
pub struct CreateBoardColumnRequest {
    pub title: String,
    pub items: Vec<Task>,
    pub was_unassigned: Option<bool>,
}

#[skip_serializing_none]
#[derive(Clone, Serialize, Debug)]
pub struct CreateBoardColumnResponse {
    pub column: BoardColumn,
    pub items: LinkedList<SortedTask>,
}
