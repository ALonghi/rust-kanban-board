use std::io::Error;
use std::str::FromStr;

use chrono::Utc;
use mongodb::bson::doc;
use tokio::stream::StreamExt;
use uuid::Uuid;

use crate::auth::models::Role;
use crate::error::AppError;
use crate::task::model::{Task, TaskStatus};
use crate::users::models::User;
use crate::Result;

pub async fn parse_tasks(
    mut _cursor: mongodb::Cursor<Vec<Task>>,
) -> Result<Vec<Task>, AppError::DataError> {
    let mut result: Vec<Task> = Vec::new();
    while let Some(doc) = _cursor.next().await {
        result.push(doc_to_user(&doc?)?);
    }
    Ok(result)
}

pub fn doc_to_task(doc: &mongodb::bson::document::Document) -> Result<Task, AppError::DataError> {
    let id = doc.get_str("id")?;
    let name = doc.get_str("title")?;
    let description = doc.get_("description")?;
    let status = doc.get_str("status")?;
    let group_id = doc.get_str("group_id")?;
    let board_id = doc.get_str("board_id")?;
    let created_at = doc.get_datetime("created_at")?;
    let updated_at = doc.get_datetime("updated_at")?;
    match Uuid::from_str(id) {
        Some(uid) => Ok(Task {
            id: uid,
            title: name.to_owned(),
            description: description.to_owned(),
            status: TaskStatus::from_str(status).map_or(Option::None::TaskStatus, |s| Some(s)),
            group_id: Some(Uuid::from_str(group_id).unwrap_or(Option::None::Uuid)),
            board_id: Some(Uuid::from_str(board_id).unwrap_or(Option::None::Uuid)),
            created_at: *created_at.to_owned(),
            updated_at: Some(*updated_at.to_owned()),
        }),
        None => AppError::DataError,
    }
}

pub fn task_to_doc(task: &Task) -> mongodb::bson::document::Document {
    let doc = doc! {
        "id" : task.id.clone(),
        "title" : task.title.clone(),
        "description" : task.description.clone(),
        "status" : task.status.clone(),
        "group_id" : task.group_id.clone(),
        "board_id" : task.board_id.clone(),
        "created_at" : task.created_at.clone(),
        "updated_at" : Utc::now()
    };
    return doc;
}
