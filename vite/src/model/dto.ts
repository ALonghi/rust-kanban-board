import { IBoard, IBoardColumn } from "./board";
import { ITask } from "./task";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error_message?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  column_id?: IBoardColumn["id"];
  above_task_id?: ITask["id"];
  board_id: IBoard["id"];
}

export interface CreateBoardRequest {
  title: string;
  description?: string;
}

export interface CreateBoardColumnRequest {
  title: string;
  items: ITask[]
}

export interface CreateBoardColumnResponse {
  column: IBoardColumn;
  items: ITask[]
}

export const EMPTY_BOARD_REQ: CreateBoardRequest = {
  title: "",
};
