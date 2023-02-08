use warp::{Filter, Reply};
use warp::filters::BoxedFilter;

use crate::{auth, environment};
use crate::auth::models::Role;
use crate::environment::Environment;
use crate::users::handlers;
use actix_web::{web, App, HttpServer, Responder, Route};

pub fn routes(_env: Environment) -> BoxedFilter<(impl Reply, )> {

    web::scope("/tasks")
        .route("/", web::Route())
}
