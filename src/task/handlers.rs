// use axum::body::Body;

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;

use crate::config::AppState;
use crate::dto::{CreateTaskRequest, Response};
use crate::task::model::Task;
use crate::task::service;

// Returns all tasks
#[axum_macros::debug_handler]
pub async fn get_tasks_handler(State(state): State<AppState>) -> impl IntoResponse {
    println!("Getting all tasks");
    match service::get_all_tasks(state.get_tasks_collection()).await {
        Ok(tasks) => (
            StatusCode::OK,
            Json(Response {
                success: true,
                data: Some(tasks),
                error_message: None,
            }),
        ),
        Err(e) => {
            let msg = format!(
                "[get_tasks_handler] Error getting all tasks: {:?}",
                e.to_string()
            );
            println!("{}", msg);
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
    println!("Getting all tasks for board {}", board_id);
    match service::get_tasks(&board_id, state.get_tasks_collection()).await {
        Ok(tasks) => (
            StatusCode::OK,
            Json(Response {
                success: true,
                data: Some(tasks),
                error_message: None,
            }),
        ),
        Err(e) => {
            let msg = format!(
                "[get_tasks_handler] Error getting tasks for board {}: {:?}",
                board_id,
                e.to_string()
            );
            println!("{}", msg);
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
    println!("Getting task with id {}", task_id);
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
            println!("{}", msg);
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
    println!(
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
            println!("{}", msg);
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
    Json(task): Json<Task>,
) -> impl IntoResponse {
    println!(
        "[task_update_handler] Updating task ({}) for board {}",
        task.id, task.board_id
    );
    match service::update(&task, state.get_tasks_collection()).await {
        Ok(t) => (
            StatusCode::OK,
            Json(Response {
                success: true,
                data: Some(t),
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
            println!("{}", msg);
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
    println!("[task_delete_handler] Deleting task {}", task_id);
    match service::delete(&task_id, state.get_tasks_collection()).await {
        Ok(_) => {
            let msg = format!("Deleted task with id {}", task_id);
            println!("[task_delete_handler] {}", msg);
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
            println!("{}", msg);
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
