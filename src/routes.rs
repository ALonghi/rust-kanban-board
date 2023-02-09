use axum::routing::{delete, get, post};
use axum::Router;

use crate::config::AppState;
use crate::task::handlers::{
    get_board_tasks_handler, get_task_handler, get_tasks_handler, task_create_handler,
    task_delete_handler,
};

pub fn get_routes() -> Router<AppState> {
    let api_routes: Router<AppState> = Router::new()
        .route("/tasks", get(get_tasks_handler).post(task_create_handler))
        .route(
            "/tasks/:task_id",
            get(get_task_handler).delete(task_delete_handler),
        )
        .route("/boards/:board_id/tasks", get(get_board_tasks_handler));

    Router::new().nest("/api", api_routes)
}
