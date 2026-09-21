export interface ProjectUser {
  id: number;
  fullName: string;
  email: string;
}

export interface Project {
  id?: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: ProjectStatus;
  manager: ProjectUser;
  members: ProjectUser[];
}

export enum ProjectStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  managerId?: number;
  memberIds: number[];
}