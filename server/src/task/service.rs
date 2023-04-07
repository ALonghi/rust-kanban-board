use async_recursion::async_recursion;
use bson::{doc, Document};
use chrono::Utc;
use mongodb::error::{Error, TRANSIENT_TRANSACTION_ERROR, UNKNOWN_TRANSACTION_COMMIT_RESULT};
use mongodb::options::{
    Acknowledgment, ReadConcern, SessionOptions, TransactionOptions, WriteConcern,
};
use mongodb::{ClientSession, Collection};
use tracing::debug;
use tracing::log::error;

use crate::config::AppState;
use crate::error::AppError::MongoError;
use crate::error::Result;
use crate::error::{AppError, TaskRepoError};
use crate::task::model::Task;
use crate::task::utils::{doc_to_task, parse_tasks, task_to_doc};

pub async fn get_all_tasks(collection: Collection<Document>) -> Result<Vec<Task>> {
    let mut cursor = collection.find(None, None).await.map_err(|_e| {
        debug!("ERROR [get_tasks] {:?}", _e);
        return TaskRepoError::NotFound;
    })?;
    return parse_tasks(cursor).await;
}

pub async fn get_tasks(board_id: &String, collection: Collection<Document>) -> Result<Vec<Task>> {
    let filter = doc! { "board_id": board_id };
    let mut cursor = collection.find(filter, None).await.map_err(|_e| {
        debug!("ERROR [get_tasks] {:?}", _e);
        return TaskRepoError::NotFound;
    })?;
    return parse_tasks(cursor).await;
}

pub async fn get_task(task_id: &String, collection: Collection<Document>) -> Result<Task> {
    let filter = doc! { "id": task_id };
    let task_opt = collection
        .find_one(filter, None)
        .await
        .map_err(|e| {
            debug!(
                "Error while getting a task with id {}: {}",
                task_id,
                e.to_string()
            );
            MongoError(e)
        })?
        .and_then(|doc| doc_to_task(&doc).ok());

    match task_opt {
        Some(task) => Ok(task),
        None => {
            debug!("task_opt is None!");
            Err(AppError::TaskRepo(TaskRepoError::NotFound))
        }
    }
}

pub async fn create(task: &Task, collection: Collection<Document>) -> Result<&Task> {
    debug!("[create_task] Creating task with id={}", &task.id);
    let doc = task_to_doc(&task);
    collection.insert_one(doc, None).await.map_err(|_e| {
        debug!("ERROR [create_task] {:?}", _e);
        return TaskRepoError::InvalidTask(_e.to_string());
    })?;
    Ok(task)
}

pub async fn update(task: &Task, collection: Collection<Document>) -> Result<Task> {
    debug!("[update_task] Updating task with id={}", &task.id);
    let task_id = &task.id.to_string();
    let update_time = Utc::now();
    let updated = Task {
        updated_at: Some(update_time),
        ..task.clone()
    };

    let filter = doc! { "id": task_id };
    let updates = doc! { "$set": task_to_doc(&updated) };
    collection
        .update_one(filter, updates, None)
        .await
        .map(|res| {
            return if res.modified_count == 1 {
                Ok(())
            } else {
                Err(AppError::TaskRepo(TaskRepoError::InvalidTask(format!(
                    "modified_count = {:?} on {}",
                    res.modified_count, res.matched_count
                ))))
            };
        })
        .map_err(|_e| {
            debug!("ERROR [update_task] {:?}", _e);
            return AppError::MongoError(_e);
        })?
        .expect(format!("Coudn't update task {}", task_id).as_str());

    Ok(updated)
}

pub async fn update_many(tasks: &Vec<Task>, state: AppState) -> Result<&Vec<Task>> {
    let collection = state.get_tasks_collection();
    let session = &mut state
        .client
        .start_session(
            SessionOptions::builder()
                .causal_consistency(Some(false))
                .build(),
        )
        .await?;

    async fn execute_transaction(
        coll: &Collection<Document>,
        session: &mut ClientSession,
        tasks: &Vec<Task>,
    ) -> mongodb::error::Result<()> {
        // from https://stackoverflow.com/questions/50850309/how-do-i-iterate-over-a-vec-of-functions-returning-futures-in-rust
        async fn async_action(
            task: &Task,
            coll: &Collection<Document>,
            session: &mut ClientSession,
        ) -> core::result::Result<(), Error> {
            let filter = doc! { "id": task.id.to_string() };
            let updates = doc! { "$set": task_to_doc(&task) };
            debug!(
                "Updating task with id {}: {:?}",
                task.id.clone(),
                task.clone()
            );
            coll.update_one_with_session(filter, updates, None, session)
                .await
                .and_then(|_| Ok(()))
        }

        async fn requests_in_sequence(
            vals: &Vec<Task>,
            coll: &Collection<Document>,
            session: &mut ClientSession,
        ) -> core::result::Result<(), AppError> {
            let mut tasks = vals.clone().into_iter().peekable();
            while let Some(t) = tasks.next() {
                match async_action(&t, coll, session).await {
                    Err(e) if tasks.peek().is_none() => return MongoError(e).into(),
                    _ => { /* Do nothing and try the next source */ }
                }
            }
            Ok(())
        }

        requests_in_sequence(tasks, coll, session).await.unwrap();

        // An "UnknownTransactionCommitResult" label indicates that it is unknown whether the
        // commit has satisfied the write concern associated with the transaction. If an error
        // with this label is returned, it is safe to retry the commit until the write concern is
        // satisfied or an error without the label is returned.
        #[async_recursion]
        async fn retry_commit(
            session: &mut ClientSession,
            tentatives: i8,
        ) -> mongodb::error::Result<()> {
            debug!("Retring to commit on tentative {}", tentatives);
            if let Err(err) = session.commit_transaction().await {
                if err.contains_label(UNKNOWN_TRANSACTION_COMMIT_RESULT) {
                    if tentatives <= 3 {
                        retry_commit(session, tentatives + 1).await
                    } else {
                        debug!("Failed to commit after {} tentatives", tentatives);
                        Err(mongodb::error::Error::from(err))
                    }
                } else {
                    error!("Commit got error {}", err.to_string());
                    Err(mongodb::error::Error::from(err))
                }
            } else {
                debug!("Successfully Committed transaction!");
                mongodb::error::Result::Ok(())
            }
        }
        retry_commit(session, 1).await
    }

    let options = TransactionOptions::builder()
        .read_concern(ReadConcern::majority())
        .write_concern(WriteConcern::builder().w(Acknowledgment::Majority).build())
        .build();
    session.start_transaction(options).await?;

    // A "TransientTransactionError" label indicates that the entire transaction can be retried
    // with a reasonable expectation that it will succeed.
    while let Err(error) = execute_transaction(&collection, session, tasks).await {
        debug!("Got transaction error {:?}", error);
        if !error.contains_label(TRANSIENT_TRANSACTION_ERROR) {
            break;
        }
    }
    Ok(tasks)
}

pub async fn delete_tasks_of_column(
    column_id: &String,
    collection: Collection<Document>,
) -> Result<()> {
    debug!("[delete_task] Deleting task for column id={}", column_id);
    let filter = doc! { "column_id": column_id };
    collection.delete_many(filter, None).await?;
    Ok(())
}

pub async fn delete(task_id: &String, collection: Collection<Document>) -> Result<()> {
    debug!("[delete_task] Deleting task with id={}", task_id);
    let filter = doc! { "id": task_id };
    collection.delete_one(filter, None).await?;
    Ok(())
}
