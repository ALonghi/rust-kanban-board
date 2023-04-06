"use client";

import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useColumnHeader } from "@hooks/kanban/board/useColumnHeader";
import { IBoard, IBoardColumn } from "@model/board";
import { getEmptyTask, ITask } from "@model/task";
import SaveIcon from "@components/shared/SaveIcon";
import { UNASSIGNED_COLUMN_ID } from "@utils/helpers";
import React, { useState } from "react";
import WarningModal from "@components/board/kanban/WarningModal";

type ColumnHeaderProps = {
  board: IBoard;
  column?: IBoardColumn;
  tasks?: ITask[];
  overriddenName?: string;
  updateBoard: React.Dispatch<React.SetStateAction<IBoard>>;
  updateTasks: React.Dispatch<React.SetStateAction<ITask[]>>;
  setNewTaskData: (task: Omit<ITask, "id" | "created_at" | "position">) => void;
  updateBoardAfterColumnRemoval?: (
    newBoard: IBoard,
    colId: IBoardColumn["id"]
  ) => void;
};

export default function ColumnHeader({
  board,
  column,
  tasks,
  overriddenName,
  updateBoard,
  updateTasks,
  setNewTaskData,
  updateBoardAfterColumnRemoval,
}: ColumnHeaderProps) {
  const [showWarning, setShowWarning] = useState<boolean>(false);

  const {
    currentColumn,
    isTyping,
    setIsTyping,
    newColumnName,
    setNewColumnName,
    saveColumn,
    deleteColumn,
  } = useColumnHeader(
    tasks,
    board,
    updateBoard,
    updateTasks,
    setNewTaskData,
    updateBoardAfterColumnRemoval,
    column
  );

  return (
    <>
      <div
        className={` mb-4 letter-spacing-2 py-2 px-4 flex flex-col
              bg-gray-100 rounded-t-md w-full`}
      >
        {showWarning && currentColumn && (
          <WarningModal
            isOpen={showWarning}
            closeFun={() => setShowWarning(false)}
            column={currentColumn}
            confirmedAction={() => {
              deleteColumn(currentColumn.id).finally(() =>
                setShowWarning(false)
              );
            }}
            totalTasksRelated={
              tasks?.filter((t) => t.column_id === currentColumn?.id)?.length ||
              0
            }
          />
        )}
        {currentColumn?.name || overriddenName ? (
          <div className={`flex flex-row justify-between items-center`}>
            {isTyping ? (
              <>
                <input
                  className={`bg-inherit font-bold text-gray-700 text-sm w-full 
                            outline-0 h-full
                            `}
                  onKeyDown={(e) => (e.key === "Enter" ? saveColumn() : null)}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  value={newColumnName}
                  ref={(input) => input && input.focus()}
                  placeholder="Create new column.."
                />
                <SaveIcon saveAction={saveColumn} />
              </>
            ) : (
              <>
                <p
                  className={`w-fit font-bold text-gray-700 ${
                    overriddenName ? `` : `uppercase`
                  } text-sm h-full`}
                >
                  {currentColumn?.name ||
                    (overriddenName ? overriddenName : "Create new column")}
                </p>
                <div className={`flex gap-x-1.5 text-gray-400`}>
                  <PencilIcon
                    className={`visible sm:flex w-4  cursor-pointer`}
                    onClick={() => setIsTyping(true)}
                  />
                  {currentColumn?.id !== UNASSIGNED_COLUMN_ID && (
                    <TrashIcon
                      className={`visible sm:flex w-4 cursor-pointer`}
                      onClick={() => setShowWarning(true)}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex w-full justify-between items-center">
            <input
              className={`bg-inherit font-bold text-gray-700 text-sm w-full 
                            outline-0 h-full
                            `}
              onKeyDown={(e) => (e.key === "Enter" ? saveColumn() : null)}
              onChange={(e) => {
                setIsTyping(true);
                setNewColumnName(e.target.value);
              }}
              value={currentColumn?.name || newColumnName}
              placeholder="Create new column.."
            />
            {isTyping && <SaveIcon saveAction={saveColumn} />}
          </div>
        )}
      </div>
      <div
        className={`bg-gray-100 hover:bg-gray-200 py-0.5 px-4 mb-2 rounded-md w-full cursor-pointer`}
        onClick={() =>
          setNewTaskData(
            getEmptyTask(board.id, currentColumn?.id || UNASSIGNED_COLUMN_ID)
          )
        }
      >
        <PlusIcon className={`text-gray-500 w-5 mx-auto`} />
      </div>
    </>
  );
}
