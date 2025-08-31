import { ITask } from "@model/task";
import { CreateBoardColumnRequest } from "@model/dto";
import {
  isOfSameColumn,
  UNASSIGNED_COLUMN_ID,
  UNASSIGNED_COLUMN_NAME,
} from "@utils/helpers";
import { IBoard, IBoardColumn } from "@model/board";
import { useState } from "react";
import BoardService from "@service/boardService";
import { createToast, IToast } from "@model/toast";
import { addNotification } from "@stores/notificationStore";
import Logger from "@utils/logging";

export const useColumnHeader = (
  tasks: ITask[],
  board: IBoard,
  updateBoard: React.Dispatch<React.SetStateAction<IBoard>>,
  updateTasks: React.Dispatch<React.SetStateAction<ITask[]>>,
  setNewTaskData: (task: Omit<ITask, "id" | "created_at" | "position">) => void,
  updateBoardAfterColumnRemoval?: (
    newBoard: IBoard,
    colId: IBoardColumn["id"],
  ) => void,
  column?: IBoardColumn,
) => {
  const [currentColumn, setCurrentColumn] = useState<IBoardColumn | null>(
    column || null,
  );
  const [newColumnName, setNewColumnName] = useState<string>(
    column?.name || "",
  );
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const saveColumn = async () => {
    if (!currentColumn?.id || currentColumn?.id === UNASSIGNED_COLUMN_ID) {
      const colItems: ITask[] =
        tasks.filter((t) => isOfSameColumn(t, currentColumn?.id)) || [];
      const req: CreateBoardColumnRequest = {
        title: newColumnName,
        items: colItems,
        was_unassigned: true,
      };
      return await BoardService.createBoardColumn(req, board.id)
        .then((response) => {
          updateBoard((p) => ({
            ...p,
            columns: [response.column, ...p.columns],
          }));
          updateTasks((prev) => {
            const newItems = [
              ...prev.map((t) =>
                t.column_id === UNASSIGNED_COLUMN_ID || !t.column_id
                  ? {
                      ...response.items.find((task) => task.id === t.id),
                      column_id: response.column.id,
                    }
                  : t,
              ),
            ];
            return newItems;
          });
        })
        .then(() => {
          setIsTyping(false);
          setNewColumnName(column?.name || UNASSIGNED_COLUMN_NAME);
        });
    } else {
      const updatedBoard: IBoard = {
        ...board,
        columns: board.columns.map((c) =>
          c.id === currentColumn?.id ? { ...c, name: currentColumn.name } : c,
        ),
      };
      return await BoardService.updateBoard(updatedBoard)
        .then((response) => {
          updateBoard(() => response);
          const toast: IToast = createToast(
            "Board updated successfully.",
            "success",
          );
          addNotification(toast);
          setIsTyping(false);
          setCurrentColumn(null);
        })
        .catch((err) => {
          const toast: IToast = createToast(
            `Error in updating board: ${err.message} `,
            "error",
          );
          addNotification(toast);
          Logger.error(
            `Error while updating board ${updatedBoard.id}: ${
              err.message || err
            }`,
          );
        });
    }
  };

  const deleteColumn = async (colId: IBoardColumn["id"]) => {
    if (colId) {
      await BoardService.deleteBoardColumn(board.id, colId)
        .then(async (updated) => {
          updateBoardAfterColumnRemoval
            ? updateBoardAfterColumnRemoval(updated, colId)
            : null;
          const toast: IToast = createToast(
            "Column deleted successfully.",
            "success",
          );
          addNotification(toast);
        })
        .catch((e) => {
          const toast: IToast = createToast(
            `Error in deleting column: ${e.message || e}`,
            "error",
          );
          addNotification(toast);
        });
    }
  };

  return {
    currentColumn,
    isTyping,
    setIsTyping,
    newColumnName,
    setNewColumnName,
    saveColumn,
    deleteColumn,
  };
};
