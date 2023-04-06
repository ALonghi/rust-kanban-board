import {ClockIcon} from "@heroicons/react/24/outline";
import {IBoard} from "../../model/board";
import DateUtils from "../../utils/dateUtils";
import {Link} from "react-router-dom";

type BoardCardProps = {
    board: IBoard;
};

export default function BoardCard({board}: BoardCardProps) {
    return (
        <div className="mx-2 my-4 w-full sm:w-64 cursor-pointer rounded-lg bg-white shadow-md border border-gray-200">
            <Link to={`/boards/${board.id}`}>
                <div className="flex w-full items-center justify-between space-x-6 p-6 border-b border-gray-100">
                    <div className="flex-1 truncate">
                        <div className="flex  space-x-3">
                            <h3 className="truncate text-sm font-medium text-gray-900">
                                {board.title}
                            </h3>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="-mt-px flex divide-x divide-gray-200">
                        <div className="flex py-2 pl-2 text-sm text-gray-400 items-center">
                            <ClockIcon className="h-4 w-4 text-gray-400" aria-hidden="true"/>
                            <span className="ml-3">
                {board.updated_at
                    ? DateUtils.convertToReadableWithHours(board.updated_at)
                    : DateUtils.convertToReadableWithHours(board.created_at)}{" "}
              </span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
