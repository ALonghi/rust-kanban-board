// use axum::body::Body;

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use bson::DateTime;
use chrono::Utc;
use futures::TryFutureExt;
use tracing::{debug, error};

use crate::board::model::{Board, BoardColumn};
use crate::board::service as board_service;
use crate::board::utils::{create_and_add_column_to, filter_column_from};
use crate::config::AppState;
use crate::dto::{
    CreateBoardColumnRequest, CreateBoardColumnResponse, CreateBoardRequest, CreateTaskRequest,
    Response, UpdateBoardRequest,
};
use crate::error::{AppError, BoardRepoError, TaskRepoError};
use crate::task::model::Task;
use crate::task::service as task_service;
use crate::task::utils::{build_hierarchy_set, map_task_db_to_linked};

// Returns all tasks
#[axum_macros::debug_handler]
pub async fn get_boards_handler(State(state): State<AppState>) -> impl IntoResponse {
    debug!("Getting all boards");
    match board_service::get_all_boards(state.get_boards_collection()).await {
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
    match board_service::get_board(&board_id, state.get_boards_collection()).await {
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
    match board_service::create(&board, state.get_boards_collection()).await {
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

#[axum_macros::debug_handler]
pub async fn board_create_column_handler(
    path: Path<String>,
    State(state): State<AppState>,
    Json(req): Json<CreateBoardColumnRequest>,
) -> impl IntoResponse {
    let board_id = path.0;
    debug!(
        "[board_create_column_handler] Creating board column with title ({:?}) for board ({})",
        req, board_id
    );

    async fn match_and_update(
        board_id: &String,
        req: &CreateBoardColumnRequest,
        state: AppState,
    ) -> Result<CreateBoardColumnResponse, AppError> {
        match board_service::get_board(&board_id, state.get_boards_collection()).await {
            Ok(board) => match create_and_add_column_to(board, req.clone()).await {
                Ok((updated_board, new_column)) => {
                    match board_service::update(&updated_board, state.get_boards_collection()).await
                    {
                        Ok(_) => {
                            let mapped = req
                                .items
                                .iter()
                                .map(|task| Task {
                                    column_id: Some(new_column.id.clone()),
                                    ..task.clone()
                                })
                                .collect::<Vec<Task>>();
                            if let Ok(_) = task_service::update_many(&mapped.clone(), state).await {
                                Ok(CreateBoardColumnResponse {
                                    column: new_column,
                                    items: map_task_db_to_linked(mapped.clone()),
                                })
                            } else {
                                Err(AppError::TaskRepo(TaskRepoError::TransactionError(
                                    String::from("Coudnt complete update of tasks"),
                                )))
                            }
                        }
                        Err(e) => Err(e),
                    }
                }
                Err(e) => Err(e),
            },
            Err(e) => Err(e),
        }
    }

    match match_and_update(&board_id, &req, state).await {
        Ok(data) => (
            StatusCode::OK,
            Json(Response {
                success: true,
                data: Some(data),
                error_message: None,
            }),
        ),
        Err(e) => {
            let msg = format!(
                "[board_create_column_handler] Error creating board column ({}) ({:?}) : {:?}",
                board_id,
                req,
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

#[axum_macros::debug_handler]
pub async fn board_delete_column_handler(
    Path((board_id, column_id)): Path<(uuid::Uuid, uuid::Uuid)>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    debug!(
        "[board_delete_column_handler] Deleting board column with id ({:?}) for board ({:?})",
        column_id, board_id
    );

    async fn match_and_update(
        board_id: &String,
        column_id: &uuid::Uuid,
        state: AppState,
    ) -> Result<Board, AppError> {
        match board_service::get_board(&board_id, state.get_boards_collection()).await {
            Ok(board) => {
                let filtered_board = filter_column_from(board, column_id.clone());
                match board_service::update(&filtered_board, state.get_boards_collection()).await {
                    Ok(updated_board) => {
                        debug!("Correctly updated board {:?}", filtered_board);
                        if let Ok(_) = task_service::delete_tasks_of_column(
                            &column_id.to_string(),
                            state.get_tasks_collection(),
                        )
                        .await
                        {
                            debug!("Correctly deleted tasks after deletion of column board with id {:?}", column_id);
                            Ok(updated_board)
                        } else {
                            debug!("Error int deleting tasks after deletion of column board with id {:?}", column_id);
                            Err(AppError::TaskRepo(TaskRepoError::TransactionError(
                                String::from("Couldnt complete delete of column tasks"),
                            )))
                        }
                    }
                    Err(e) => Err(e),
                }
            }
            Err(e) => Err(e),
        }
    }

    match match_and_update(&board_id.to_string(), &column_id, state).await {
        Ok(data) => (
            StatusCode::OK,
            Json(Response {
                success: true,
                data: Some(data),
                error_message: None,
            }),
        ),
        Err(e) => {
            let msg = format!(
                "[board_delete_column_handler] Error deleting board column ({}) ({:?}) : {:?}",
                column_id,
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

// Updates existing task
pub async fn board_update_handler(
    State(state): State<AppState>,
    Json(req): Json<UpdateBoardRequest>,
) -> impl IntoResponse {
    let board_id = req.id.to_string();
    debug!("[board_update_handler] Updating board {}", board_id);
    let board = Board::from_update_request(req);
    match board_service::update(&board, state.get_boards_collection()).await {
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
    match board_service::delete(&board_id, state.get_boards_collection()).await {
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
