"use client";

import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import ColumnHeader from "../BoardColumn/ColumnHeader";
import TaskCard from "../TaskCard";
import { IBoard } from "@model/board";
import { ITask } from "@model/task";
import { useKanbanData } from "@hooks/kanban/board/useKanbanData";
import { useTaskData } from "@hooks/kanban/board/useTaskData";
import { useDraggable } from "@hooks/kanban/board/useDraggable";
import {
  keepDefined,
  UNASSIGNED_COLUMN_ID,
  UNASSIGNED_COLUMN_NAME,
} from "@utils/helpers";
import { useState } from "react";
import FocusedTaskSlider from "@components/board/kanban/FocusedTaskSlider";

type KanbanViewProps = {
  board: IBoard;
  tasks: ITask[];
};

export default function KanbanView({ board, tasks }: KanbanViewProps) {
  const [focusedTask, setFocusedTask] = useState<ITask | null>();

  const {
    currentBoard,
    setCurrentBoard,
    groupedTasks,
    newTaskData,
    setNewTaskData,
    updateBoardAfterColumnRemoval,
    currentTasks,
    setCurrentTasks,
  } = useKanbanData(board, tasks);

  const { saveNewTask, deleteTask, saveTaskData } = useTaskData(
    board.id,
    currentTasks,
    setCurrentTasks,
    setNewTaskData
  );

  const { handleDragEnd } = useDraggable(
    currentTasks,
    setCurrentTasks,
    board.id
  );

  return (
    <div className="mx-2 my-8 min-w-full flex flex-1 flex-nowrap items-start gap-x-2 w-fit">
      <FocusedTaskSlider
        isOpen={!!focusedTask}
        closeFun={() => setFocusedTask(null)}
        task={focusedTask}
        saveTask={saveTaskData}
        board={currentBoard}
        tasks={currentTasks}
      />
      <DragDropContext onDragEnd={handleDragEnd}>
        {groupedTasks?.filter(keepDefined).map((elem) => (
          <div
            className={`${elem.columnId}__wrapper
                            flex flex-col justify-start items-center mx-4 min-h-[80vh] 
                 w-[15rem] overflow-x-visible `}
            key={elem.columnId || UNASSIGNED_COLUMN_ID}
          >
            <ColumnHeader
              board={currentBoard}
              column={elem.column}
              tasks={currentTasks}
              updateTasks={setCurrentTasks}
              overriddenName={elem.column?.name || UNASSIGNED_COLUMN_NAME}
              updateBoard={setCurrentBoard}
              setNewTaskData={setNewTaskData}
              updateBoardAfterColumnRemoval={updateBoardAfterColumnRemoval}
            />
            <div
              className={`${elem.columnId}__container
                            bg-gray-100 py-4 px-2 rounded-md w-full h-full shadow-md`}
            >
              <Droppable droppableId={elem.columnId || UNASSIGNED_COLUMN_ID}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {elem.items?.filter(keepDefined)?.map((item) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={item.position}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${item.title?.toLowerCase()}__items`}
                          >
                            <TaskCard
                              boardId={currentBoard.id}
                              columnId={elem.columnId}
                              task={item}
                              onUpdate={saveTaskData}
                              onDelete={deleteTask}
                              onSelect={() => {
                                setFocusedTask(item);
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {newTaskData &&
                      newTaskData?.column_id === elem.columnId && (
                        <TaskCard
                          boardId={currentBoard.id}
                          task={newTaskData}
                          isNew
                          isFocus
                          columnId={elem.columnId}
                          onCreate={(t) => saveNewTask(t)}
                          onDelete={(tId) => deleteTask(tId)}
                        />
                      )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}
        <div
          className={`new_column__wrapper
                            flex flex-col justify-start items-center mx-4 min-h-[80vh] 
                 w-[14rem] overflow-x-visible `}
        >
          <ColumnHeader
            board={currentBoard}
            tasks={currentTasks}
            updateTasks={setCurrentTasks}
            updateBoard={setCurrentBoard}
            setNewTaskData={setNewTaskData}
          />
        </div>
      </DragDropContext>
    </div>
  );
}
