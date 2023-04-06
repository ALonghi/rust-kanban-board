# Kanban Board Backend

Backend for a kanban board project written in Rust

Frontend of the project can be found in the `client` folder of this repo


## Known Limitations

The sorting of the tasks is reliant on the frontend sending the correctly mapped task model, therefore the APIs currently cant be integrated or called by external systems.

**Possible best effort solution could be to**:
- on task creation - get last item id from the column in which the task is being added and attach the reference to the newly created task
- on task deletion - get task before and after the deleted one, attach the id of the task before (to which the deleted one was referencing to) to the task after the deleted one

## Example starting templates

- CRUD: From https://github.com/ldevai/rust-crud-nosql-api
- tower-http: https://github.com/tower-rs/tower-http/tree/master/examples/axum-key-value-store