use std::str::FromStr;

use axum::extract::FromRef;
use chrono::Utc;
use mongodb::bson::doc;
// don't forget this!
use tokio_stream::StreamExt;
use uuid::Uuid;

use crate::board::model::{Board, BoardColumn};
use crate::error::AppError;
use crate::error::{BoardRepoError, Result};

pub async fn parse_boards(
    mut cursor: mongodb::Cursor<bson::document::Document>,
) -> Result<Vec<Board>> {
    let mut result: Vec<Board> = Vec::new();
    while let Some(doc) = cursor.next().await {
        result.push(doc_to_board(&doc?)?);
    }
    Ok(result)
}

pub fn doc_to_board(doc: &bson::document::Document) -> Result<Board> {
    let id = doc.get_str("id")?;
    let title = doc.get_str("title")?;
    let description = doc.get_str("description").ok();
    let columns: Vec<BoardColumn> = get_board_columns(doc);
    let created_at = bson::DateTime::from_ref(doc.get_datetime("created_at")?);
    let updated_at = doc
        .get_datetime("updated_at")
        .ok()
        .map(|v| chrono::DateTime::from(*v));
    match Uuid::from_str(id) {
        Ok(board_id) => Ok(Board {
            id: board_id,
            title: title.to_owned(),
            description: description.map(|d| d.to_string()),
            columns,
            created_at: chrono::DateTime::from(created_at),
            updated_at,
        }),
        _ => Err(AppError::BoardRepo(BoardRepoError::DecodeError(format!(
            "Board doesnt have id {}",
            id
        )))),
    }
}

fn doc_to_board_column(doc: &bson::document::Document) -> Result<BoardColumn> {
    let id = doc.get_str("id")?;
    let name = doc.get_str("name")?;
    let created_at = bson::DateTime::from_ref(doc.get_datetime("created_at")?);
    let updated_at = doc
        .get_datetime("updated_at")
        .ok()
        .map(|v| chrono::DateTime::from(*v));
    match Uuid::from_str(id) {
        Ok(board_stage_id) => Ok(BoardColumn {
            id: board_stage_id,
            name: name.to_owned(),
            created_at: chrono::DateTime::from(created_at),
            updated_at,
        }),
        _ => Err(AppError::BoardRepo(BoardRepoError::DecodeError(format!(
            "Board stage doesnt have id {}",
            id
        )))),
    }
}

fn map_columns_to_docs(board_columns: &Vec<BoardColumn>) -> Vec<bson::document::Document> {
    return board_columns
        .into_iter()
        .map(|stage| doc! {
            "id" : stage.id.to_string(),
            "name" : stage.name.clone(),
            "created_at" : <chrono::DateTime<Utc> as Into<bson::DateTime>>::into(stage.created_at),
            "updated_at" : stage.updated_at.map(|v| <chrono::DateTime<Utc> as Into<bson::DateTime>>::into(v)).clone(),
            })
        .clone()
        .collect();
}

fn get_board_columns(doc: &bson::document::Document) -> Vec<BoardColumn> {
    doc.get_array("columns")
        .ok()
        .unwrap_or(&Vec::new())
        .into_iter()
        .map(|entry| {
            entry
                .as_document()
                .and_then(|d| doc_to_board_column(d).ok())
                .unwrap()
        })
        .collect()
}

pub fn board_to_doc(board: &Board) -> bson::document::Document {
    doc! {
        "id" : board.id.clone().to_string(),
        "title" : board.title.clone(),
        "description" : board.description.clone(),
        "columns" : map_columns_to_docs(&board.columns),
        "created_at" : <chrono::DateTime<Utc> as Into<bson::DateTime>>::into(board.created_at),
        "updated_at" : board.updated_at.map(|v| <chrono::DateTime<Utc> as Into<bson::DateTime>>::into(v)).clone()
    }
}
