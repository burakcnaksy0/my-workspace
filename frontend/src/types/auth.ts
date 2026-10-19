export interface AuthUser {
  id: string;
  username: string;
  status: string;
  defaultWorkspaceId: string | null;
  defaultWorkspaceName: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}
