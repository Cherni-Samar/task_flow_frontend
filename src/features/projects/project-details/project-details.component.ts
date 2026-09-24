import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ProjectService } from '../project.service';
import { Project } from '../../../shared/models/project.model';

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

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private projectService: ProjectService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadProject();
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