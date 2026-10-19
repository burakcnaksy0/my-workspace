export interface Task {
  id: string;
  workspaceId: string;
  areaId: string | null;
  areaName: string | null;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueAt: string | null;
  completedAt: string | null;
  createdBy: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  areaId?: string;
  dueAt?: string;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  areaId?: string | null;
  dueAt?: string | null;
  version: number;
}

export interface TaskStatusUpdateRequest {
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  version: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface DashboardData {
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  overdueCount: number;
  overdueTasks: Task[];
  dueTodayTasks: Task[];
  recentlyCompletedTasks: Task[];
}
