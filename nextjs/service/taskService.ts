import Logger from "../utils/logging";
import { ApiResponse, CreateTaskRequest } from "../model/dto";
import { instance as axios } from "../utils/axios";
import { ITask } from "../model/task";
import { IBoard } from "../model/board";

export default class TaskService {
  static async createTask(req: CreateTaskRequest): Promise<ITask> {
    try {
      Logger.info(
        `Adding task ${JSON.stringify(req)} to board ${req.board_id}`
      );
      const response = (await axios
        .post(`/tasks`, req)
        .then((res) => res.data)) as ApiResponse<ITask>;
      if (!response.success || !response.data)
        throw new Error(response.error_message);
      Logger.info(
        `Added task ${response.data?.title} with id ${response.data?.id}`
      );
      return response.data;
    } catch (e) {
      Logger.error(
        `Error in creating task (${JSON.stringify(req)}) for board ${
          req.board_id
        }: ${e.message || e}`
      );
      return Promise.reject(e);
    }
  }

  static async getTasksByBoardId(board_id: string): Promise<ITask[]> {
    try {
      Logger.info(`Getting tasks for board ${board_id}..`);
      const response = (await axios
        .get(`/boards/${board_id}/tasks`)
        .then((res) => res.data)) as ApiResponse<ITask[]>;
      if (!response.success || !response.data)
        throw new Error(response.error_message);
      return response.data || [];
    } catch (e) {
      Logger.error(
        `Error in getting tasks for board ${board_id}: ${e.message || e}`
      );
      return Promise.reject(e);
    }
  }

  static async updateTask(task: ITask, boardId: IBoard["id"]): Promise<ITask> {
    try {
      Logger.info(
        `Updating task ${task.id} for board ${boardId}  with ${JSON.stringify(
          task
        )}`
      );
      const response = (await axios
        .put(`/tasks`, [task])
        .then((res) => res.data)) as ApiResponse<ITask[]>;
      if (!response.success || !response.data)
        throw new Error(response.error_message);
      Logger.info(`Task ${task.id} updated for board ${boardId}.`);
      return response.data[0];
    } catch (e) {
      Logger.error(
        `Error in updating task for board ${boardId} (${
          task.id
        }) (${JSON.stringify(task)}: ${e.message || e}`
      );
      return Promise.reject(e);
    }
  }

  static async deleteTask(
    taskId: ITask["id"],
    boardId: IBoard["id"]
  ): Promise<void> {
    try {
      Logger.info(`Deleting task ${taskId} from board ${boardId}`);
      const response = (await axios
        .delete(`/tasks/${taskId}`)
        .then((res) => res.data)) as ApiResponse<ITask>;
      if (!response.success || !response.data)
        throw new Error(response.error_message);
      Logger.info(`Task ${taskId} deleted for board ${boardId}.`);
      return;
    } catch (e) {
      Logger.error(
        `Error in deleting task ${taskId} from board ${boardId}: ${
          e.message || e
        }`
      );
      return Promise.reject(e);
    }
  }

  static async updateTasks(
    tasks: Omit<ITask, "position">[],
    boardId: IBoard["id"]
  ): Promise<ITask[]> {
    const tasksIds = tasks?.map((t) => t.id) || [];
    try {
      Logger.info(
        `Updating ${
          tasksIds.length
        } tasks ${tasksIds} for board ${boardId}  with ${JSON.stringify(tasks)}`
      );
      const response = (await axios
        .put(`/tasks`, tasks)
        .then((res) => res.data)) as ApiResponse<ITask[]>;
      if (!response.success || !response.data)
        throw new Error(response.error_message);
      Logger.info(`Tasks ${tasksIds} updated for board ${boardId}.`);
      return response.data;
    } catch (e) {
      Logger.error(
        `Error in updating tasks for board ${boardId} (${tasksIds}) (${JSON.stringify(
          tasks
        )}: ${e.message || e}`
      );
      return Promise.reject(e);
    }
  }
}
