import { ITask } from "./task";
import { IBoardColumn } from "./board";

export default interface GroupedTasks {
  columnId: IBoardColumn["id"];
  column: IBoardColumn;
  items: ITask[];
}
