use mongodb::bson;

use serde::Serialize;
use thiserror::Error;

pub mod handlers;

pub type Result<T> = std::result::Result<T, AppError>;
pub type WebResult<T> = std::result::Result<T, warp::reject::Rejection>;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("data error")]
    DataError,

    #[error("mongodb error: {0}")]
    MongoError(#[from] mongodb::error::Error),
    #[error("could not access field in document: {0}")]
    MongoDataError(#[from] bson::document::ValueAccessError),

    #[error("board not found")]
    BoardNotFound,
    #[error("article not found")]
    ArticleNotFoundError,
}

impl warp::reject::Reject for AppError {}

#[derive(Serialize, Debug)]
struct ErrorResponse {
    message: String,
    status: String,
}

#[derive(Error, Debug)]
pub enum TaskError {
    #[error("could not create task")]
    CreateError,
    #[error("could not update task")]
    UpdateError,
    #[error("could not delete task")]
    DeleteError,
}

impl warp::reject::Reject for TaskError {}

#[derive(Error, Debug)]
pub enum TaskGroupError {
    #[error("could not create task group")]
    CreateError,
    #[error("could not update task group")]
    UpdateError,
    #[error("could not delete task group")]
    DeleteError,
}

impl warp::reject::Reject for TaskGroupError {}

#[derive(Error, Debug)]
pub enum BoardError {
    #[error("could not create board")]
    CreateError,
    #[error("could not update board")]
    UpdateError,
    #[error("could not delete board")]
    DeleteError,
}

impl warp::reject::Reject for BoardError {}
