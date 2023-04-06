import BoardService from "@service/boardService";
import React, { useState } from "react";
import { CreateBoardRequest } from "@model/dto";
import { IBoard } from "@model/board";
import { PlusIcon } from "@heroicons/react/24/outline";
import BoardCard from "@components/board/BoardCard";
import EmptyBoard from "@components/board/EmptyBoard";
import CreateBoard from "@components/board/CreateBoard";

export async function getStaticProps() {
  try {
    const boards = await BoardService.getBoards();
    return {
      props: {
        boards,
      },
      revalidate: process.env.NODE_ENV === "development" ? false : 60 * 60 * 12, // 12 hours
    };
  } catch (e) {
    return {
      props: {},
    };
  }
}

export default function BoardsOverview({ boards }) {
  const [currentBoards, setCurrentBoards] = useState<IBoard[]>(boards || []);
  const [open, setOpen] = useState<boolean>(false);

  const addBoard = async (board: CreateBoardRequest) => {
    return await BoardService.createBoard(board).then(
      (board_response: IBoard) => {
        setCurrentBoards((prev) => [...prev, board_response]);
        setOpen(false);
      }
    );
  };

  return (
    <>
      <div
        className="my-16 flex sm:w-10/12 items-center justify-between mx-auto flex-row
            sm:ml-8 sm:mx-auto"
      >
        <h1 className="w-8/12 text-3xl sm:text-4xl font-bold clip">
          Welcome to <span className="text-gradient">your Boards</span>
        </h1>
        {currentBoards?.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center rounded-md border border-transparent bg-theme-400
                    px-4 py-1.5 h-fit text-sm font-base text-white shadow-sm
                    hover:bg-theme-500 focus:outline-none focus:ring-2 focus:ring-theme-700 focus:ring-offset-2"
          >
            <PlusIcon className="-ml-2 mr-2 h-5 w-5" aria-hidden="true" />
            Create
          </button>
        )}
      </div>

      {currentBoards?.length > 0 ? (
        <ul className="w-10/12 mx-auto flex justify-start items-start flex-wrap">
          {currentBoards.map((board) => (
            <BoardCard board={board} key={board.id} />
          ))}
        </ul>
      ) : (
        <div className="mt-8 w-10/12 md:w-6/12 mx-auto">
          <EmptyBoard setOpen={setOpen} />
        </div>
      )}
      <CreateBoard
        open={open}
        setOpen={setOpen}
        addBoard={(board) => addBoard(board)}
      />
    </>
  );
}
