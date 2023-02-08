use std::error::Error;

use chrono::Utc;
use mongodb::bson::doc;
use mongodb::Database;

use crate::error::AppError;
use crate::model::model::Task;
use crate::task::model::Task;
use crate::task::utils::{parse_tasks, task_to_doc};
use crate::Result;

pub async fn get_tasks(board_id: uuid::Uuid, db: Database) -> Result<Vec<Task>, AppError> {
    let mut cursor = db
        .collection::<Vec<Task>>("tasks")
        .find(None, None)
        .await
        .map_err(|_e| {
            println!("ERROR [get_tasks] {:?}", _e);
            return AppError::DataError;
        })?;
    return parse_tasks(cursor).await;
}

pub async fn create(task: Task, db: Database) -> Result<Task, Error> {
    let doc = task_to_doc(&task);
    db.collection("tasks")
        .insert_one(doc, None)
        .await
        .map_err(|_e| {
            println!("ERROR [create_user] {:?}", _e);
            return AppError::DataError;
        })?;
    Ok(task)
}

pub async fn update(task: Task, db: Database) -> Result<Task, Error> {
    println!("[update_user] Searching task id={}", &task.id);
    let updated = Task {
        updated_at: Some(Utc::now()),
        ..task
    };

    let filter = doc! { "id": task.id };
    let updates = doc! { "$set": {
        "title" : &updated.title,
        "description" : &updated.description,
        "status" : &updated.status,
        "group_id" : &updated.group_id,
        "board_id" : &updated.board_id,
        "created_at" : &updated.created_at,
        "updated_at": updated.updated_at
    }
    };
    let _cursor = db
        .collection("tasks")
        .update_one(filter, updates, None)
        .await
        .map_err(|_e| {
            println!("ERROR [update_task] {:?}", _e);
            return AppError::DataError;
        })?;

    Ok(updated)
}

pub async fn delete(task_id: uuid::Uuid, db: Database) -> Result<(), Error> {
    let filter = doc! { "id": task_id };
    db.collection("articles")
        .delete_one(filter, None)
        .await
        .map_err(|_e| {
            println!("ERROR [get_article_by_url] {:?}", _e);
            return AppError::DataError;
        })?;
    Ok(())
}
