import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  Task,
  TaskPriority,
  TaskStatus
} from '../../../shared/models/task.model';

import { TaskService } from '../task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {

  tasks: Task[] = [];

  loading = false;
  errorMessage = '';

  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  constructor(
    private taskService: TaskService, private cdr: ChangeDetectorRef

  ) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  // =========================
  // LOAD TASKS
  // =========================

  loadTasks(): void {

    this.loading = true;
    this.errorMessage = '';

    this.taskService.getAllTasks().subscribe({

      next: (data) => {

        console.log('✅ TÂCHES CHARGÉES :', data);

        this.tasks = data;
        this.loading = false;

        // Force Angular à mettre à jour l'affichage
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          '❌ Erreur chargement tâches :',
          error
        );

        this.errorMessage =
          'Impossible de charger les tâches.';

        this.loading = false;

        this.cdr.detectChanges();
      }

    });
  }

  // =========================
  // DELETE TASK
  // =========================

  deleteTask(task: Task): void {

    if (!task.id) {
      return;
    }

    const confirmed = confirm(
      `Voulez-vous vraiment supprimer la tâche "${task.title}" ?`
    );

    if (!confirmed) {
      return;
    }

    this.taskService.deleteTask(task.id).subscribe({

      next: () => {

        console.log(
          '✅ Tâche supprimée :',
          task.id
        );

        this.tasks = this.tasks.filter(
          t => t.id !== task.id
        );

      },

      error: (error) => {

        console.error(
          '❌ Erreur suppression :',
          error
        );

        alert(
          'Impossible de supprimer cette tâche.'
        );

      }

    });
  }

  // =========================
  // UPDATE STATUS
  // =========================

  updateStatus(
    task: Task,
    status: TaskStatus
  ): void {

    if (!task.id) {
      return;
    }

    this.taskService
      .updateStatus(task.id, status)
      .subscribe({

        next: (updatedTask) => {

          console.log(
            '✅ Statut modifié :',
            updatedTask
          );

          task.status = updatedTask.status;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            '❌ Erreur modification statut :',
            error
          );

          alert(
            'Impossible de modifier le statut.'
          );

        }

      });
  }

  // =========================
  // STATUS LABEL
  // =========================

  getStatusLabel(status: TaskStatus): string {

    switch (status) {

      case TaskStatus.TODO:
        return 'À faire';

      case TaskStatus.IN_PROGRESS:
        return 'En cours';

      case TaskStatus.COMPLETED:
        return 'Terminée';

      case TaskStatus.OVERDUE:
        return 'En retard';

      default:
        return status;
    }
  }

  // =========================
  // PRIORITY LABEL
  // =========================

  getPriorityLabel(priority: TaskPriority): string {

    switch (priority) {

      case TaskPriority.LOW:
        return 'Faible';

      case TaskPriority.MEDIUM:
        return 'Moyenne';

      case TaskPriority.HIGH:
        return 'Élevée';

      case TaskPriority.URGENT:
        return 'Urgente';

      default:
        return priority;
    }
  }

  // =========================
  // DATE FORMAT
  // =========================

  formatDate(date: string): string {

    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString(
      'fr-FR'
    );
  }
}