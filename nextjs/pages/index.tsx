import React, {useEffect, useState} from "react";
import BoardService from "@service/boardService";
import KanbanView from "@components/board/kanban/KanbanView/KanbanView";
import TaskService from "@service/taskService";
import {useRouter} from "next/router";
import {IBoard} from "@model/board";
import {ITask} from "@model/task";
import socketIO from "socket.io-client";
// @ts-ignore
const socket = socketIO.connect("http://localhost:4000");

const BoardPage = () => {

    return (
        <KanbanView socket={socket}/>
    )
}

export default BoardPage
