import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ProjectService } from '../project.service';
import { Project } from '../../../shared/models/project.model';
import { Task, TaskStatus, TaskPriority } from '../../../shared/models/task.model';
import { TaskService } from '../../tasks/task.service';
import { UserService } from '../../users/user.service';
import { User } from '../../../shared/models/user.model';

@Component({
    selector: 'app-project-details',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ],
    templateUrl: './project-details.component.html',
    styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {

    project: Project | null = null;

    loading = true;
    errorMessage = '';

    tasks: Task[] = [];
    tasksLoading = false;
    tasksError = '';

    TaskStatus = TaskStatus;
    TaskPriority = TaskPriority;

    currentUser!: User;

    isAdmin = false;
    isManager = false;

    canCreateTask = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private projectService: ProjectService,
        private taskService: TaskService,
        private userService: UserService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadCurrentUser();
        this.loadProject();
    }

    /**
     * Charger l'utilisateur courant et ses rôles
     */
    loadCurrentUser(): void {

        this.userService.getCurrentUser().subscribe({

            next: (user: User) => {

                console.log(
                    '👤 Utilisateur connecté :',
                    user
                );

                this.currentUser = user;

                this.isAdmin =
                    user.roles?.some(
                        role => role.name === 'ADMIN'
                    ) ?? false;

                this.isManager =
                    user.roles?.some(
                        role => role.name === 'MANAGER'
                    ) ?? false;

                this.checkCanCreateTask();

                this.cd.detectChanges();
            },

            error: (error) => {

                console.error(
                    '❌ Erreur récupération utilisateur connecté :',
                    error
                );

            }

        });
    }

    checkCanCreateTask(): void {

        if (!this.project || !this.currentUser) {
            this.canCreateTask = false;
            return;
        }

        // ADMIN → peut créer dans tous les projets
        if (this.isAdmin) {
            this.canCreateTask = true;
            return;
        }

        // MANAGER → seulement dans ses propres projets
        if (this.isManager) {

            this.canCreateTask =
                this.project.manager?.id === this.currentUser.id;

            return;
        }

        // COLLABORATOR → impossible
        this.canCreateTask = false;
    }
    /**
     * Charger le projet à partir de son ID
     */
    loadProject(): void {

        const idParam = this.route.snapshot.paramMap.get('id');

        if (!idParam) {
            this.errorMessage = 'Projet introuvable.';
            this.loading = false;
            return;
        }

        const id = Number(idParam);

        if (isNaN(id)) {
            this.errorMessage = 'Identifiant du projet invalide.';
            this.loading = false;
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        this.projectService.getProjectById(id).subscribe({

            next: (data: Project) => {
                console.log('✅ PROJET CHARGÉ :', data);

                this.project = {
                    ...data,
                    progress: this.calculateProgress(
                        data.startDate,
                        data.endDate,
                        data.status
                    )
                };
                this.checkCanCreateTask();
                this.loadTasks(data.id!);

                this.loading = false;

                console.log('📦 project =', this.project);
                console.log('🏁 loading =', this.loading);

                this.cd.detectChanges();
            },

            error: (error) => {

                console.error(
                    '❌ Erreur lors du chargement du projet :',
                    error
                );

                this.errorMessage =
                    error.error?.message ||
                    'Impossible de charger le projet.';

                this.loading = false;
            }

        });
    }

    loadTasks(projectId: number): void {

        this.tasksLoading = true;
        this.tasksError = '';

        this.taskService
            .getTasksByProject(projectId)
            .subscribe({

                next: (data) => {

                    console.log(
                        '✅ TÂCHES DU PROJET :',
                        data
                    );

                    this.tasks = data;
                    this.tasksLoading = false;

                    this.cd.detectChanges();
                },

                error: (error) => {

                    console.error(
                        '❌ Erreur chargement tâches :',
                        error
                    );

                    this.tasksError =
                        'Impossible de charger les tâches du projet.';

                    this.tasksLoading = false;

                    this.cd.detectChanges();
                }
            });
    }

    addTask(): void {

        if (!this.project?.id) {
            return;
        }

        this.router.navigate([
            '/projects',
            this.project.id,
            'tasks',
            'create'
        ]);
    }

    getTaskStatusLabel(status: TaskStatus): string {

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

    getTaskStatusClass(status: TaskStatus): string {

        switch (status) {

            case TaskStatus.TODO:
                return 'todo';

            case TaskStatus.IN_PROGRESS:
                return 'in-progress';

            case TaskStatus.COMPLETED:
                return 'completed';

            case TaskStatus.OVERDUE:
                return 'overdue';

            default:
                return '';
        }
    }
    getTaskPriorityLabel(priority: TaskPriority): string {

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
    /**
     * Calcul de la progression selon les dates
     */
    calculateProgress(
        startDate: string,
        endDate: string,
        status: string
    ): number {

        if (status === 'COMPLETED') {
            return 100;
        }

        if (status === 'CANCELLED') {
            return 0;
        }

        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const today = new Date().getTime();

        if (today <= start) {
            return 0;
        }

        if (today >= end) {
            return 100;
        }

        const totalDuration = end - start;
        const elapsedDuration = today - start;

        if (totalDuration <= 0) {
            return 0;
        }

        const progress =
            (elapsedDuration / totalDuration) * 100;

        return Math.round(
            Math.min(100, Math.max(0, progress))
        );
    }

    /**
     * Conversion du statut backend
     */
    getStatusLabel(status: string): string {

        switch (status) {

            case 'PLANNED':
                return 'Planifié';

            case 'IN_PROGRESS':
                return 'En cours';

            case 'COMPLETED':
                return 'Terminé';

            case 'CANCELLED':
                return 'Annulé';

            default:
                return status;
        }
    }

    /**
     * Classe CSS du statut
     */
    getStatusClass(status: string): string {

        switch (status) {

            case 'PLANNED':
                return 'planned';

            case 'IN_PROGRESS':
                return 'progress';

            case 'COMPLETED':
                return 'done';

            case 'CANCELLED':
                return 'cancelled';

            default:
                return '';
        }
    }

    /**
     * Modifier le projet
     */
    editProject(): void {

        if (!this.project?.id) {
            return;
        }

        this.router.navigate([
            '/projects/edit',
            this.project.id
        ]);
    }

    /**
     * Supprimer le projet
     */
    deleteProject(): void {

        if (!this.project?.id) {
            return;
        }

        const confirmed = confirm(
            'Voulez-vous vraiment supprimer ce projet ?'
        );

        if (!confirmed) {
            return;
        }

        this.projectService
            .deleteProject(this.project.id)
            .subscribe({

                next: () => {

                    console.log(
                        '✅ Projet supprimé'
                    );

                    this.router.navigate([
                        '/projects'
                    ]);
                },

                error: (error) => {

                    console.error(
                        '❌ Erreur suppression :',
                        error
                    );

                    alert(
                        error.error?.message ||
                        'Impossible de supprimer le projet.'
                    );
                }

            });
    }

    /**
     * Retour à la liste
     */
    goBack(): void {
        this.router.navigate([
            '/projects'
        ]);
    }
}