import {CreateTaskRequest} from "../../../../model/dto";
import GroupedTasks from "../../../../model/groupedTasks";
import {ITask} from "../../../../model/task";
import {createToast, IToast} from "../../../../model/toast";
import TaskService from "../../../../service/taskService";
//import {addNotification} from "../../../../stores/notificationStore";
import {sortByPosition, UNASSIGNED_COLUMN_ID,} from "../../../../utils/helpers";
import {IBoardColumn} from "../../../../model/board";

export const useColumnHooks = (
    boardId: string,
    groupedTasks: GroupedTasks[],
    updateGroupedTasks: React.Dispatch<React.SetStateAction<GroupedTasks[]>>,
    setNewTaskData: React.Dispatch<
        React.SetStateAction<Omit<ITask, "id" | "created_at" | "position"> | null>
    >
) => {
    const saveNewTask = (task_request: CreateTaskRequest): Promise<void> => {
        const tasksOfSameColumn = groupedTasks?.find(g => g.columnId === task_request.column_id)?.items || []
        const maybeWithoutColumn: CreateTaskRequest = {
            ...task_request,
            column_id:
                task_request.column_id &&
                task_request.column_id !== UNASSIGNED_COLUMN_ID
                    ? task_request.column_id
                    : null,
            above_task_id: tasksOfSameColumn?.length > 0
                ? sortByPosition(tasksOfSameColumn)[tasksOfSameColumn.length - 1].id
                : null
        };
        return TaskService.createTask(maybeWithoutColumn).then((created) => {
            const columnId = task_request.column_id || UNASSIGNED_COLUMN_ID;
            const tasks: GroupedTasks[] = JSON.parse(JSON.stringify(groupedTasks));
            const columnExistingItems: ITask[] =
                tasks?.find((g) => g.columnId === columnId)?.items || [];
            const lastPosition =
                sortByPosition(columnExistingItems)[columnExistingItems.length]
                    ?.position || 0;
            const updatedTasksList = [
                ...columnExistingItems,
                {...created, position: lastPosition + 1},
            ];

            updateGroupedTasks((prev) =>
                prev.map((g: GroupedTasks) =>
                    g.columnId === columnId
                        ? {
                            ...g,
                            items: updatedTasksList,
                        }
                        : g
                )
            );
            setNewTaskData(null);
            const toast: IToast = createToast(
                "Task created successfully.",
                "success"
            );
            //addNotification(toast);
        });
    };

    const saveTaskData = async (task: ITask): Promise<void> => {
        return await TaskService.updateTask(task, boardId).then(() => {
            setNewTaskData(null);
            const toast: IToast = createToast(
                "Task updated successfully.",
                "success"
            );
            //addNotification(toast);
        });
    };

    const deleteTask = async (
        taskId: ITask["id"],
        colId?: IBoardColumn["id"]
    ) => {
        await TaskService.deleteTask(taskId, boardId)
            .then(() => {
                return Promise.all(
                    groupedTasks.map(async (grouped) => {
                        if (colId ?
                            grouped.columnId === colId
                            : grouped.columnId === UNASSIGNED_COLUMN_ID) {
                            const cloned: GroupedTasks = JSON.parse(JSON.stringify(grouped))
                            const elemIndex = grouped.items.findIndex((t) => t.id === taskId);
                            cloned.items = cloned.items.filter(t => t.id !== taskId)
                            cloned.items[elemIndex] = {
                                ...cloned.items[elemIndex],
                                above_task_id: elemIndex === 0
                                    ? null
                                    : cloned.items[elemIndex - 1]?.id
                            }
                            cloned.items = cloned.items.map((t, i) => ({...t, position: i}))
                            updateGroupedTasks((prev) =>
                                prev?.map((elem) =>
                                    elem.columnId === colId
                                        ? cloned
                                        : elem
                                )
                            );
                            const toast: IToast = createToast(
                                "The requested task was deleted.",
                                "success"
                            );
                            //addNotification(toast);
                        }
                        return Promise.resolve();
                    })
                );
            })
            .catch((err) => {
                const toast: IToast = createToast(
                    `Task delete error: ${err.message}`,
                    "error"
                );
                //addNotification(toast);
                console.error(`error in task delete ${err?.message} ${err}`);
            });
    };

    return {
        saveNewTask,
        deleteTask,
        saveTaskData,
    };
};
