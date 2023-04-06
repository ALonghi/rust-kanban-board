import {IBoard} from "../../../../model/board";
import GroupedTasks from "../../../../model/groupedTasks";
import {ITask} from "../../../../model/task";
import {createToast, IToast} from "@/model/toast";
import TaskService from "../../../../service/taskService";
import {addNotification} from "../../../../stores/notificationStore";
import {getDifference, mapAfterSwap, removePositionField, UNASSIGNED_COLUMN_ID,} from "../../../../utils/helpers";

interface DragItem {
    droppableId: string;
    index: number;
}

export const useDraggable = (
    groupedTasks: GroupedTasks[],
    updateTasks: React.Dispatch<React.SetStateAction<GroupedTasks[]>>,
    boardId: IBoard["id"]
) => {
    function handleDragEnd(props) {
        console.log(`handleDragEnd props: ${JSON.stringify(props, null, 2)}`)
        if (!props.destination || !props.source) return;

        const dragged: DragItem | null = props.source;
        const over: DragItem | null = props.destination;
        let tasks: GroupedTasks[] = JSON.parse(JSON.stringify(groupedTasks));

        if (
            over?.index === dragged?.index &&
            over?.droppableId === dragged?.droppableId
        )
            return;

        const itemMovedArray =
            tasks.find((g) => g.columnId === dragged.droppableId)?.items || [];
        const itemMoved =
            itemMovedArray?.length > 0
                ? ({
                    ...itemMovedArray[dragged.index],
                    column_id:
                        over?.droppableId === UNASSIGNED_COLUMN_ID
                            ? null
                            : over?.droppableId,
                } as ITask)
                : null;
        let draggedColumn = tasks.find((t) => t.columnId === dragged?.droppableId);
        draggedColumn.items.splice(dragged.index, 1);
        draggedColumn.items = mapAfterSwap(draggedColumn.items);

        let overColumn = tasks.find((t) => t.columnId === over?.droppableId);
        overColumn.items.splice(over?.index, 0, itemMoved);
        overColumn.items = mapAfterSwap(overColumn.items);
        const result = tasks.map((g) =>
            g.columnId === draggedColumn.columnId
                ? draggedColumn
                : g.columnId === overColumn.columnId
                    ? overColumn
                    : g
        );
        const difference = getDifference(
            removePositionField(groupedTasks),
            removePositionField(result)
        );
        handleTasksUpdate(difference, boardId, result);
    }

    const handleTasksUpdate = (
        updated: Omit<ITask, "position">[],
        boardId: IBoard["id"],
        groupedUpdated: GroupedTasks[]
    ) =>
        TaskService.updateTasks(updated, boardId)
            .then(() => {
                updateTasks(() => groupedUpdated);
                const toast: IToast = createToast(
                    "Tasks moved successfully.",
                    "success"
                );
                addNotification(toast);
            })
            .catch((err) => {
                const toast: IToast = createToast(
                    `Error in moving task: ${err.message}`,
                    "error"
                );
                addNotification(toast);
                console.error(`Received error ${err.message || err}`);
            });

    return {
        handleDragEnd,
    };
};
