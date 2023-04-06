use std::collections::{HashMap, LinkedList};
use std::str::FromStr;

use axum::extract::FromRef;
use chrono::Utc;
use mongodb::bson::doc;
// don't forget this!
use tokio_stream::StreamExt;
use uuid::Uuid;

use crate::error::Result;
use crate::error::{AppError, TaskRepoError};
use crate::task::model::{SortedTask, Task};
use crate::util::get_optional_uuid;

pub fn map_task_db_to_linked(elems: Vec<Task>) -> LinkedList<SortedTask> {
    grouped_by_column(&elems)
        .into_iter()
        .flat_map(|(_, tasks)| {
            build_hierarchy_set(tasks.clone())
                .into_iter()
                .enumerate()
                .map(|(i, t)| t.clone().to_sorted(i))
        })
        .collect::<LinkedList<SortedTask>>()
}

pub fn build_hierarchy_set(tasks: Vec<Task>) -> LinkedList<Task> {
    // Create a hash map to map task IDs to their corresponding task objects.
    let mut task_map = HashMap::new();
    for task in tasks.clone() {
        task_map.insert(task.id.to_string().clone(), task.clone());
    }

    // Create a linked list to store the sorted hierarchy set.
    let mut hierarchy_set = LinkedList::new();

    // Traverse the task hierarchy starting from each root task, and add the tasks to the hierarchy set in sorted order.
    for (task_id, _) in &task_map {
        let task = task_map.get(task_id).unwrap();
        if task.above_task_id.is_none() {
            add_task_and_children_to_set(&task_map, &mut hierarchy_set, &task.id.to_string());
        }
    }
    // adding left over ones
    let remaining = tasks
        .clone()
        .into_iter()
        .filter(|task| !hierarchy_set.contains(&task.clone()))
        .collect::<Vec<Task>>();

    remaining.into_iter().for_each(|t| {
        hierarchy_set
            .push_back(t.with_above_task(hierarchy_set.back().and_then(|t| t.above_task_id)))
    });
    hierarchy_set
}

pub fn grouped_by_column(tasks: &Vec<Task>) -> Vec<(Option<Uuid>, Vec<Task>)> {
    let mut elems: HashMap<Option<Uuid>, Vec<Task>> = HashMap::new();
    for task in tasks.iter() {
        let mut mapped_for_key = elems
            .get(&task.column_id)
            .map(|v| v.clone())
            .unwrap_or(Vec::new());
        if mapped_for_key.clone().len() > 0 {
            mapped_for_key.push(task.clone());
            elems.insert(task.column_id, mapped_for_key.clone());
        } else {
            elems.insert(task.column_id, vec![task.clone()]);
        }
    }
    elems
        .into_iter()
        .map(|(key, values)| (key, values))
        .collect::<Vec<(Option<Uuid>, Vec<Task>)>>()
}

fn add_task_and_children_to_set(
    task_map: &HashMap<String, Task>,
    hierarchy_set: &mut LinkedList<Task>,
    task_id: &str,
) {
    let task = task_map.get(task_id).unwrap();
    hierarchy_set.push_back(task.clone());

    // Traverse the child tasks recursively and add them to the hierarchy set in sorted order.
    for (child_task_id, _) in task_map {
        let child_task = task_map.get(child_task_id).unwrap();
        if child_task.above_task_id == Some(task.id.clone()) {
            add_task_and_children_to_set(task_map, hierarchy_set, child_task_id);
        }
    }
}

pub async fn parse_tasks(
    mut cursor: mongodb::Cursor<bson::document::Document>,
) -> Result<Vec<Task>> {
    let mut result: Vec<Task> = Vec::new();
    while let Some(doc) = cursor.next().await {
        result.push(doc_to_task(&doc?)?);
    }
    Ok(result)
}

pub fn doc_to_task(doc: &bson::document::Document) -> Result<Task> {
    let id = doc.get_str("id")?;
    let title = doc.get_str("title")?;
    let description = doc.get_str("description").ok();
    let column_id = get_optional_uuid(doc, "column_id");
    let above_task_id = get_optional_uuid(doc, "above_task_id");
    let board_id = doc.get_str("board_id")?;
    let created_at = bson::DateTime::from_ref(doc.get_datetime("created_at")?);
    let updated_at = doc
        .get_datetime("updated_at")
        .ok()
        .map(|v| chrono::DateTime::from(*v));
    match (Uuid::from_str(id), Uuid::from_str(board_id)) {
        (Ok(task_uuid), Ok(board_uuid)) => Ok(Task {
            id: task_uuid,
            title: title.to_owned(),
            description: description.map(|d| d.to_string()),
            column_id,
            above_task_id,
            board_id: board_uuid,
            created_at: chrono::DateTime::from(created_at),
            updated_at,
        }),
        _ => Err(AppError::TaskRepo(TaskRepoError::DecodeError(format!(
            "Task doesnt have id or board_id {} {}",
            id, board_id
        )))),
    }
}

pub fn task_to_doc(task: &Task) -> bson::document::Document {
    let doc = doc! {
        "id" : task.id.clone().to_string(),
        "title" : task.title.clone(),
        "description" : task.description.clone(),
        "column_id" : task.column_id.map(|v| v.to_string()),
        "above_task_id" : task.above_task_id.map(|v| v.to_string()),
        "board_id" : task.board_id.to_string(),
        "created_at" : <chrono::DateTime<Utc> as Into<bson::DateTime>>::into(task.created_at),
        "updated_at": task.updated_at.map(|v| <chrono::DateTime<Utc> as Into<bson::DateTime>>::into(v)).clone()
    };
    return doc;
}
