use chrono::Utc;
use serde_json::json;
use uuid::Uuid;
use warp::reject;
use warp::Reply;

use crate::auth::models::{AuthUser, Role};
use crate::config::Environment;
use crate::environment::Environment;
use crate::error::{AppError, TaskError, UserError, WebResult};
use crate::task::model::Task;
use crate::task::service;
use crate::users::models::{PasswordUpdateRequest, User};
use crate::users::service;
use crate::WebResult;

// Returns all tasks
pub async fn get_tasks_handler(board_id: Uuid, env: Environment) -> WebResult<impl Reply> {
    let result = service::get_tasks(board_id, env.db())
        .await
        .map_err(|e| reject::custom(e))?;
    Ok(warp::reply::json(&result))
}

// Creates new task
pub async fn task_create_handler(req: Task, env: Environment) -> WebResult<impl Reply> {
    println!(
        "[task_create_handler] Creating task {} {}",
        req.id, req.title
    );
    match service::create(req, _env.db()).await {
        Err(_e) => _e,
        Ok(existing) => {
            return Ok(warp::reply::json(
                &json!({"status":"error", "message":"Unable to create task, id already exists."}),
            ));
        }
    }
}

// Updates existing task
pub async fn task_update_handler(req: Task, env: Environment) -> WebResult<impl Reply> {
    println!("[task_update_handler] Updating task {}", req.id);
    let _result = service::update(req, _env.db())
        .await
        .map(|_e| TaskError::UpdateError);
    Ok(warp::reply::json(
        &json!({"status":"success", "message":"Task updated"}),
    ))
}

// Deletes existing task
pub async fn task_delete_handler(req: Task, env: Environment) -> WebResult<impl Reply> {
    println!("[task_update_handler] Updating task {}", req.id);
    let _result = service::delete(req.id, env.db())
        .await
        .map(|_e| TaskError::DeleteError);
    Ok(warp::reply::json(
        &json!({"status":"success", "message":"Task deleted"}),
    ))
}
