import { IBoard } from "@model/board";
import {
  getDifference,
  mapAfterSwap,
  removePositionField,
  UNASSIGNED_COLUMN_ID,
} from "@utils/helpers";
import { ITask } from "@model/task";
import { createToast, IToast } from "@model/toast";
import { addNotification } from "@stores/notificationStore";
import TaskService from "@service/taskService";

interface DragItem {
  droppableId: string;
  index: number;
}

export const useDraggable = (
  tasks: ITask[],
  updateTasks: React.Dispatch<React.SetStateAction<ITask[]>>,
  boardId: IBoard["id"]
) => {
  function handleDragEnd(props) {
    console.log(`handleDragEnd props: ${JSON.stringify(props, null, 2)}`);
    if (!props.destination || !props.source) return;

    const dragged: DragItem | null = props.source;
    const over: DragItem | null = props.destination;

    if (
      over?.index === dragged?.index &&
      over?.droppableId === dragged?.droppableId
    )
      return;

    const itemMovedArray =
      tasks.filter((g) => g.column_id === dragged.droppableId) || [];

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
    console.log(
      `dragged?.droppableId === UNASSIGNED_COLUMN_ID : ${
        dragged?.droppableId === UNASSIGNED_COLUMN_ID
      }`
    );
    let draggedColumn = tasks.filter((t) => {
      console.log(
        `t.column_id ${t.column_id} and dragged.droppableId ${
          dragged.droppableId
        } equals = ${t.column_id === dragged.droppableId}`
      );
      return dragged?.droppableId === UNASSIGNED_COLUMN_ID
        ? !t.column_id || t.column_id === dragged?.droppableId
        : t.column_id === dragged.droppableId;
    });
    console.log(`tasks before splicing: ${JSON.stringify(tasks, null, 2)}`);
    console.log(
      `dragged column before first splice: ${JSON.stringify(
        draggedColumn,
        null,
        2
      )}`
    );
    draggedColumn.splice(dragged.index, 1);
    console.log(
      `dragged column after first splice: ${JSON.stringify(
        draggedColumn,
        null,
        2
      )}`
    );

    if (over?.droppableId === dragged?.droppableId) {
      draggedColumn.splice(over?.index, 0, itemMoved);
      console.log(
        `dragged column after second splice: ${JSON.stringify(
          draggedColumn,
          null,
          2
        )}`
      );
      draggedColumn = mapAfterSwap(draggedColumn);
      console.log(
        `draggedColumn after swap ${JSON.stringify(draggedColumn, null)}`
      );
      // todo keep this or result mapping instead of concatenating tasks?
      // const ofDifferentColumn = tasks.filter(t => t.column_id !== dragged.droppableId)
      const result = tasks.map((t) => {
        const matchingUpdated: ITask | null = draggedColumn.find(
          (d) => d.id === t.id
        );
        return !!matchingUpdated ? matchingUpdated : t;
      });
      console.log(`results: ${JSON.stringify(result, null, 2)}`);
      console.log(
        `removePositionField(tasks): ${JSON.stringify(
          removePositionField(tasks),
          null,
          2
        )}`
      );
      console.log(
        `removePositionField(result): ${JSON.stringify(
          removePositionField(result),
          null,
          2
        )}`
      );
      const difference = getDifference(
        removePositionField(tasks),
        removePositionField(result)
      );
      handleTasksUpdate(difference, boardId, result);
    }

    //     let overColumn = cloned.filter((t) =>
    //         over?.droppableId === UNASSIGNED_COLUMN_ID
    //             ? !t.column_id || t.column_id === over?.droppableId
    //             : t.column_id === over.droppableId);
    //     overColumn.splice(over?.index, 0, itemMoved);
    //     overColumn = mapAfterSwap(overColumn);
    //     const result = dragged.droppableId !== over.droppableId
    //         ? [...draggedColumn, overColumn]
    //         : draggedColumn
    // :
    //     g.column_id === over.droppableId
    //         ? overColumn
    //         : g
    // ) ||
    //     [];
    //     const difference = getDifference(
    //         removePositionField(tasks),
    //         removePositionField(result)
    //     );
    //     handleTasksUpdate(difference, boardId, result);
  }

  const handleTasksUpdate = (
    updated: Omit<ITask, "position">[],
    boardId: IBoard["id"],
    groupedUpdated: ITask[]
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
