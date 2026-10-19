export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  settings: string;
  role: string;
  createdAt: string;
}

export interface Area {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
}

export interface CreateAreaRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}
