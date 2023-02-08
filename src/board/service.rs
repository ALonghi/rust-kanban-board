use std::error::Error;

use crate::model::model::Board;
use crate::model::model::Task;
use crate::model::task_group::TaskGroup;

pub async fn get_boards() -> Result<Vec<Board>, Error> {
    unimplemented!()
}

pub async fn update(board: Board) -> Result<Board, Error> {
    unimplemented!()
}

pub async fn delete(board_id: uuid::Uuid) -> Result<(), Error> {
    unimplemented!()
}