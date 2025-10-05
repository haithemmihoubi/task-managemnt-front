export interface Task {
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: number;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export interface TaskFilterParams {
  status?: TaskStatus;
  priority?: number;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

