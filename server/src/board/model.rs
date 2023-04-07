use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

use crate::dto::{CreateBoardRequest, UpdateBoardRequest, UpdateBoardRequestColumn};

#[skip_serializing_none]
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Board {
    pub id: uuid::Uuid,
    pub title: String,
    pub description: Option<String>,
    pub columns: Vec<BoardColumn>,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[skip_serializing_none]
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq)]
pub struct BoardColumn {
    pub id: uuid::Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Board {
    pub fn from_create_request(r: CreateBoardRequest) -> Self {
        Self {
            id: uuid::Uuid::new_v4(),
            title: r.title,
            description: r.description,
            columns: Vec::<BoardColumn>::new(),
            created_at: Utc::now(),
            updated_at: None,
        }
    }

    pub fn from_update_request(r: UpdateBoardRequest) -> Self {
        let current_time = Utc::now();

        fn map_columns_with_id(
            columns: Vec<UpdateBoardRequestColumn>,
            current_time: DateTime<Utc>,
        ) -> Vec<BoardColumn> {
            columns
                .iter()
                .map(|c| BoardColumn {
                    id: c.id.unwrap_or(uuid::Uuid::new_v4()),
                    name: c.name.clone(),
                    created_at: c.created_at.unwrap_or(current_time),
                    updated_at: c.updated_at,
                })
                .collect::<Vec<BoardColumn>>()
        }

        Self {
            id: r.id,
            title: r.title,
            description: r.description,
            columns: map_columns_with_id(r.columns, current_time),
            created_at: r.created_at,
            updated_at: Some(current_time),
        }
    }

    pub fn with_updated_columns(self, new_columns: Vec<BoardColumn>) -> Self {
        Self {
            columns: new_columns,
            ..self
        }
    }
}
