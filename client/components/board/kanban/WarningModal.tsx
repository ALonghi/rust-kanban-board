import Modal from "@components/shared/Modal";
import React from "react";
import { IBoardColumn } from "@model/board";

type WarningModalProps = {
  isOpen: boolean;
  closeFun: Function;
  column?: IBoardColumn;
  confirmedAction: Function;
};
const WarningModal = ({
  isOpen,
  closeFun,
  column,
  confirmedAction,
}: WarningModalProps) => {
  return (
    column && (
      <Modal open={isOpen} setOpen={closeFun}>
        <div className={`flex flex-col items-center justify-center  mt-8`}>
          <p className={`w-9/12 mx-auto text-center`}>
            Are you sure you want to delete the column with name{" "}
            <b>{column?.name}</b>?
          </p>
          <div
            className={`text-sm text-center text-gray-500  mt-4 gap-y-1 flex flex-col`}
          >
            <p className={`underline `}>This action is irreversible.</p>
            <p> All related tasks will be deleted if not moved before.</p>
          </div>
          <button
            onClick={() => confirmedAction()}
            type={"button"}
            className={`hover:bg-theme-500 bg-theme-600 text-white rounded-md mt-10 mb-7 py-2 px-8 uppercase text-sm`}
          >
            Delete column and related tasks
          </button>
        </div>
      </Modal>
    )
  );
};

export default WarningModal;
