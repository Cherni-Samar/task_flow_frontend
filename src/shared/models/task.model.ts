export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface TaskUser {
  id: number;
  fullName: string;
  email: string;
}

export interface TaskProject {
  id: number;
  name: string;
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
  project: TaskProject;
  assignedTo?: TaskUser | null;
  createdBy?: TaskUser | null;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  projectId: number;
  assignedToId?: number | null;
}