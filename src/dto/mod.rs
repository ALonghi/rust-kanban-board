use crate::task::model::TaskStatus;
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

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
    pub status: Option<TaskStatus>,
    pub group_id: Option<uuid::Uuid>,
    pub board_id: uuid::Uuid,
}
