export interface IBoard {
  id: string;
  title: string;
  description?: string;
  columns: IBoardColumn[];
  created_at: string;
  updated_at?: string;
}

export interface IBoardColumn {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
}
