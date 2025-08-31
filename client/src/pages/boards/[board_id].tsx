import React, { useEffect, useState } from "react";
import BoardService from "@service/boardService";
import TaskService from "@service/taskService";
import { useRouter } from "next/router";
import { IBoard } from "@model/board";
import { ITask } from "@model/task";
import Spinner from "@components/shared/Spinner";
import KanbanView from "@components/board/kanban/KanbanView/KanbanView";

const BoardPage = () => {
  const router = useRouter();
  const [currentBoard, setCurrentBoard] = useState<IBoard | null>(null);
  const [currentTasks, setCurrentTasks] = useState<ITask[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const boardId = router.query.board_id?.toString();
        if (boardId) {
          const board = await BoardService.getBoard(
            router.query.board_id?.toString(),
          );
          const tasks = await TaskService.getTasksByBoardId(board.id);
          setCurrentBoard(() => board);
          setCurrentTasks(() => tasks);
        } else {
          setTimeout(() => {
            router.replace("/");
          }, 500);
        }
      } catch (e) {
        console.error(`Error in fetching board page: ${e.message || e}`);
      }
    })();
  }, []);
  return (
    <div className={`relative h-full w-full`}>
      {currentBoard && currentTasks ? (
        <main className={`sm:w-10/12 sm:mx-auto flex flex-col my-4 `}>
          <div className="flex flex-col text-left w-full max-w-full ">
            <h1 className="w-8/12 text-3xl sm:text-4xl font-bold clip">
              {currentBoard?.title}
              {!currentBoard?.title?.toLowerCase()?.includes("board") && (
                <span className="ml-2 text-gradient">board</span>
              )}
            </h1>
            <div className="max-w-full">
              <KanbanView board={currentBoard} tasks={currentTasks} />
            </div>
          </div>
        </main>
      ) : (
        <Spinner classes={`m-auto flex absolute top-1/2 left-1/2`} />
      )}
    </div>
  );
};

export default BoardPage;
