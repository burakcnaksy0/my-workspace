import { apiRequest } from '../../lib/api';

export type ContentRefType = 'TASK' | 'NOTE' | 'DRAWING';

export interface ContentLinkDto {
  id: string;
  workspaceId: string;
  sourceType: ContentRefType;
  sourceId: string;
  sourceTitle: string;
  sourceExists: boolean;
  targetType: ContentRefType;
  targetId: string;
  targetTitle: string;
  targetExists: boolean;
  label: string | null;
  createdAt: string;
}

export interface CreateContentLinkRequest {
  sourceType: ContentRefType;
  sourceId: string;
  targetType: ContentRefType;
  targetId: string;
  label?: string;
}

/** Seçim listeleri için sadeleştirilmiş hedef adayı. */
export interface ContentCandidate {
  id: string;
  title: string;
}

export const REF_TYPE_LABELS: Record<ContentRefType, string> = {
  TASK: 'Görev',
  NOTE: 'Not',
  DRAWING: 'Çizim',
};

export const contentLinksApi = {
  listRelated: (workspaceId: string, refType: ContentRefType, refId: string) =>
    apiRequest<ContentLinkDto[]>(
      `/api/workspaces/${workspaceId}/content-links?refType=${refType}&refId=${refId}`
    ),

  create: (workspaceId: string, payload: CreateContentLinkRequest) =>
    apiRequest<ContentLinkDto>(`/api/workspaces/${workspaceId}/content-links`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  remove: (workspaceId: string, linkId: string) =>
    apiRequest<void>(`/api/workspaces/${workspaceId}/content-links/${linkId}`, {
      method: 'DELETE',
    }),
};

/** Bir içerik türü için bağlantı kurulabilecek adayları (id + başlık) getirir. */
export async function fetchCandidates(
  workspaceId: string,
  type: ContentRefType
): Promise<ContentCandidate[]> {
  if (type === 'DRAWING') {
    const items = await apiRequest<Array<{ id: string; title: string }>>(
      `/api/workspaces/${workspaceId}/drawings`
    );
    return items.map((d) => ({ id: d.id, title: d.title }));
  }
  if (type === 'NOTE') {
    const page = await apiRequest<{ content: Array<{ id: string; title: string }> }>(
      `/api/workspaces/${workspaceId}/notes?page=0&size=100`
    );
    return page.content.map((n) => ({ id: n.id, title: n.title }));
  }
  const page = await apiRequest<{ content: Array<{ id: string; title: string }> }>(
    `/api/workspaces/${workspaceId}/tasks?page=0&size=100`
  );
  return page.content.map((t) => ({ id: t.id, title: t.title }));
}
