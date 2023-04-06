use std::collections::LinkedList;

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use chrono::Utc;
use itertools::Itertools;
use tracing::log::info;
use tracing::{debug, error};

use crate::config::AppState;
use crate::dto::{CreateTaskRequest, Response};
use crate::task::model::{SortedTask, Task};
use crate::task::service;
use crate::task::utils::map_task_db_to_linked;

// Returns all tasks
#[axum_macros::debug_handler]
pub async fn get_tasks_handler(State(state): State<AppState>) -> impl IntoResponse {
    debug!("Getting all tasks");
    match service::get_all_tasks(state.get_tasks_collection()).await {
        Ok(tasks) => {
            let task_hierarchy: LinkedList<SortedTask> = map_task_db_to_linked(tasks);
            (
                StatusCode::OK,
                Json(Response {
                    success: true,
                    data: Some(task_hierarchy),
                    error_message: None,
                }),
            )
        }
        Err(e) => {
            let msg = format!(
                "[get_tasks_handler] Error getting all tasks: {:?}",
                e.to_string()
            );
            error!("{}", msg);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(Response {
                    success: false,
                    data: None,
                    error_message: Some(msg),
                }),
            )
        }
    }
}

// Returns all tasks for a board
#[axum_macros::debug_handler]
pub async fn get_board_tasks_handler(
    path: Path<String>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let board_id = path.0;
    debug!("Getting all tasks for board {}", board_id);
    match service::get_tasks(&board_id, state.get_tasks_collection()).await {
        Ok(tasks) => {
            let task_hierarchy: LinkedList<SortedTask> = map_task_db_to_linked(tasks);
            (
                StatusCode::OK,
                Json(Response {
                    success: true,
                    data: Some(task_hierarchy),
                    error_message: None,
                }),
            )
        }
        Err(e) => {
            let msg = format!(
                "[get_tasks_handler] Error getting tasks for board {}: {:?}",
                board_id,
                e.to_string()
            );
            error!("{}", msg);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(Response {
                    success: false,
                    data: None,
                    error_message: Some(msg),
                }),
            )
        }
    }
}

#[axum_macros::debug_handler]
pub async fn get_task_handler(
    path: Path<String>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let task_id = path.0;
    debug!("Getting task with id {}", task_id);
    match service::get_task(&task_id, state.get_tasks_collection()).await {
        Ok(task) => (
            StatusCode::OK,
            Json(Response {
                success: true,
                data: Some(task),
                error_message: None,
            }),
        ),
        Err(e) => {
            let msg = format!(
                "[get_tasks_handler] Error getting task with id {}: {:?}",
                task_id,
                e.to_string()
            );
            error!("{}", msg);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(Response {
                    success: false,
                    data: None,
                    error_message: Some(msg),
                }),
            )
        }
    }
}

// Creates new task
#[axum_macros::debug_handler]
pub async fn task_create_handler(
    State(state): State<AppState>,
    Json(req): Json<CreateTaskRequest>,
) -> impl IntoResponse {
    debug!(
        "[task_create_handler] Creating task ({}) for board {}",
        req.title, req.board_id
    );
    let task = Task::from_request(req);
    match service::create(&task, state.get_tasks_collection()).await {
        Ok(_) => (
            StatusCode::OK,
            Json(Response {
                success: true,
                data: Some(task),
                error_message: None,
            }),
        ),
        Err(e) => {
            let msg = format!(
                "[task_create_handler] Error creating task ({}) for board {}: {:?}",
                task.id,
                task.board_id,
                e.to_string()
            );
            error!("{}", msg);
            (
                StatusCode::BAD_REQUEST,
                Json(Response {
                    success: false,
                    data: None,
                    error_message: Some(msg),
                }),
            )
        }
    }
}

// Updates existing task
pub async fn task_update_handler(
    State(state): State<AppState>,
    Json(tasks): Json<Vec<Task>>,
) -> impl IntoResponse {
    let tasks_ids = &tasks
        .clone()
        .iter()
        .map(|t| t.id.to_string())
        .collect::<Vec<String>>();
    debug!(
        "[task_update_handler] Updating {} tasks {:?}",
        tasks_ids.len(),
        tasks_ids
    );
    let update_time = Utc::now();

    let updated_tasks = &tasks
        .into_iter()
        .map(|t| Task {
            updated_at: Some(update_time),
            ..t
        })
        .collect();

    match service::update_many(&updated_tasks, state).await {
        Ok(_) => (
            StatusCode::OK,
            Json(Response {
                success: true,
                data: Some(updated_tasks.clone()),
                error_message: None,
            }),
        ),
        Err(e) => {
            let msg = format!(
                "[task_create_handler] Error updating tasks ({:?}): {:?}",
                tasks_ids,
                e.to_string()
            );
            error!("{}", msg);
            (
                StatusCode::BAD_REQUEST,
                Json(Response {
                    success: false,
                    data: None,
                    error_message: Some(msg),
                }),
            )
        }
    }
}

// Deletes existing task
#[axum_macros::debug_handler]
pub async fn task_delete_handler(
    path: Path<String>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let task_id = path.0;
    debug!("[task_delete_handler] Deleting task {}", task_id);
    match service::delete(&task_id, state.get_tasks_collection()).await {
        Ok(_) => {
            let msg = format!("Deleted task with id {}", task_id);
            debug!("[task_delete_handler] {}", msg);
            (
                StatusCode::OK,
                Json(Response {
                    success: true,
                    data: Some(msg),
                    error_message: None,
                }),
            )
        }
        Err(e) => {
            let msg = format!("Error in deleting task {}: {}", task_id, e.to_string());
            error!("{}", msg);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(Response {
                    success: true,
                    data: None,
                    error_message: Some(msg),
                }),
            )
        }
    }
}
