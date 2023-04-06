import { IBoard, IBoardColumn } from "./board";

export interface ITask {
  id: string;
  position: number;
  title: string;
  description?: string;
  column_id?: IBoardColumn["id"];
  above_task_id?: ITask["id"];
  board_id: IBoard["id"];
  created_at: string;
  updated_at?: string;
}

export interface IDragItem {
  position: number;
  id: ITask["id"];
  from: IBoardColumn["id"];
}

export const getEmptyTask = (
  boardId: IBoard["id"],
  columnId?: IBoardColumn["id"]
): Omit<ITask, "id" | "created_at" | "position"> => ({
  title: "",
  column_id: columnId,
  board_id: boardId,
});
