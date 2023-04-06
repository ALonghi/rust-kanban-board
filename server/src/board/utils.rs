use chrono::Utc;

use crate::board::model::{Board, BoardColumn};
use crate::dto::CreateBoardColumnRequest;
use crate::error::Result;

pub async fn create_and_add_column_to(
    board: Board,
    request: CreateBoardColumnRequest,
) -> Result<(Board, BoardColumn)> {
    let now = chrono::DateTime::<Utc>::default();
    let column_id = uuid::Uuid::new_v4();
    let new_column = BoardColumn {
        id: column_id,
        name: request.title,
        created_at: now,
        updated_at: Some(now),
    };

    let updated_columns = merge_columns(&board.columns, new_column.clone(), request.was_unassigned);
    Ok((board.with_updated_columns(updated_columns), new_column))
}

fn merge_columns(
    items: &Vec<BoardColumn>,
    new_column: BoardColumn,
    was_unassigned: Option<bool>,
) -> Vec<BoardColumn> {
    fn add_all_to(all_columns: &mut Vec<BoardColumn>, items: &Vec<BoardColumn>) {
        items
            .into_iter()
            .for_each(|col| all_columns.push(col.clone()));
    }

    let mut all_columns = Vec::new();
    match was_unassigned {
        Some(true) => {
            all_columns.push(new_column.clone());
            add_all_to(&mut all_columns, items);
        }
        _ => {
            add_all_to(&mut all_columns, items);
            all_columns.push(new_column.clone());
        }
    }
    all_columns.clone()
}

pub fn filter_column_from(board: Board, column_id: uuid::Uuid) -> Board {
    Board {
        columns: board
            .clone()
            .columns
            .into_iter()
            .filter(|c| c.id.clone() != column_id)
            .collect(),
        ..board
    }
}

#[cfg(test)]
mod tests {
    use chrono::Utc;
    use futures::SinkExt;
    use itertools::assert_equal;
    use uuid::Uuid;

    use crate::board::model::{Board, BoardColumn};
    use crate::board::utils::merge_columns;
    use crate::dto::CreateBoardColumnRequest;

    #[test]
    fn it_maps_new_column_in_correct_order() {
        let existing_columns: Vec<BoardColumn> = vec![
            BoardColumn {
                id: Uuid::new_v4(),
                name: String::from("column-1"),
                created_at: chrono::DateTime::<Utc>::default(),
                updated_at: None,
            },
            BoardColumn {
                id: Uuid::new_v4(),
                name: String::from("column-2"),
                created_at: chrono::DateTime::<Utc>::default(),
                updated_at: None,
            },
        ];
        let board = Board {
            id: Uuid::new_v4(),
            title: String::from("mock-board"),
            description: None,
            columns: existing_columns.clone(),
            created_at: chrono::DateTime::<Utc>::default(),
            updated_at: None,
        };
        let new_column = BoardColumn {
            id: Uuid::new_v4(),
            name: String::from("new-column"),
            created_at: chrono::DateTime::<Utc>::default(),
            updated_at: None,
        };

        let mut expected_front: Vec<BoardColumn> = Vec::new();
        expected_front.push(new_column.clone());
        existing_columns
            .clone()
            .into_iter()
            .for_each(|c| expected_front.push(c));
        let actual = merge_columns(&board.columns.clone(), new_column.clone(), Some(true));
        assert_equal(expected_front, actual);

        let mut expected_back: Vec<BoardColumn> = Vec::new();
        existing_columns
            .clone()
            .into_iter()
            .for_each(|c| expected_back.push(c));
        expected_back.push(new_column.clone());
        let actual = merge_columns(&board.columns.clone(), new_column.clone(), Some(false));
        assert_equal(expected_back, actual);
    }
}
