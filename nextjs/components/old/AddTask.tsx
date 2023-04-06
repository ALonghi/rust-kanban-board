import { useState } from "react";

const AddTask = ({ socket }) => {
	const [task, setTask] = useState("");

	const handleAddTodo = (e) => {
		e.preventDefault();
		socket.emit("createTask", { task });
		setTask("");
	};
	return (
		<form className='flex items-center justify-center gap-x-2 mt-4 border-b pb-8' onSubmit={handleAddTodo}>
			<label htmlFor='task'>Add Todo</label>
			<input
				type='text'
				name='task'
				id='task'
				value={task}
				className='border border-gray-300 rounded-md'
				required
				onChange={(e) => setTask(e.target.value)}
			/>
			<button className='bg-emerald-500 text-white rounded-md
			py-1 px-6 '>ADD TODO</button>
		</form>
	);
};

export default AddTask;
