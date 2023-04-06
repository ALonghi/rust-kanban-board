import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ITask } from "@model/task";
import InputForm from "@components/shared/InputForm";
import SelectBox from "@components/shared/SelectBox";
import { IBoard } from "@model/board";
import {
  getEmptyGroupedColumn,
  isOfSameColumn,
  sortByPosition,
} from "@utils/helpers";
import { createToast, IToast } from "@model/toast";
import { addNotification } from "@stores/notificationStore";

type FocusedTaskSliderProps = {
  isOpen: boolean;
  closeFun: Function;
  task?: ITask | null;
  saveTask: (updatedTask: ITask) => Promise<ITask>;
  board: IBoard;
  tasks: ITask[];
};
export default function FocusedTaskSlider({
  isOpen,
  closeFun,
  task,
  saveTask,
  board,
  tasks,
}: FocusedTaskSliderProps) {
  const [currentTask, setCurrentTask] = useState<ITask | null>(task || null);
  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTask(task);
    return () => {
      setCurrentTask(null);
      setEditingField(null);
    };
  }, [task, isOpen]);

  const save = async () => {
    if (currentTask.column_id !== task.id) {
      // updating position of task into its new column
      const tasksOfSameColumn = sortByPosition(
        tasks.filter((t) => isOfSameColumn(t, currentTask.column_id))
      );
      const lastOfSameColumn: ITask | null = tasksOfSameColumn
        ? tasksOfSameColumn[tasksOfSameColumn.length - 1]
        : null;
      const toUpdate: ITask = {
        ...currentTask,
        above_task_id: lastOfSameColumn ? lastOfSameColumn.id : null,
        position: lastOfSameColumn ? lastOfSameColumn.position + 1 : 0,
      };
      // need to update old column task pointing at the current one
      const elemsOfPreviousColumns = tasks.filter((t) =>
        isOfSameColumn(t, task.column_id)
      );
      const pointingAtCurrentOne: ITask | null =
        elemsOfPreviousColumns.find(
          (t) => t.above_task_id === currentTask.id
        ) || null;
      if (pointingAtCurrentOne) {
        const pointingToUpdate: ITask = {
          ...pointingAtCurrentOne,
          above_task_id: currentTask.above_task_id,
          position: pointingAtCurrentOne.position - 1,
        };
        await saveTask(pointingToUpdate).catch((e) => {
          const toast: IToast = createToast(
            `Error in updating referenced Task: ${e.message || e}`,
            "error"
          );
          addNotification(toast);
        });
      }

      // updating current task when referenced one are fixed
      saveTask(toUpdate)
        .then((updated) => setCurrentTask(updated))
        .then(() => {})
        .finally(() => {
          setEditingField(null);
          closeFun();
        });
    } else {
      saveTask(currentTask)
        .then((updated) => setCurrentTask(updated))
        .finally(() => setEditingField(null));
    }
  };

  return (
    currentTask && (
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            closeFun();
            setCurrentTask(null);
          }}
        >
          <div className="fixed inset-0 bg-gray-950 opacity-10" />

          <div className="fixed inset-0 overflow-hidden ">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 ">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-xl shadow-2xl">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-2xl relative ">
                      <div className="px-4 sm:px-6 ml-4 w-10/12">
                        <div className="flex items-start justify-between ">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900 mt-8  w-full">
                            <div
                              className={`flex justify-between  mr-auto items-center`}
                            >
                              {editingField !== "title" ? (
                                <p
                                  onClick={() => setEditingField("title")}
                                  className={`text-2xl`}
                                >
                                  {currentTask.title}
                                </p>
                              ) : (
                                <InputForm
                                  type={"text"}
                                  name={"title"}
                                  placeholder={"Titolo"}
                                  componentClasses={`w-full !m-0`}
                                  fullWidth
                                  inputClasses={`border-none shadow-none !m-0 py-2 px-3 rounded-md 
                                            focus:outline-none focus:ring-2 focus:ring-theme-300 w-full text-lg`}
                                  value={currentTask.title}
                                  updateValue={(value) =>
                                    setCurrentTask((p) => ({
                                      ...p,
                                      title: value,
                                    }))
                                  }
                                />
                              )}
                            </div>
                          </Dialog.Title>
                          <div className="absolute right-10 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-theme-300 focus:ring-offset-2"
                              onClick={() => {
                                closeFun();
                                setCurrentTask(null);
                              }}
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
                        className="relative max-h-full mt-6 flex-1 px-4 sm:px-6 ml-4 w-11/12
                                                h-full flex-1 justify-start items-between overflow-y-scroll"
                      >
                        <div className={`overflow-y-auto p-1`}>
                          {currentTask.description &&
                          editingField !== "description" ? (
                            <div
                              className={`flex flex-col justify-center items-start`}
                            >
                              <p className={`font-medium text-sm`}>
                                Description
                              </p>
                              <p
                                onClick={() => setEditingField("description")}
                                className={`cursor-text mt-6 rounded-md border border-gray-200 shadow-sm py-1.5 px-3 min-h-[12rem] h-fit overflow-y-scroll w-full `}
                              >
                                {currentTask.description}
                              </p>
                            </div>
                          ) : (
                            <textarea
                              name={"description"}
                              className={`border border-gray-200 shadow-none w-full py-2 px-3 h-40 resize-none rounded-md 
                                            focus:outline-none focus:ring-2 focus:ring-theme-300`}
                              placeholder={"Add description..."}
                              value={currentTask.description || ""}
                              ref={(input) => (input ? input.focus() : null)}
                              onFocus={() => setEditingField("description")}
                              onChange={(e) => {
                                setCurrentTask((p) => ({
                                  ...p,
                                  description: e.target.value,
                                }));
                              }}
                            />
                          )}
                        </div>
                        <div className={`my-4`}>
                          <p className={`font-medium text-sm`}>Status</p>
                          <SelectBox
                            selected={
                              board.columns.find(
                                (c) => c.id === currentTask.column_id
                              ) || getEmptyGroupedColumn().column
                            }
                            setSelected={(colId) => {
                              setEditingField("column_id");
                              setCurrentTask((p) => ({
                                ...p,
                                column_id: colId,
                              }));
                            }}
                            options={[
                              getEmptyGroupedColumn().column,
                              ...board.columns,
                            ]}
                          />
                        </div>
                        <div className={`mt-auto mb-2`}>
                          {editingField && (
                            <button
                              className={`bg-theme-500 py-1 px-8 text-white rounded-md mt-auto mb-2 ml-1 w-full`}
                              onClick={() => save()}
                            >
                              Save
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    )
  );
}
