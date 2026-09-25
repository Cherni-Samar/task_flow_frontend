import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { ProjectService } from '../project.service';
import {
  Project,
  ProjectStatus
} from '../../../shared/models/project.model';
import { UserService } from '../../users/user.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  projects: any[] = [];

  currentUser!: User;
  isAdmin = false;
  isManager = false;

  loading = false;
  errorMessage = '';

  constructor(
    private projectService: ProjectService, private userService: UserService, private router: Router, private cd: ChangeDetectorRef


  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadProjects();
  }


  loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {

        this.currentUser = user;

        this.isAdmin = user.roles?.some(
          role => role.name === 'ADMIN'
        ) ?? false;

        this.isManager = user.roles?.some(
          role => role.name === 'MANAGER'
        ) ?? false;

        this.cd.detectChanges();

      },
      error: (err) => {
        console.error('Erreur récupération utilisateur connecté', err);
        this.isAdmin = false;
        this.isManager = false;
      }
    });
  }

  /**
   * Charger tous les projets depuis le backend
   */
  loadProjects(): void {
    this.loading = true;
    this.errorMessage = '';

    this.projectService.getAllProjects().subscribe({
      next: (data: Project[]) => {

        this.projects = data.map(project => ({
          ...project,

          // Garder l'objet manager avec son id
          manager: project.manager,

          // Conversion vers les statuts utilisés dans le design
          status: this.convertStatus(project.status),

          // Calcul de la progression selon les dates
          progress: this.calculateProgress(
            project.startDate,
            project.endDate,
            project.status
          )
        }));

        console.log('✅ PROJETS CHARGÉS :', this.projects);

        this.loading = false;
        this.cd.detectChanges();
      },

      error: (error) => {
        console.error(
          '❌ Erreur lors du chargement des projets :',
          error
        );

        this.errorMessage =
          'Impossible de charger les projets.';

        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }


  /**
   * Convertir les statuts du backend vers ceux du HTML
   */
  convertStatus(status: string): string {
    switch (status) {
      case 'PLANNED':
        return 'PLANIFIE';

      case 'IN_PROGRESS':
        return 'EN_COURS';

      case 'COMPLETED':
        return 'TERMINE';

      case 'CANCELLED':
        return 'ANNULE';

      default:
        return status;
    }
  }


  /**
   * Calculer une progression approximative selon les dates
   */
  calculateProgress(
    startDate: string,
    endDate: string,
    status: ProjectStatus | string
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

    const progress =
      (elapsedDuration / totalDuration) * 100;

    return Math.round(
      Math.min(100, Math.max(0, progress))
    );
  }

  /**
   * Supprimer un projet
   */
  deleteProject(id: number | undefined): void {

    if (!id) {
      return;
    }

    const confirmed = confirm(
      'Voulez-vous vraiment supprimer ce projet ?'
    );

    if (!confirmed) {
      return;
    }

    this.projectService.deleteProject(id).subscribe({
      next: () => {
        this.projects = this.projects.filter(
          project => project.id !== id
        );
      },

      error: (error) => {
        console.error(
          'Erreur lors de la suppression du projet :',
          error
        );

        alert(
          'Une erreur est survenue lors de la suppression.'
        );
      }
    });
  }

  /**
   * Modifier un projet
   */
  editProject(id: number | undefined): void {

    if (!id) {
      return;
    }

    // La navigation sera effectuée par routerLink
    console.log('Modification du projet :', id);
  }

  /**
   * Consulter les détails d'un projet
   */
  viewProject(id: number | undefined): void {

    if (!id) {
      return;
    }

    console.log('Consultation du projet :', id);
  }

  canEditProject(project: Project): boolean {

    console.log('==============================');
    console.log('Projet:', project.name);
    console.log('Manager:', project.manager);
    console.log('Manager ID:', project.manager?.id);
    console.log('Current User:', this.currentUser);
    console.log('Current User ID:', this.currentUser?.id);
    console.log('isAdmin:', this.isAdmin);
    console.log('isManager:', this.isManager);

    if (this.isAdmin) {
      return true;
    }

    if (this.isManager) {
      return Number(project.manager?.id) === Number(this.currentUser?.id);
    }

    return false;
  }
  canDeleteProject(): boolean {

    return this.isAdmin;

  }
}