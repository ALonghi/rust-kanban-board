import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const TasksContainer = ({ socket }) => {
	const [tasks, setTasks] = useState({});

	useEffect(() => {
		function fetchTasks() {
			fetch("http://localhost:4000/api")
				.then((res) => res.json())
				.then((data) => setTasks(data));
		}
		fetchTasks();
	}, []);

	useEffect(() => {
		socket.on("tasks", (data) => {
			setTasks(data);
		});
	}, [socket]);

	const handleDragEnd = ({ destination, source }) => {
		console.log(`destination : ${JSON.stringify(destination, null, 2)}`)
		console.log(`source : ${JSON.stringify(source, null, 2)}`)
		if (!destination) return;
		if (
			destination.index === source.index &&
			destination.droppableId === source.droppableId
		)
			return;

		socket.emit("taskDragged", {
			source,
			destination,
		});
	};
	return (
		<div className='flex flex-row justify-center items-start gap-x-8 mt-12'>
			<DragDropContext onDragEnd={handleDragEnd}>
				{Object.entries(tasks).map((task) => (
					<div
						className={`${task[1].title.toLowerCase()}__wrapper
						flex flex-col justify-start items-center mx-4 min-h-[80vh] 
                 w-[14rem] overflow-x-visible `}
						key={task[1].title}
					>
						<h3 className="my-4 font-medium">{task[1].title} Tasks</h3>
						<div className={`${task[1].title.toLowerCase()}__container
						bg-gray-100 py-4 px-2 rounded-md w-full h-full shadow-md`}>
							<Droppable droppableId={task[1].title}>
								{(provided) => (
									<div ref={provided.innerRef} {...provided.droppableProps}>
										{task[1].items.map((item, index) => (
											<Draggable
												key={item.id}
												draggableId={item.id}
												index={index}
											>
												{(provided) => (
													<div
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														className={`${task[1].title.toLowerCase()}__items
														cursor-move relative flex items-start space-x-3 rounded-lg
            border-0 border-gray-300 bg-white px-4 py-4 shadow-md mt-3 max-w-full h-[7rem]`}
													>
														<p>{item.title}</p>
													</div>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</div>
					</div>
				))}
			</DragDropContext>
		</div>
	);
};

export default TasksContainer;
