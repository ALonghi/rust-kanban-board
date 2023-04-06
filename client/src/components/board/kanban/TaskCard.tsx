"use client";

import {
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ITask } from "../../../model/task";
import SaveIcon from "../../shared/SaveIcon";
import { useState } from "react";
import { IBoard, IBoardColumn } from "../../../model/board";
import { CreateTaskRequest } from "../../../model/dto";
import { createToast } from "../../../model/toast";

type TaskProps = {
  task: ITask | Partial<ITask>;
  isNew?: boolean;
  isFocus?: boolean;
  columnId?: IBoardColumn["id"];
  boardId: IBoard["id"];
  onCreate?: (task_request: CreateTaskRequest) => Promise<void>;
  onUpdate?: (updatedTask: ITask) => Promise<void>;
  onDelete: (taskId: ITask["id"]) => Promise<void>;
  onSelect?: () => void;
};

export default function TaskCard({
  task,
  isNew,
  isFocus,
  columnId,
  boardId,
  onCreate,
  onUpdate,
  onDelete,
  onSelect,
}: //
TaskProps) {
  const [showComponent, setShowComponent] = useState<boolean>(
    !!task?.id || true
  );
  const [taskTitle, setTaskTitle] = useState<string>(task.title || "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskTitle(e.target.value);
  };

  const handleDeleteClick = async () => {
    const promise = task?.id
      ? onDelete(task?.id)
      : Promise.resolve(setShowComponent(false));
    await promise.then(() => {
      setTaskTitle("");
    });
  };

  const handleSelectClick = () => {
    // alert(`handleSelectClick`);
    // onSelect(task.id);
  };

  const handleSaveTask = async () => {
    try {
      if (isNew) {
        const request: CreateTaskRequest = {
          title: taskTitle,
          column_id: columnId || null,
          board_id: boardId,
        };
        await onCreate(request);
      } else if (onUpdate) {
        await onUpdate({ ...task, title: taskTitle } as ITask);
      } else {
        console.warn(
          `Task neither new (${isNew}) nor onUpdate provided (${onUpdate})`
        );
      }
    } catch (e) {
      const errorMsg = `Error in executing task related action ${
        e.message || e
      } `;
      createToast(errorMsg, "error");
    }
  };

  return (
    showComponent && (
      <div
        className={`cursor-move relative flex items-start space-x-3 rounded-lg
            border-0 border-gray-300 bg-white px-4 py-4 shadow-md mt-3 max-w-full h-[6rem]
            `}
      >
        <div className={`relative flex w-full h-full`}>
          <div
            className={` flex flex-row opacity-40 justify-center items-center absolute top-0 right-0`}
          >
            {isNew ? (
              <SaveIcon saveAction={handleSaveTask} classes={`mr-1 w-4`} />
            ) : (
              onSelect && (
                <div
                  className={`mx-2 border-box cursor-pointer`}
                  onClick={() => (onSelect ? onSelect() : null)}
                >
                  <ArrowTopRightOnSquareIcon
                    className={`text-gray-700 w-4 h-4 `}
                  />
                </div>
              )
            )}

            <XMarkIcon
              onClick={() => handleDeleteClick()}
              className={`text-gray-700 z-10 w-5 h-5 cursor-pointer`}
            />
          </div>
          {isNew ? (
            <input
              onChange={handleTitleChange}
              defaultValue={task.title}
              ref={(input) => (isNew && input ? input.focus() : null)}
              onKeyDown={(e) => (e.key === "Enter" ? handleSaveTask() : null)}
              className={`focus-visible:ring-0 focus-visible:border-0
                          focus-visible:outline-0 bg-white mr-auto ml-0 overflow-x-none
                          font-normal text-sm p-0 h-fit max-h-full resize-none w-8/12 text-clip`}
            />
          ) : (
            <div
              className={`relative flex flex-col justify-start items-start w-8/12 `}
            >
              <p
                className={`mr-auto ml-0 font-normal text-sm p-0 h-fit max-h-full`}
              >
                {task.title}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  );
}
