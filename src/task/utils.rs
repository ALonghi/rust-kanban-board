use std::str::FromStr;

use axum::extract::FromRef;
use chrono::Utc;
use mongodb::bson::doc;
// don't forget this!
use tokio_stream::StreamExt;
use uuid::Uuid;

use crate::error::Result;
use crate::error::{AppError, TaskRepoError};
use crate::task::model::{Task, TaskStatus};
use crate::util::get_optional_uuid;

pub async fn parse_tasks(
    mut cursor: mongodb::Cursor<bson::document::Document>,
) -> Result<Vec<Task>> {
    let mut result: Vec<Task> = Vec::new();
    while let Some(doc) = cursor.next().await {
        result.push(doc_to_task(&doc?)?);
    }
    Ok(result)
}

pub fn doc_to_task(doc: &bson::document::Document) -> Result<Task> {
    let id = doc.get_str("id")?;
    let title = doc.get_str("title")?;
    let description = doc.get_str("description").ok();
    let status = doc.get_str("status").ok().map(|v| v.to_string());
    let group_id = get_optional_uuid(doc, "group_id");
    let board_id = doc.get_str("board_id")?;
    let created_at = bson::DateTime::from_ref(doc.get_datetime("created_at")?);
    let updated_at = doc
        .get_datetime("updated_at")
        .ok()
        .map(|v| chrono::DateTime::from(*v));
    match (Uuid::from_str(id), Uuid::from_str(board_id)) {
        (Ok(task_uuid), Ok(board_uuid)) => Ok(Task {
            id: task_uuid,
            title: title.to_owned(),
            description: description.map(|d| d.to_string()),
            status: status.and_then(|s: String| TaskStatus::from_str(s.as_str()).ok()),
            group_id,
            board_id: board_uuid,
            created_at: chrono::DateTime::from(created_at),
            updated_at,
        }),
        _ => Err(AppError::TaskRepo(TaskRepoError::DecodeError(format!(
            "Task doesnt have id or board_id {} {}",
            id, board_id
        )))),
    }
}

pub fn task_to_doc(task: &Task) -> bson::document::Document {
    let doc = doc! {
        "id" : task.id.clone().to_string(),
        "title" : task.title.clone(),
        "description" : task.description.clone(),
        "status" : task.status.clone().map(|v| v.to_string()),
        "group_id" : task.group_id.map(|v| v.to_string()),
        "board_id" : task.board_id.to_string(),
        "created_at" : <chrono::DateTime<Utc> as Into<bson::DateTime>>::into(task.created_at),
        "updated_at" : Utc::now()
    };
    return doc;
}
