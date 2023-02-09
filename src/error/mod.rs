use thiserror::Error;

pub type Result<T> = std::result::Result<T, AppError>;

/// Our app's top level error type.
#[derive(Error, Debug)]
pub enum AppError {
    /// Something went wrong when calling the task repo.
    #[error("action in task repo failed")]
    TaskRepo(TaskRepoError),
    #[error("mongodb error: {0}")]
    MongoError(#[from] mongodb::error::Error),
    #[error("could not access field in document: {0}")]
    MongoDataError(#[from] bson::document::ValueAccessError),
}

/// Errors that can happen when using the task repo.
#[derive(Error, Debug)]
pub enum TaskRepoError {
    #[allow(dead_code)]
    #[error("task not found")]
    NotFound,
    #[allow(dead_code)]
    #[error("task is invalid: {0}")]
    InvalidTask(String),
    #[allow(dead_code)]
    #[error("decoding task resulted in an error: {0}")]
    DecodeError(String),
    #[allow(dead_code)]
    #[error("database error: {0}")]
    DatabaseError(String),
}

/// This makes it possible to use `?` to automatically convert a `TaskRepoError`
/// into an `AppError`.
impl From<TaskRepoError> for AppError {
    fn from(inner: TaskRepoError) -> Self {
        AppError::TaskRepo(inner)
    }
}
