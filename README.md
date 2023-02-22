# Kanban Board Backend

Backend for a kanban board project written in Rust

Frontend of the project can be found at [https://github.com/ALonghi/kanban-board-frontend](https://github.com/ALonghi/kanban-board-frontend)


## Known Limitations

The sorting of the tasks is reliant on the frontend sending the correctly mapped task model, therefore the APIs currently cant be integrated or called by external systems.

**Possible best effort solution could be to**:
- on task creation - get last item id from the column in which the task is being added and attach the reference to the newly created task
- on task deletion - get task before and after the deleted one and attach reference from previous task to the one afte the deleted one
