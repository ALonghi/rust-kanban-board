use std::convert::Infallible;

use warp::{http::StatusCode, Reply};

use crate::error::{AppError, BoardError, ErrorResponse, TaskError, TaskGroupError, UserError};

pub async fn error_handler(
    err: warp::reject::Rejection,
) -> std::result::Result<impl Reply, Infallible> {
    let (code, message) = if err.is_not_found() {
        println!("[error_handler] Not found");
        (StatusCode::NOT_FOUND, "Not Found".to_string())
    } else if let Some(e) = err.find::<AppError>() {
        println!("[error_handler] AppError {:?}", e.to_string());

        match e {
            AppError::ArticleNotFoundError => (StatusCode::BAD_REQUEST, e.to_string()),
            _ => (StatusCode::BAD_REQUEST, e.to_string()),
        }
    } else if let Some(e) = err.find::<TaskError>() {
        println!("[error_handler] TaskError {:?}", e.to_string());
        match e {
            TaskError::CreateError => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
            _ => (StatusCode::BAD_REQUEST, e.to_string()),
        }
    } else if let Some(e) = err.find::<TaskGroupError>() {
        println!("[error_handler] TaskGroupError {:?}", e.to_string());
        match e {
            TaskGroupError::CreateError => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
            _ => (StatusCode::BAD_REQUEST, e.to_string()),
        }
    } else if let Some(e) = err.find::<BoardError>() {
        println!("[error_handler] BoardError {:?}", e.to_string());
        match e {
            BoardError::CreateError => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
            _ => (StatusCode::BAD_REQUEST, e.to_string()),
        }
    } else if let Some(err) = err.find::<warp::reject::MethodNotAllowed>() {
        println!("[error_handler] Method not allowed");
        (StatusCode::METHOD_NOT_ALLOWED, err.to_string())
    } else {
        println!("[error_handler] Unhandled: {:?}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Internal Server Error".to_string(),
        )
    };

    let json = warp::reply::json(&ErrorResponse {
        status: code.to_string(),
        message,
    });

    Ok(warp::reply::with_status(json, code))
}
