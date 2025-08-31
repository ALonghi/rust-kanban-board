import { IBoard, IBoardColumn } from "../model/board";
import {
  ApiResponse,
  CreateBoardColumnResponse,
  CreateBoardRequest,
} from "../model/dto";
import { instance as axios } from "../utils/axios";
import Logger from "../utils/logging";

export default class BoardService {
  static async createBoard(board: CreateBoardRequest): Promise<IBoard> {
    try {
      Logger.info(`Adding board ${JSON.stringify(board)}`);
      const response = (await axios
        .post("/boards", board)
        .then((res) => res.data)) as ApiResponse<IBoard>;
      if (!response.success || !response.data)
        throw new Error(response.error_message);
      Logger.info(
        `Added board ${response.data?.title} with id ${response.data?.id}`,
      );
      return response.data;
    } catch (e) {
      Logger.error(
        `Error in creating board (${JSON.stringify(board)}): ${e.message || e}`,
      );
      return Promise.reject(e);
    }
  }

  static async getBoards(): Promise<IBoard[]> {
    try {
      Logger.info(`Getting boards..`);
      const response = (await axios
        .get("/boards")
        .then((res) => res.data)) as ApiResponse<IBoard[]>;
      if (!response.success || !response.data)
        throw new Error(response.error_message);
      return response.data || [];
    } catch (e) {
      Logger.error(`Error in getting boards: ${e.message || e}`);
      return Promise.reject(e);
    }
  }

  static async getBoard(board_id: IBoard["id"]): Promise<IBoard> {
    try {
      Logger.info(`Getting board with id ${board_id}..`);
      const response = (await axios
        .get(`/boards/${board_id}`)
        .then((res) => res.data)) as ApiResponse<IBoard>;
      if (!response.success || !response.data)
        throw new Error(response.error_message);
      return response.data;
    } catch (e) {
      Logger.error(`Error in getting boards: ${e.message || e}`);
      return Promise.reject(e);
    }
  }

  static async createBoardColumn(
    request: CreateBoardRequest,
    boardId: IBoard["id"],
  ): Promise<CreateBoardColumnResponse> {
    try {
      Logger.info(
        `Adding board column ${JSON.stringify(request)} for board ${boardId}`,
      );
      const response = (await axios
        .post(`/boards/${boardId}/columns`, request)
        .then((res) => res.data)) as ApiResponse<CreateBoardColumnResponse>;
      if (!response.success || !response.data)
        throw new Error(response.error_message);
      Logger.info(`Added board column with id ${response.data?.column?.id}`);
      return response.data;
    } catch (e) {
      Logger.error(
        `Error in creating board column (${JSON.stringify(
          request,
        )}) for board ${boardId}: ${e.message || e}`,
      );
      return Promise.reject(e);
    }
  }

  static async deleteBoardColumn(
    boardId: IBoard["id"],
    columnId: IBoardColumn["id"],
  ): Promise<IBoard> {
    try {
      Logger.info(`Deleting board column ${columnId} for board ${boardId}`);
      const response = (await axios
        .delete(`/boards/${boardId}/columns/${columnId}`)
        .then((res) => res.data)) as ApiResponse<IBoard>;
      if (!response.success || !response.data)
        throw new Error(response.error_message);
      Logger.info(
        `removed board column with id ${columnId} from board ${boardId}`,
      );
      return response.data;
    } catch (e) {
      Logger.error(
        `Error Deleting board column ${columnId} for board ${boardId}: ${
          e.message || e
        }`,
      );
      return Promise.reject(e);
    }
  }

  static async updateBoard(board: IBoard): Promise<IBoard> {
    try {
      Logger.info(`Updating board ${board.id}  with ${JSON.stringify(board)}`);
      const response = (await axios
        .put(`/boards`, board)
        .then((res) => res.data)) as ApiResponse<IBoard>;
      if (!response.success || !response.data)
        throw new Error(response.error_message);
      Logger.info(`Board ${board.id} updated.`);
      return response.data;
    } catch (e) {
      Logger.error(
        `Error in updating board columns (${board.id}) (${JSON.stringify(
          board?.columns,
        )}: ${e.message || e}`,
      );
      return Promise.reject(e);
    }
  }
}
