import React, {useEffect, useState} from "react";
import BoardService from "@/service/boardService";
import KanbanView from "@/components/board/kanban/KanbanView/KanbanView";
import TaskService from "@/service/taskService";
import {IBoard} from "@/model/board";
import {ITask} from "@/model/task";
import Spinner from "@/components/shared/Spinner/Spinner";
import {useNavigate, useParams} from 'react-router-dom';

const BoardPage = () => {
    const router = useParams();
    const navigate = useNavigate();
    const [currentBoard, setCurrentBoard] = useState<IBoard | null>(null)
    const [currentTasks, setCurrentTasks] = useState<ITask[]>([])

    useEffect(() => {
        (async () => {
            try {
                const boardId = router.board_id?.toString()
                if (boardId) {
                    console.log(`router.query ${boardId} ${JSON.stringify(router.query)} `)
                    const board = await BoardService.getBoard(router.board_id?.toString());
                    const tasks = await TaskService.getTasksByBoardId(board.id);
                    setCurrentBoard(() => board)
                    setCurrentTasks(() => tasks)
                } else {
                    console.log(`no board provided: ${JSON.stringify(router)}`)
                    setTimeout(() => {
                        navigate("/")
                    }, 500)
                }
            } catch (e) {
                console.error(`Error in fetching board page: ${e.message || e}`)
            }
        })()
    }, [])
    return (
        <>{currentBoard && currentTasks ? (
                <main className={`w-full h-full flex flex-col`}>
                    <div className="flex flex-col text-left w-full max-w-full overflow-x-overlay">
                        <h1 className="w-8/12 text-3xl sm:text-4xl font-bold clip">
                            {currentBoard?.title}
                            {
                                !currentBoard?.title?.toLowerCase()?.includes("board") && (
                                    <span className="ml-2 text-gradient">board</span>
                                )
                            }
                        </h1>
                        <div className="overflow-x-auto max-w-full">
                            <KanbanView board={currentBoard} tasks={currentTasks}/>
                        </div>
                    </div>
                </main>)
            :
            <Spinner classes={`m-auto flex`}/>
        }
        </>
    )
}

export default BoardPage
