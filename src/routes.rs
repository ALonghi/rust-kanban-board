use axum::routing::{delete, get, post};
use axum::Router;

use crate::board::handlers::{
    board_create_handler, board_delete_handler, board_update_handler, get_board_handler,
    get_boards_handler,
};
use crate::config::AppState;
use crate::task::handlers::{
    get_board_tasks_handler, get_task_handler, get_tasks_handler, task_create_handler,
    task_delete_handler, task_update_handler,
};

pub fn get_routes() -> Router<AppState> {
    let api_routes: Router<AppState> = Router::new()
        .route(
            "/tasks",
            get(get_tasks_handler)
                .post(task_create_handler)
                .put(task_update_handler),
        )
        .route(
            "/tasks/:task_id",
            get(get_task_handler).delete(task_delete_handler),
        )
        .route(
            "/boards",
            get(get_boards_handler)
                .post(board_create_handler)
                .put(board_update_handler),
        )
        .route(
            "/boards/:board_id",
            get(get_board_handler).delete(board_delete_handler),
        )
        .route("/boards/:board_id/tasks", get(get_board_tasks_handler));

    Router::new().nest("/api", api_routes)
}
