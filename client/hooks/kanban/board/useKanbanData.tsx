import { useEffect, useState } from "react";
import { IBoard, IBoardColumn } from "@model/board";
import { ITask } from "@model/task";
import { groupByColumn } from "@utils/helpers";
import GroupedTasks from "@model/groupedTasks";

export const useKanbanData = (board: IBoard, tasks: ITask[]) => {
  const [currentBoard, setCurrentBoard] = useState<IBoard>(board);
  const [currentTasks, setCurrentTasks] = useState<ITask[]>(tasks || []);
  const [newTaskData, setNewTaskData] = useState<Omit<
    ITask,
    "id" | "created_at" | "position"
  > | null>(null);

  const mapGroupedTasks = () => groupByColumn(currentTasks, currentBoard);

  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks[]>(
    currentTasks?.length > 0 ? mapGroupedTasks() : []
  );

  useEffect(() => {
    console.error("groupedf task updated!!");
    setGroupedTasks(() => mapGroupedTasks());
  }, [currentTasks]);

  const updateBoardAfterColumnRemoval = (
    newBoard: IBoard,
    colId: IBoardColumn["id"]
  ) => {
    console.log(`deleting colId ${colId}`);
    console.log(
      `allTasks before deletion ${JSON.stringify(currentTasks, null, 2)}`
    );
    setCurrentBoard(() => newBoard);
    setCurrentTasks((prev) => prev.filter((t) => t.column_id !== colId));
  };

  return {
    currentBoard,
    setCurrentBoard,
    groupedTasks,
    newTaskData,
    setNewTaskData,
    updateBoardAfterColumnRemoval,
    currentTasks,
    setCurrentTasks,
  };
};
