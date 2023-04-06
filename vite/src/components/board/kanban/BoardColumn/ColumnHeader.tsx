'use client';

import {PencilIcon, PlusIcon} from "@heroicons/react/24/outline";
import {useState} from "react";
import {IBoard, IBoardColumn} from "../../../../model/board";
import {getEmptyTask, ITask} from "../../../../model/task";
import SaveIcon from "../../../shared/SaveIcon";
import {getEmptyGroupedColumn, UNASSIGNED_COLUMN_ID, UNASSIGNED_COLUMN_NAME} from "../../../../utils/helpers";
import BoardService from "../../../../service/boardService";
import {CreateBoardColumnRequest} from "../../../../model/dto";
import GroupedTasks from "../../../../model/groupedTasks";

type ColumnHeaderProps = {
    board: IBoard;
    column?: IBoardColumn;
    allGroupedTasks?: GroupedTasks[];
    overriddenName?: string;
    updateBoardColumn: (column: IBoardColumn) => Promise<void>;
    updateGroupedTasks: React.Dispatch<React.SetStateAction<GroupedTasks[]>>;
    setNewTaskData: (task: Omit<ITask, "id" | "created_at" | "position">) => void;
};

export default function ColumnHeader({
                                         board,
                                         column,
                                         allGroupedTasks,
                                         overriddenName,
                                         updateBoardColumn,
                                         updateGroupedTasks,
                                         setNewTaskData,
                                     }: ColumnHeaderProps) {
    const [currentColumn, setCurrentColumn] = useState<IBoardColumn | null>(
        column || null
    );

    const [newColumnName, setNewColumnName] = useState<string>(column?.name || "")
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [unassignedWasHandled, setUnassignedWasHandled] = useState<boolean>(false);
    const [showColumnIcons, setShowColumnIcons] = useState<boolean>(false)
    const saveColumn = async () => {
        if (!column?.id || column?.id === UNASSIGNED_COLUMN_ID) {
            const req: CreateBoardColumnRequest = {
                title: newColumnName,
                items: allGroupedTasks
                    .filter(g => g.columnId === column?.id)
                    .flatMap(g => g.items)
            }
            BoardService
                .createBoardColumn(req, board.id)
                .then(response => {
                    updateBoardColumn(response.column)
                    updateGroupedTasks((prev) => {
                        return [getEmptyGroupedColumn(), ...prev.map(g =>
                            g.columnId === UNASSIGNED_COLUMN_ID
                                ? {columnId: response.column.id, items: response.items, column: response.column}
                                : g
                        )]
                    })
                })
                .then(() => {
                    setIsTyping(false)
                    setNewColumnName(column?.name || UNASSIGNED_COLUMN_NAME)
                })
        } else {
            await updateBoardColumn(currentColumn).then(() => {
                setIsTyping(false);
                setCurrentColumn(null);
            });
        }

    };

    console.log(`isTyping ${isTyping}`)
    return (
        <>
            <div
                className={` mb-4 letter-spacing-2 py-2 px-4 flex flex-col
              bg-gray-100 rounded-t-md w-full`}
                onMouseEnter={() => setShowColumnIcons(true)}
                onMouseLeave={() => setShowColumnIcons(false)}
            >
                {currentColumn?.name || overriddenName ? (
                    <div className={`flex flex-row justify-between items-center`}>
                        {isTyping
                            ? <>
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
                                <SaveIcon saveAction={saveColumn}/>
                            </>
                            : <>
                                <p
                                    className={`w-fit font-bold text-gray-700 ${
                                        overriddenName ? `` : `uppercase`
                                    } text-sm h-full`}
                                >
                                    {currentColumn?.name ||
                                        (overriddenName ? overriddenName : "Create new column")}
                                </p>
                                <PencilIcon className={`visible ${showColumnIcons ? `sm:flex` : `sm:invisible`}
                        w-4 text-gray-700 cursor-pointer`}
                                            onClick={() => setIsTyping(true)}/>
                            </>
                        }
                    </div>
                ) : (
                    <div className="flex w-full justify-between items-center">
                        <input
                            className={`bg-inherit font-bold text-gray-700 text-sm w-full 
                            outline-0 h-full
                            `}
                            onKeyDown={(e) => (e.key === "Enter" ? saveColumn() : null)}
                            onChange={(e) => {
                                setIsTyping(true)
                                setNewColumnName(e.target.value)
                            }}
                            value={currentColumn?.name || newColumnName}
                            placeholder="Create new column.."
                        />
                        {isTyping && <SaveIcon saveAction={saveColumn}/>}
                    </div>
                )}
            </div>
            {column?.id &&
                <p className={`mt-[-1rem] text-sm text-left text-emerald-400`}>{column?.id?.substring(0, 5)}</p>}
            <div
                className={`bg-gray-100 hover:bg-gray-200 py-0.5 px-4 mb-2 rounded-md w-full cursor-pointer`}
                onClick={() =>
                    setNewTaskData(
                        getEmptyTask(board.id, currentColumn?.id || UNASSIGNED_COLUMN_ID)
                    )
                }
            >
                <PlusIcon className={`text-gray-500 w-5 mx-auto`}/>
            </div>
        </>
    );
}
