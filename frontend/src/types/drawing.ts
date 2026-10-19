export interface Drawing {
  id: string;
  workspaceId: string;
  title: string;
  documentData: string;
  createdBy: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface DrawingSummary {
  id: string;
  workspaceId: string;
  title: string;
  createdBy: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDrawingRequest {
  title: string;
  documentData?: string;
}

export interface UpdateDrawingRequest {
  title: string;
  documentData: string;
  version: number;
}
