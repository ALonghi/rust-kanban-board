use bson::{doc, Document};
use chrono::Utc;
use mongodb::Collection;
use tracing::{debug, error};

use crate::board::mapper::{board_to_doc, parse_boards};
use crate::board::model::Board;
use crate::error::AppError;
use crate::error::{BoardRepoError, Result, TaskRepoError};

use super::mapper::doc_to_board;

pub async fn get_all_boards(collection: Collection<Document>) -> Result<Vec<Board>> {
    let mut cursor = collection.find(None, None).await.map_err(|_e| {
        debug!("ERROR [get_tasks] {:?}", _e);
        return BoardRepoError::NotFound;
    })?;
    return parse_boards(cursor).await;
}

pub async fn create(board: &Board, collection: Collection<Document>) -> Result<&Board> {
    debug!("[create_board] Creating board with id={}", &board.id);
    let doc = board_to_doc(board);
    collection.insert_one(doc, None).await.map_err(|_e| {
        error!("ERROR [create_board] {:?}", _e);
        return BoardRepoError::InvalidBoard(_e.to_string());
    })?;
    Ok(board)
}

pub async fn get_board(board_id: &String, collection: Collection<Document>) -> Result<Board> {
    let filter = doc! { "id": board_id };
    let board_opt = collection
        .find_one(filter, None)
        .await
        .map_err(|e| {
            debug!(
                "Error while getting a board with id {}: {}",
                board_id,
                e.to_string()
            );
            AppError::MongoError(e)
        })?
        .and_then(|doc| doc_to_board(&doc).ok());

    match board_opt {
        Some(board) => Ok(board),
        None => {
            debug!("board_opt is None!");
            Err(AppError::TaskRepo(TaskRepoError::NotFound))
        }
    }
}

pub async fn update(board: &Board, collection: Collection<Document>) -> Result<Board> {
    debug!("[update_board] Updating board with id={}", board.id);
    let board_id = &board.id.to_string();
    let update_time = Utc::now();
    let updated = Board {
        updated_at: Some(update_time),
        ..board.clone()
    };

    let filter = doc! { "id": board_id };
    let updates = doc! { "$set": board_to_doc(&updated) };

    collection
        .update_one(filter, updates, None)
        .await
        .map(|res| {
            return if res.modified_count == 1 {
                Ok(())
            } else {
                Err(AppError::BoardRepo(BoardRepoError::InvalidBoard(format!(
                    "modified_count = {:?} on {}",
                    res.modified_count, res.matched_count
                ))))
            };
        })
        .map_err(|_e| {
            debug!("ERROR [update_board] {:?}", _e);
            return AppError::MongoError(_e);
        })?
        .expect(format!("Coudn't update board {}", board_id).as_str());

    Ok(updated)
}

pub async fn delete(board_id: &String, collection: Collection<Document>) -> Result<()> {
    debug!("[delete_board] Deleting board with id={}", board_id);
    let filter = doc! { "id": board_id };
    collection.delete_one(filter, None).await?;
    Ok(())
}
