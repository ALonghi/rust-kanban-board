use std::borrow::Borrow;

use bson::{doc, Document};
use chrono::Utc;
use mongodb::Collection;

use crate::error::Result;
use crate::error::{AppError, TaskRepoError};
use crate::task::model::Task;
use crate::task::utils::{doc_to_task, parse_tasks, task_to_doc};

pub async fn get_all_tasks(collection: Collection<Document>) -> Result<Vec<Task>> {
    let mut cursor = collection.find(None, None).await.map_err(|_e| {
        println!("ERROR [get_tasks] {:?}", _e);
        return TaskRepoError::NotFound;
    })?;
    return parse_tasks(cursor).await;
}

pub async fn get_tasks(board_id: &String, collection: Collection<Document>) -> Result<Vec<Task>> {
    let filter = doc! { "board_id": board_id };
    let mut cursor = collection.find(filter, None).await.map_err(|_e| {
        println!("ERROR [get_tasks] {:?}", _e);
        return TaskRepoError::NotFound;
    })?;
    return parse_tasks(cursor).await;
}

pub async fn get_task(task_id: &String, collection: Collection<Document>) -> Result<Task> {
    let filter = doc! { "id": task_id };
    let task_opt = collection
        .find_one(filter, None)
        .await
        .map_err(|e| {
            println!(
                "Error while getting a task with id {}: {}",
                task_id,
                e.to_string()
            );
            AppError::MongoError(e)
        })?
        .and_then(|doc| doc_to_task(&doc).ok());

    match task_opt {
        Some(task) => Ok(task),
        None => {
            println!("task_opt is None!");
            Err(AppError::TaskRepo(TaskRepoError::NotFound))
        }
    }
}

pub async fn create(task: &Task, collection: Collection<Document>) -> Result<&Task> {
    println!("[create_task] Creating task with id={}", &task.id);
    let doc = task_to_doc(&task);
    collection.insert_one(doc, None).await.map_err(|_e| {
        println!("ERROR [create_task] {:?}", _e);
        return TaskRepoError::InvalidTask(_e.to_string());
    })?;
    Ok(task)
}

pub async fn update(task: &Task, collection: Collection<Document>) -> Result<Task> {
    println!("[update_task] Updating task with id={}", &task.id);
    let task_id = &task.id.to_string();
    let update_time = Utc::now();
    let updated = Task {
        updated_at: Some(update_time),
        ..task.clone()
    };

    let filter = doc! { "id": task_id };
    let updates = doc! { "$set": {
        "title" : &updated.title.clone(),
        "description" : &updated.description.clone(),
        "status" : &updated.status.map(|v| v.to_string()),
        "group_id" : &updated.group_id.map(|v| v.to_string()),
        "board_id" : &updated.board_id.to_string(),
        "created_at" : &updated.created_at.clone(),
        "updated_at": update_time
    }
    };
    collection
        .update_one(filter, updates, None)
        .await
        .map(|res| {
            return if res.modified_count == 1 {
                Ok(())
            } else {
                Err(AppError::TaskRepo(TaskRepoError::InvalidTask(format!(
                    "modified_count = {:?} on {}",
                    res.modified_count, res.matched_count
                ))))
            };
        })
        .map_err(|_e| {
            println!("ERROR [update_task] {:?}", _e);
            return AppError::MongoError(_e);
        })?
        .expect("uff....");

    Ok(updated)
}

pub async fn delete(task_id: &String, collection: Collection<Document>) -> Result<()> {
    println!("[delete_task] Deleting task with id={}", task_id);
    let filter = doc! { "id": task_id };
    collection.delete_one(filter, None).await?;
    Ok(())
}
