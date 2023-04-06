import { ITask } from "@model/task";
import { CreateTaskRequest } from "@model/dto";
import {
  isOfSameColumn,
  sortByPosition,
  UNASSIGNED_COLUMN_ID,
} from "@utils/helpers";
import TaskService from "@service/taskService";
import { createToast, IToast } from "@model/toast";
import { addNotification } from "@stores/notificationStore";

export const useTaskData = (
  boardId: string,
  tasks: ITask[],
  updateTasks: React.Dispatch<React.SetStateAction<ITask[]>>,
  setNewTaskData: React.Dispatch<
    React.SetStateAction<Omit<ITask, "id" | "created_at" | "position"> | null>
  >
) => {
  const saveNewTask = (task_request: CreateTaskRequest) => {
    const tasksOfSameColumn =
      tasks?.filter((t) => isOfSameColumn(t, task_request.column_id)) || [];
    const maybeWithoutColumn: CreateTaskRequest = {
      ...task_request,
      column_id:
        task_request.column_id &&
        task_request.column_id !== UNASSIGNED_COLUMN_ID
          ? task_request.column_id
          : null,
      above_task_id:
        tasksOfSameColumn?.length > 0
          ? sortByPosition(tasksOfSameColumn)[tasksOfSameColumn.length - 1].id
          : null,
    };
    return TaskService.createTask(maybeWithoutColumn)
      .then(() => {
        const toast: IToast = createToast(
          "Task created successfully.",
          "success"
        );
        addNotification(toast);
        return Promise.resolve();
      })
      .catch((e) => {
        const toast: IToast = createToast(
          `Task creation failed with err ${e.message || e}.`,
          "error"
        );
        addNotification(toast);
      })
      .then(() => TaskService.getTasksByBoardId(boardId))
      .then((tasks) => {
        updateTasks(() => tasks);
        setNewTaskData(null);
      })
      .catch((e) => {
        const toast: IToast = createToast(
          `Tasks update failed with err ${e.message || e}.`,
          "error"
        );
        addNotification(toast);
      });
  };

  const saveTaskData = async (task: ITask): Promise<ITask> => {
    let toUpdate: ITask = {
      ...task,
      column_id:
        task.column_id === UNASSIGNED_COLUMN_ID || !task.column_id
          ? null
          : task.column_id,
    };
    return await TaskService.updateTask(toUpdate, boardId)
      .then((updated) => {
        updateTasks((prev) =>
          prev.map((t) => (t.id === toUpdate.id ? toUpdate : t))
        );
        return Promise.resolve(updated);
      })
      .then((updated) => {
        const toast: IToast = createToast(
          "Task updated successfully.",
          "success"
        );
        addNotification(toast);
        setNewTaskData(null);
        return Promise.resolve(updated);
      })
      .catch((e) => {
        const toast: IToast = createToast(
          `Error in updating Task: ${e.message || e}`,
          "error"
        );
        addNotification(toast);
        return Promise.reject(e);
      });
  };

  const deleteTask = async (taskId: ITask["id"]): Promise<void> => {
    return await TaskService.deleteTask(taskId, boardId)
      .then(() => TaskService.getTasksByBoardId(boardId))
      .then((tasks) => {
        updateTasks(() => tasks);
        const toast: IToast = createToast(
          "The requested task was deleted.",
          "success"
        );
        addNotification(toast);
        return Promise.resolve();
      })
      .catch((err) => {
        const toast: IToast = createToast(
          `Task delete error: ${err.message}`,
          "error"
        );
        addNotification(toast);
      });
  };

  return {
    saveNewTask,
    deleteTask,
    saveTaskData,
  };
};
