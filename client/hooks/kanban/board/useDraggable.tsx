import { IBoard } from "@model/board";
import { removePositionField, UNASSIGNED_COLUMN_ID } from "@utils/helpers";
import { ITask } from "@model/task";
import { createToast, IToast } from "@model/toast";
import { addNotification } from "@stores/notificationStore";
import TaskService from "@service/taskService";

interface DragItem {
  droppableId: string;
  index: number;
}

const getElemenPointingAtUpdated = (
  dragged: DragItem,
  draggedColumnFiltered: ITask[]
) => {
  const itemBeforeOfInitialColumn: ITask | null =
    dragged.index === 0 ? null : draggedColumnFiltered[dragged.index - 1];
  const itemAfterOfInitialColumn: ITask =
    draggedColumnFiltered[dragged.index + 1];
  const itemAfterUpdated: ITask = {
    ...itemAfterOfInitialColumn,
    above_task_id: !!itemBeforeOfInitialColumn
      ? itemBeforeOfInitialColumn.id
      : null,
  };
  return itemAfterUpdated;
};

export const useDraggable = (
  tasks: ITask[],
  updateTasks: React.Dispatch<React.SetStateAction<ITask[]>>,
  boardId: IBoard["id"]
) => {
  function handleDragEnd(props) {
    console.log(`handleDragEnd props :${JSON.stringify(props, null, 2)}`);
    if (!props.destination) return;

    const dragged: DragItem | null = props.source;
    const over: DragItem | null = props.destination;

    if (
      over?.index === dragged?.index &&
      over?.droppableId === dragged?.droppableId
    )
      return;

    const tasksOfColumnDraggedFrom =
      tasks.filter((g) => g.column_id === dragged.droppableId) || [];
    const itemMoved =
      tasksOfColumnDraggedFrom?.length > 0
        ? ({
            ...tasksOfColumnDraggedFrom[dragged.index],
            column_id:
              over.droppableId === UNASSIGNED_COLUMN_ID
                ? null
                : over.droppableId,
          } as ITask)
        : null;

    const overColumnFiltered = tasks.filter(
      (t) => t.column_id === over.droppableId
    );
    const draggedColumnFiltered = tasks.filter(
      (t) => t.column_id === dragged.droppableId
    );
    // if item was dragged to the last position
    if (over.index > overColumnFiltered.length - 1) {
      const itemMovedUpdated: ITask = {
        ...itemMoved,
        above_task_id:
          overColumnFiltered?.length > 0
            ? overColumnFiltered[overColumnFiltered.length - 1].id
            : null,
      };
      // check if dragged item had one pointing at him
      if (dragged.index < draggedColumnFiltered.length - 1) {
        const itemAfterUpdated: ITask = getElemenPointingAtUpdated(
          dragged,
          draggedColumnFiltered
        );
        const toUpdate: Omit<ITask, "position">[] = removePositionField([
          itemMovedUpdated,
          itemAfterUpdated,
        ]);
        handleTasksUpdate(toUpdate, boardId);
      } else {
        const toUpdate: Omit<ITask, "position">[] = removePositionField([
          itemMovedUpdated,
        ]);
        handleTasksUpdate(toUpdate, boardId);
      }
    } else {
      // if element was dragged to a position different from the last one (of the new column)
      const belowItem: ITask = {
        ...overColumnFiltered[over.index],
        above_task_id: itemMoved.id,
      };
      const itemMovedUpdated = {
        ...itemMoved,
        above_task_id:
          over.index === 0 ? null : overColumnFiltered[over.index - 1].id,
      };
      // check if dragged item had one pointing at him
      if (dragged.index < draggedColumnFiltered.length - 1) {
        const itemAfterInitialColumnUpdated: ITask = getElemenPointingAtUpdated(
          dragged,
          draggedColumnFiltered
        );
        const toUpdate: Omit<ITask, "position">[] = removePositionField([
          belowItem,
          itemMovedUpdated,
          itemAfterInitialColumnUpdated,
        ]);
        handleTasksUpdate(toUpdate, boardId);
      } else {
        const toUpdate: Omit<ITask, "position">[] = removePositionField([
          belowItem,
          itemMovedUpdated,
        ]);
        handleTasksUpdate(toUpdate, boardId);
      }
    }

    // console.log(`itemMoved: ${JSON.stringify(itemMoved, null, 2)}`)
    // let draggedColumnFiltered = tasks.filter((t) => t.column_id === dragged.droppableId)
    // console.log(`draggedColumnFiltered before splice: ${JSON.stringify(draggedColumnFiltered, null, 2)}`)
    // draggedColumnFiltered.splice(dragged.index, 1)
    // console.log(`draggedColumnFiltered after splice: ${JSON.stringify(draggedColumnFiltered, null, 2)}`)
    // const draggedColumnMapped = mapAfterSwap(draggedColumnFiltered)
    //
    // let overColumnFiltered = tasks.filter((t) => t.column_id === over.droppableId)
    // console.log(`overColumnFiltered before splice: ${JSON.stringify(overColumnFiltered, null, 2)}`)
    // overColumnFiltered.splice(over.index, 0, itemMoved)
    // console.log(`overColumnFiltered after splice: ${JSON.stringify(overColumnFiltered, null, 2)}`)
    // const overColumnMapped = mapAfterSwap(overColumnFiltered)
    // console.log(`overColumnMapped ${JSON.stringify(overColumnMapped, null, 2)}`)
    // const previousFiltered = tasks?.filter(t => t.column_id !== dragged.droppableId && t.column_id !== over.droppableId) || []
    // console.log(`previousFiltered ${JSON.stringify(previousFiltered, null, 2)}`)
    // const result = uniqueArrayElements([
    //     ...previousFiltered,
    //     ...overColumnMapped,
    //     ...draggedColumnMapped]
    // )
    // console.log(`result after swap ${JSON.stringify(result, null, 2)}`)
    // const difference = getDifference(
    //     removePositionField(tasks),
    //     removePositionField(result)
    // );
    // handleTasksUpdate(difference, boardId);
  }

  const handleTasksUpdate = (
    updated: Omit<ITask, "position">[],
    boardId: IBoard["id"]
  ) =>
    TaskService.updateTasks(updated, boardId)
      .catch((e) => {
        const toast: IToast = createToast(
          `Error in moving tasks: ${e.message || e}`,
          "error"
        );
        addNotification(toast);
      })
      .then(() => TaskService.getTasksByBoardId(boardId))
      .then((tasks) => {
        updateTasks(() => tasks);
        const toast: IToast = createToast(
          "Tasks moved successfully.",
          "success"
        );
        addNotification(toast);
      })
      .catch((err) => {
        const toast: IToast = createToast(
          `Error in updating tasks: ${err.message}`,
          "error"
        );
        addNotification(toast);
      });

  return {
    handleDragEnd,
  };
};
