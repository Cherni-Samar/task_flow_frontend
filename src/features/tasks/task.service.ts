import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Task,
  CreateTaskRequest,
  TaskStatus
} from '../../shared/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:8088/taskflow/api/tasks';

  constructor(private http: HttpClient) {}

  // =========================
  // GET ALL TASKS
  // =========================

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  // =========================
  // GET TASK BY ID
  // =========================

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  // =========================
  // GET TASKS BY PROJECT
  // =========================

  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(
      `${this.apiUrl}/project/${projectId}`
    );
  }

  // =========================
  // GET TASKS BY USER
  // =========================

  getTasksByUser(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(
      `${this.apiUrl}/user/${userId}`
    );
  }

  // =========================
  // GET TASKS BY PROJECT + USER
  // =========================

  getTasksByProjectAndUser(
    projectId: number,
    userId: number
  ): Observable<Task[]> {

    return this.http.get<Task[]>(
      `${this.apiUrl}/project/${projectId}/user/${userId}`
    );
  }

  // =========================
  // CREATE TASK
  // =========================

  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(
      this.apiUrl,
      task
    );
  }

  // =========================
  // UPDATE TASK
  // =========================

  updateTask(
    id: number,
    task: CreateTaskRequest
  ): Observable<Task> {

    return this.http.put<Task>(
      `${this.apiUrl}/${id}`,
      task
    );
  }

  // =========================
  // UPDATE STATUS
  // =========================

  updateStatus(
    id: number,
    status: TaskStatus
  ): Observable<Task> {

    return this.http.patch<Task>(
      `${this.apiUrl}/${id}/status`,
      null,
      {
        params: {
          status
        }
      }
    );
  }

  // =========================
  // DELETE TASK
  // =========================

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}