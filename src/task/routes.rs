use warp::filters::BoxedFilter;
use warp::{Filter, Reply};

use crate::auth::models::Role;
use crate::config::Environment;
use crate::environment::Environment;
use crate::task::handlers;
use crate::{auth, config, environment};

pub fn routes(_env: Environment) -> BoxedFilter<(impl Reply,)> {
    let get_tasks_route = warp::get().and(
        warp::path!("api" / "boards" / String / "tasks")
            .and(config::with_env(_env.clone()))
            .and_then(handlers::get_tasks_handler),
    );

    let create_task_route = warp::post().and(
        warp::path!("api" / "tasks")
            .and(warp::body::json())
            .and(config::with_env(_env.clone()))
            .and_then(handlers::task_create_handler),
    );

    let update_task_route = warp::patch().and(
        warp::path!("api" / "tasks")
            .and(warp::body::json())
            .and(config::with_env(_env.clone()))
            .and_then(handlers::task_update_handler),
    );

    let delete_task_route = warp::delete().and(
        warp::path!("api" / "tasks" / String)
            .and(config::with_env(_env.clone()))
            .and_then(handlers::task_delete_handler),
    );

    let routes = get_tasks_route
        .or(create_task_route)
        .or(update_task_route)
        .or(delete_task_route);

    routes.boxed();
}
