import { useEffect, useState } from "react";
import { IBoard, IBoardColumn } from "../../../../model/board";
import GroupedTasks from "../../../../model/groupedTasks";
import { ITask } from "../../../../model/task";
import { createToast, IToast } from "@/model/toast";
import BoardService from "../../../../service/boardService";
import { addNotification } from "../../../../stores/notificationStore";
import { groupByColumn } from "../../../../utils/helpers";
import Logger from "../../../../utils/logging";

export const useKanbanData = (board: IBoard, tasks: ITask[]) => {
  const [currentBoard, setCurrentBoard] = useState<IBoard>(board);
  const [newTaskData, setNewTaskData] = useState<Omit<
    ITask,
    "id" | "created_at" | "position"
  > | null>(null);

  const mapGroupedTasks = () => groupByColumn(tasks, board);

  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks[]>(
    tasks?.length > 0 ? mapGroupedTasks() : []
  );

  useEffect(() => {
    setGroupedTasks(() => mapGroupedTasks());
  }, [tasks]);

  const updateBoardColumn = async (col: IBoardColumn) => {
    const previousColumns =
      currentBoard?.columns?.filter((c) => c.id !== col.id) || [];
    const updatedBoard = {
      ...currentBoard,
      columns: [...previousColumns, col],
    };
    await BoardService.updateBoard(updatedBoard)
      .then((response) => {
        setCurrentBoard(response);
        const toast: IToast = createToast(
          "Board updated successfully.",
          "success"
        );
        addNotification(toast);
      })
      .catch((err) => {
        const toast: IToast = createToast(
          `Error in updating board: ${err.message} `,
          "error"
        );
        addNotification(toast);
        Logger.error(
          `Error while updating board ${currentBoard.id}: ${err.message || err}`
        );
      });
  };

  return {
    currentBoard,
    groupedTasks,
    setGroupedTasks,
    updateBoardColumn,
    newTaskData,
    setNewTaskData,
  };
};
