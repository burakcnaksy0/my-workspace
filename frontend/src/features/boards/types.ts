export type BoardType = 'COLUMNS' | 'FREEFORM';

export interface BoardSummary {
  id: string;
  workspaceId: string;
  areaId: string | null;
  name: string;
  boardType: BoardType;
  createdAt: string;
  updatedAt: string;
}

export interface BoardColumn {
  id: string;
  boardId: string;
  name: string;
  sortOrder: number;
  mappedStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BoardItem {
  id: string;
  boardId: string;
  itemType: 'TASK' | 'NOTE' | 'DRAWING';
  itemId: string;
  positionX: number;
  positionY: number;
  width: number | null;
  height: number | null;
  sortOrder: number;
  columnId: string | null;
  itemDetails: {
    title?: string;
    status?: string;
    priority?: string;
    dueAt?: string;
    snippet?: string;
    [key: string]: unknown;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface BoardEdge {
  id: string;
  boardId: string;
  sourceItemId: string;
  targetItemId: string;
  label: string | null;
  createdAt: string;
}

export interface BoardDetails {
  id: string;
  workspaceId: string;
  areaId: string | null;
  name: string;
  boardType: BoardType;
  layoutConfig: string;
  version: number;
  columns: BoardColumn[];
  items: BoardItem[];
  edges: BoardEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardRequest {
  name: string;
  boardType: BoardType;
  areaId?: string | null;
  layoutConfig?: string;
  initialColumns?: {
    name: string;
    sortOrder?: number;
    mappedStatus?: string | null;
  }[];
}

export interface UpdateBoardRequest {
  name: string;
  areaId?: string | null;
  layoutConfig?: string;
  version: number;
}

export interface CreateColumnRequest {
  name: string;
  sortOrder?: number;
  mappedStatus?: string | null;
}

export interface UpdateColumnRequest {
  name: string;
  sortOrder?: number;
  mappedStatus?: string | null;
}

export interface CreateBoardItemRequest {
  itemType: 'TASK' | 'NOTE' | 'DRAWING';
  itemId: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  sortOrder?: number;
  columnId?: string;
}

export interface UpdateBoardItemPositionRequest {
  id: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  sortOrder?: number;
  columnId?: string | null;
}

export interface CreateBoardEdgeRequest {
  sourceItemId: string;
  targetItemId: string;
  label?: string;
}
