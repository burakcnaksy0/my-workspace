export interface Note {
  id: string;
  workspaceId: string;
  areaId: string | null;
  title: string;
  content: string | null;
  contentText: string | null;
  contentFormat: string;
  tags: string[];
  createdBy: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoteSummary {
  id: string;
  workspaceId: string;
  areaId: string | null;
  title: string;
  snippet: string;
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  areaId?: string | null;
  content?: string;
  contentText?: string;
  contentFormat?: string;
  tags?: string[];
}

export interface UpdateNoteRequest {
  title: string;
  areaId?: string | null;
  content?: string;
  contentText?: string;
  contentFormat?: string;
  tags?: string[];
  version: number;
}

export interface TagItem {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: string;
}
