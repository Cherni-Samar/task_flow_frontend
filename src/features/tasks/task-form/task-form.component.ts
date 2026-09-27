import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import {
  TaskPriority,
  TaskStatus,
  CreateTaskRequest
} from '../../../shared/models/task.model';

import { TaskService } from '../task.service';

import { ProjectService } from '../../projects/project.service';
import { Project } from '../../../shared/models/project.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent implements OnInit {

  projectId: number | null = null;

  project: Project | null = null;

  loadingProject = true;
  submitting = false;

  errorMessage = '';
  successMessage = '';

  TaskPriority = TaskPriority;
  TaskStatus = TaskStatus;

  task: CreateTaskRequest = {
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    dueDate: '',
    projectId: 0,
    assignedToId: null
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private projectService: ProjectService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.errorMessage = 'Projet introuvable.';
      this.loadingProject = false;
      return;
    }

    const id = Number(idParam);

    if (isNaN(id)) {
      this.errorMessage = 'Identifiant du projet invalide.';
      this.loadingProject = false;
      return;
    }

    this.projectId = id;

    // Le projectId est automatiquement associé à la tâche
    this.task.projectId = id;

    this.loadProject(id);
  }

  loadProject(id: number): void {

    this.loadingProject = true;

    this.projectService.getProjectById(id).subscribe({

      next: (project: Project) => {

        console.log('✅ PROJET POUR LA TÂCHE :', project);

        this.project = project;
        this.loadingProject = false;

        this.cd.detectChanges();
      },

      error: (error) => {

        console.error(
          '❌ Erreur chargement projet :',
          error
        );

        this.errorMessage =
          error.error?.message ||
          'Impossible de charger le projet.';

        this.loadingProject = false;

        this.cd.detectChanges();
      }

    });
  }

  createTask(): void {

    if (!this.projectId) {
      this.errorMessage = 'Projet introuvable.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    // Sécurité : on force toujours le projet provenant de l'URL
    this.task.projectId = this.projectId;

    if (!this.task.title.trim()) {
      this.errorMessage = 'Le titre de la tâche est obligatoire.';
      return;
    }

    if (!this.task.dueDate) {
      this.errorMessage = 'La date d’échéance est obligatoire.';
      return;
    }

    this.submitting = true;

    console.log('📤 CRÉATION TÂCHE :', this.task);

    this.taskService.createTask(this.task).subscribe({

      next: (createdTask) => {

        console.log(
          '✅ TÂCHE CRÉÉE :',
          createdTask
        );

        this.submitting = false;

        this.router.navigate([
          '/projects',
          this.projectId
        ]);

      },

      error: (error) => {

        console.error(
          '❌ Erreur création tâche :',
          error
        );

        this.errorMessage =
          error.error?.message ||
          'Impossible de créer la tâche.';

        this.submitting = false;

        this.cd.detectChanges();
      }

    });
  }

  cancel(): void {

    if (this.projectId) {
      this.router.navigate([
        '/projects',
        this.projectId
      ]);
    } else {
      this.router.navigate([
        '/projects'
      ]);
    }
  }

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
}