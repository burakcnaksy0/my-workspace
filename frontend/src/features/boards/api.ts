import { apiRequest } from '../../lib/api';
import type {
  BoardSummary,
  BoardDetails,
  CreateBoardRequest,
  UpdateBoardRequest,
  BoardColumn,
  CreateColumnRequest,
  UpdateColumnRequest,
  BoardItem,
  CreateBoardItemRequest,
  UpdateBoardItemPositionRequest,
  BoardEdge,
  CreateBoardEdgeRequest,
} from './types';

export const boardsApi = {
  getBoards: (workspaceId: string, areaId?: string | null) => {
    const url = areaId
      ? `/api/workspaces/${workspaceId}/boards?areaId=${areaId}`
      : `/api/workspaces/${workspaceId}/boards`;
    return apiRequest<BoardSummary[]>(url);
  },

  getBoard: (workspaceId: string, boardId: string) => {
    return apiRequest<BoardDetails>(`/api/workspaces/${workspaceId}/boards/${boardId}`);
  },

  createBoard: (workspaceId: string, payload: CreateBoardRequest) => {
    return apiRequest<BoardDetails>(`/api/workspaces/${workspaceId}/boards`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateBoard: (workspaceId: string, boardId: string, payload: UpdateBoardRequest) => {
    return apiRequest<BoardDetails>(`/api/workspaces/${workspaceId}/boards/${boardId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteBoard: (workspaceId: string, boardId: string) => {
    return apiRequest<void>(`/api/workspaces/${workspaceId}/boards/${boardId}`, {
      method: 'DELETE',
    });
  },

  // Sütunlar
  createColumn: (workspaceId: string, boardId: string, payload: CreateColumnRequest) => {
    return apiRequest<BoardColumn>(`/api/workspaces/${workspaceId}/boards/${boardId}/columns`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateColumn: (workspaceId: string, boardId: string, columnId: string, payload: UpdateColumnRequest) => {
    return apiRequest<BoardColumn>(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteColumn: (workspaceId: string, boardId: string, columnId: string) => {
    return apiRequest<void>(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`, {
      method: 'DELETE',
    });
  },

  // Öğeler
  addItem: (workspaceId: string, boardId: string, payload: CreateBoardItemRequest) => {
    return apiRequest<BoardItem>(`/api/workspaces/${workspaceId}/boards/${boardId}/items`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  batchUpdateItems: (workspaceId: string, boardId: string, items: UpdateBoardItemPositionRequest[]) => {
    return apiRequest<BoardItem[]>(`/api/workspaces/${workspaceId}/boards/${boardId}/items`, {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    });
  },

  removeItem: (workspaceId: string, boardId: string, itemId: string) => {
    return apiRequest<void>(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Bağlantılar (Edges)
  createEdge: (workspaceId: string, boardId: string, payload: CreateBoardEdgeRequest) => {
    return apiRequest<BoardEdge>(`/api/workspaces/${workspaceId}/boards/${boardId}/edges`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteEdge: (workspaceId: string, boardId: string, edgeId: string) => {
    return apiRequest<void>(`/api/workspaces/${workspaceId}/boards/${boardId}/edges/${edgeId}`, {
      method: 'DELETE',
    });
  },
};
