'use client';

import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {IBoard} from "../../../../model/board";
import {ITask} from "../../../../model/task";
import {UNASSIGNED_COLUMN_ID, UNASSIGNED_COLUMN_NAME,} from "../../../../utils/helpers";
import ColumnHeader from "../BoardColumn/ColumnHeader";
import {useColumnHooks} from "../BoardColumn/useColumnHooks";
import TaskCard from "../TaskCard";
import {useDraggable} from "./useDraggable";
import {useKanbanData} from "./useKanbanData";

type KanbanViewProps = {
    board: IBoard;
    tasks: ITask[];
};

export default function KanbanView({board, tasks}: KanbanViewProps) {
    const {
        currentBoard,
        groupedTasks,
        setGroupedTasks,
        updateBoardColumn,
        newTaskData,
        setNewTaskData,
    } = useKanbanData(board, tasks);

    const {saveNewTask, deleteTask, saveTaskData} = useColumnHooks(
        board.id,
        groupedTasks,
        setGroupedTasks,
        setNewTaskData
    );

    const {handleDragEnd} = useDraggable(
        groupedTasks,
        setGroupedTasks,
        board.id
    );

    return (
        <div
            className="mx-2 my-8 min-w-full flex flex-1 items-stretch
    gap-x-2 overflow-x-scroll flex-nowrap w-fit"
        >
            <DragDropContext onDragEnd={handleDragEnd}>
                {groupedTasks.map((elem) => (
                    <div
                        className={`${elem.columnId}__wrapper
                            flex flex-col justify-start items-center mx-4 min-h-[80vh] 
                 w-[14rem] overflow-x-visible `}
                        key={elem.columnId || UNASSIGNED_COLUMN_ID}
                    >
                        <ColumnHeader
                            board={board}
                            column={elem.column}
                            allGroupedTasks={groupedTasks}
                            updateGroupedTasks={setGroupedTasks}
                            overriddenName={elem.column?.name || UNASSIGNED_COLUMN_NAME}
                            updateBoardColumn={updateBoardColumn}
                            setNewTaskData={setNewTaskData}
                        />
                        <div
                            className={`${elem.columnId}__container
                            bg-gray-100 py-4 px-2 rounded-md w-full h-full shadow-md`}
                        >
                            <Droppable droppableId={elem.columnId || UNASSIGNED_COLUMN_ID}
                                       type={elem.columnId || UNASSIGNED_COLUMN_ID}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps}>
                                        {elem.items.map((item) => (
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
                                                        className={`${item.title.toLowerCase()}__items`}
                                                        onClick={() => console.log(`Clicked: ${JSON.stringify(item, null, 2)}!`)}
                                                    >
                                                        <TaskCard
                                                            boardId={currentBoard.id}
                                                            columnId={elem.columnId}
                                                            task={item}
                                                            onUpdate={saveTaskData}
                                                            onDelete={deleteTask}
                                                        />
                                                    </div>
                                                )
                                                }
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
                                                    onDelete={(tId, colId) => deleteTask(tId, colId)}
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
                        board={board}
                        allGroupedTasks={groupedTasks}
                        updateGroupedTasks={setGroupedTasks}
                        updateBoardColumn={updateBoardColumn}
                        setNewTaskData={setNewTaskData}
                    />
                </div>
            </DragDropContext>
        </div>
    );
}
