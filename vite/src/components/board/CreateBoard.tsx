import { Dialog } from "@headlessui/react";
import { useState } from "react";
import InputForm from "../shared/InputForm";
import Modal from "../shared/Modal";
import Spinner from "../shared/Spinner/Spinner";
import { CreateBoardRequest, EMPTY_BOARD_REQ } from "../../model/dto";

type CreateBoardProps = {
  open: boolean;
  setOpen: (boolean) => void;
  addBoard: (board: CreateBoardRequest) => Promise<void>;
};

export default function CreateBoard({
  open,
  setOpen,
  addBoard,
}: CreateBoardProps) {
  const [board, setBoard] = useState<CreateBoardRequest>(EMPTY_BOARD_REQ);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createBoard = () => {
    setIsLoading(true);
    addBoard(board)
      .then(() => {
        setBoard({ title: "" });
        setOpen(false);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="w-10/12 mx-auto">
        <div>
          <div className="mt-3 text-center sm:mt-5 ">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Create new board
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Add details of your new board
              </p>
            </div>
            <div className="my-12">
              <InputForm
                componentClasses="text-left"
                inputClasses="mt-2 mb-4"
                value={board.title}
                name="boardTitle"
                type="text"
                placeholder="e.g. Recruiting Board"
                label="Name"
                updateValue={(title) =>
                  setBoard((p) => ({ ...p, title: title }))
                }
              />
            </div>
          </div>
        </div>
        <div className="mt-5 sm:my-8">
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md border border-transparent
                        bg-theme-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-theme-600 focus:outline-none focus:ring-2 focus:ring-theme-700 focus:ring-offset-2 sm:text-sm"
            onClick={() => createBoard()}
          >
            {isLoading ? <Spinner size={20} colorHex="fff" /> : `Save Board`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
