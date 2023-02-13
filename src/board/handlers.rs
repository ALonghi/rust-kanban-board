// use axum::body::Body;

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use tracing::{debug, error};

use crate::board::model::Board;
use crate::board::service;
use crate::config::AppState;
use crate::dto::{CreateBoardRequest, CreateTaskRequest, Response, UpdateBoardRequest};
use crate::task::model::Task;

// Returns all tasks
#[axum_macros::debug_handler]
pub async fn get_boards_handler(State(state): State<AppState>) -> impl IntoResponse {
    debug!("Getting all boards");
    match service::get_all_boards(state.get_boards_collection()).await {
        Ok(boards) => (
            StatusCode::OK,
            Json(Response {
                success: true,
                data: Some(boards),
                error_message: None,
            }),
        ),
        Err(e) => {
            let msg = format!(
                "[get_boards_handler] Error getting all boards: {:?}",
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
pub async fn get_board_handler(
    path: Path<String>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let board_id = path.0;
    debug!("Getting board with id {}", board_id);
    match service::get_board(&board_id, state.get_boards_collection()).await {
        Ok(board) => (
            StatusCode::OK,
            Json(Response {
                success: true,
                data: Some(board),
                error_message: None,
            }),
        ),
        Err(e) => {
            let msg = format!(
                "[get_board_handler] Error getting board with id {}: {:?}",
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

//
// // Returns all tasks for a board
// #[axum_macros::debug_handler]
// pub async fn get_board_tasks_handler(
//     path: Path<String>,
//     State(state): State<AppState>,
// ) -> impl IntoResponse {
//     let board_id = path.0;
//     debug!("Getting all tasks for board {}", board_id);
//     match service::get_tasks(&board_id, state.get_tasks_collection()).await {
//         Ok(tasks) => (
//             StatusCode::OK,
//             Json(Response {
//                 success: true,
//                 data: Some(tasks),
//                 error_message: None,
//             }),
//         ),
//         Err(e) => {
//             let msg = format!(
//                 "[get_tasks_handler] Error getting tasks for board {}: {:?}",
//                 board_id,
//                 e.to_string()
//             );
//             error!("{}", msg);
//             (
//                 StatusCode::INTERNAL_SERVER_ERROR,
//                 Json(Response {
//                     success: false,
//                     data: None,
//                     error_message: Some(msg),
//                 }),
//             )
//         }
//     }
// }
//
// #[axum_macros::debug_handler]
// pub async fn get_task_handler(
//     path: Path<String>,
//     State(state): State<AppState>,
// ) -> impl IntoResponse {
//     let task_id = path.0;
//     debug!("Getting task with id {}", task_id);
//     match service::get_task(&task_id, state.get_tasks_collection()).await {
//         Ok(task) => (
//             StatusCode::OK,
//             Json(Response {
//                 success: true,
//                 data: Some(task),
//                 error_message: None,
//             }),
//         ),
//         Err(e) => {
//             let msg = format!(
//                 "[get_tasks_handler] Error getting task with id {}: {:?}",
//                 task_id,
//                 e.to_string()
//             );
//             error!("{}", msg);
//             (
//                 StatusCode::INTERNAL_SERVER_ERROR,
//                 Json(Response {
//                     success: false,
//                     data: None,
//                     error_message: Some(msg),
//                 }),
//             )
//         }
//     }
// }
//
// Creates new task
#[axum_macros::debug_handler]
pub async fn board_create_handler(
    State(state): State<AppState>,
    Json(req): Json<CreateBoardRequest>,
) -> impl IntoResponse {
    debug!(
        "[task_board_handler] Creating board with title ({})",
        req.title
    );
    let board = Board::from_create_request(req);
    match service::create(&board, state.get_boards_collection()).await {
        Ok(_) => (
            StatusCode::OK,
            Json(Response {
                success: true,
                data: Some(board),
                error_message: None,
            }),
        ),
        Err(e) => {
            let msg = format!(
                "[task_board_handler] Error creating board ({}) : {:?}",
                board.id,
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
pub async fn board_update_handler(
    State(state): State<AppState>,
    Json(req): Json<UpdateBoardRequest>,
) -> impl IntoResponse {
    let board_id = req.id.to_string();
    debug!("[board_update_handler] Updating board {}", board_id);
    let board = Board::from_update_request(req);
    match service::update(&board, state.get_boards_collection()).await {
        Ok(b) => (
            StatusCode::OK,
            Json(Response {
                success: true,
                data: Some(b),
                error_message: None,
            }),
        ),
        Err(e) => {
            let msg = format!(
                "[board_update_handler] Error updating board {}: {:?}",
                board_id,
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
pub async fn board_delete_handler(
    path: Path<String>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let board_id = path.0;
    debug!("[task_delete_handler] Deleting board {}", board_id);
    match service::delete(&board_id, state.get_boards_collection()).await {
        Ok(_) => {
            let msg = format!("Deleted board with id {}", board_id);
            debug!("[board_delete_handler] {}", msg);
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
            let msg = format!("Error in deleting board {}: {}", board_id, e.to_string());
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
