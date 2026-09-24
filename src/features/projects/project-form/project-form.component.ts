import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { ProjectService } from '../project.service';
import { UserService } from '../../users/user.service';

import {
    CreateProjectRequest
} from '../../../shared/models/project.model';

import { User } from '../../../shared/models/user.model';

@Component({
    selector: 'app-project-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './project-form.component.html',
    styleUrls: ['./project-form.component.css']
})
export class ProjectFormComponent implements OnInit {

    // =========================================================
    // FORMULAIRE
    // =========================================================

    projectForm!: FormGroup;

    isEditMode = false;
    projectId: number | null = null;


    // =========================================================
    // RÔLE DE L'UTILISATEUR CONNECTÉ
    // =========================================================

    isAdmin = false;
    isManager = false;


    // =========================================================
    // UTILISATEUR CONNECTÉ
    // =========================================================

    currentUser!: User;


    // =========================================================
    // UTILISATEURS
    // =========================================================

    users: User[] = [];


    // =========================================================
    // ÉTAT
    // =========================================================

    loading = false;
    loadingUsers = false;

    errorMessage = '';


    // =========================================================
    // STATUTS
    // =========================================================

    statuses = [
        {
            value: 'PLANNED',
            label: 'Planifié'
        },
        {
            value: 'IN_PROGRESS',
            label: 'En cours'
        },
        {
            value: 'COMPLETED',
            label: 'Terminé'
        },
        {
            value: 'CANCELLED',
            label: 'Annulé'
        }
    ];


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    constructor(
        private fb: FormBuilder,
        private projectService: ProjectService,
        private userService: UserService,
        private router: Router,
        private cd: ChangeDetectorRef,
        private route: ActivatedRoute
    ) { }


    // =========================================================
    // INIT
    // =========================================================

    ngOnInit(): void {

        console.log('INIT PROJECT FORM');

        this.initializeForm();

        // Récupérer l'utilisateur connecté
        this.loadCurrentUser();

        // Récupérer tous les utilisateurs
        this.loadUsers();

        const idParam = this.route.snapshot.paramMap.get('id');

        if (idParam) {
            this.isEditMode = true;
            this.projectId = Number(idParam);

            this.loadProjectForEdit(this.projectId);
        }
    }


    // =========================================================
    // UTILISATEUR CONNECTÉ
    // =========================================================

    loadCurrentUser(): void {

        this.userService.getCurrentUser().subscribe({

            next: (user) => {

                this.currentUser = user;


                // =================================================
                // VÉRIFIER ADMIN
                // =================================================

                this.isAdmin = user.roles?.some(
                    role => role.name === 'ADMIN'
                ) ?? false;


                // =================================================
                // VÉRIFIER MANAGER
                // =================================================

                this.isManager = user.roles?.some(
                    role => role.name === 'MANAGER'
                ) ?? false;


                console.log(
                    'CURRENT USER:',
                    user
                );

                console.log(
                    'CURRENT USER ROLES:',
                    user.roles
                );

                console.log(
                    'IS ADMIN:',
                    this.isAdmin
                );

                console.log(
                    'IS MANAGER:',
                    this.isManager
                );


                // =================================================
                // SI MANAGER
                // =================================================

                if (this.isManager) {

                    /*
                     * Le Manager ne sélectionne pas de manager.
                     *
                     * Le backend utilisera automatiquement
                     * l'utilisateur connecté comme manager.
                     */

                    this.projectForm.patchValue({
                        managerId: null
                    });
                }


                this.cd.detectChanges();
            },


            error: (err) => {

                console.error(
                    'Erreur récupération utilisateur connecté',
                    err
                );

                this.isAdmin = false;
                this.isManager = false;

                this.errorMessage =
                    'Impossible de récupérer l\'utilisateur connecté.';
                this.cd.detectChanges();

            }
        });
    }


    // =========================================================
    // FORMULAIRE
    // =========================================================

    initializeForm(): void {

        this.projectForm = this.fb.group({

            name: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3)
                ]
            ],


            description: [
                '',
                [
                    Validators.required
                ]
            ],


            startDate: [
                '',
                Validators.required
            ],


            endDate: [
                '',
                Validators.required
            ],


            status: [
                'PLANNED',
                Validators.required
            ],


            /*
             * IMPORTANT :
             *
             * Pas de Validators.required ici.
             *
             * ADMIN :
             * → sélectionne un Manager
             *
             * MANAGER :
             * → devient automatiquement le Manager
             */

            managerId: [
                null
            ],


            memberIds: [
                [],
                Validators.required
            ]
        });
    }


    // =========================================================
    // CHARGER LES UTILISATEURS
    // =========================================================

    loadUsers(): void {

        this.loadingUsers = true;

        this.userService.getAll().subscribe({

            next: (data: User[]) => {

                this.users = data;

                this.loadingUsers = false;

                console.log(
                    'USERS:',
                    this.users
                );
            },


            error: (error) => {

                console.error(
                    'Erreur lors du chargement des utilisateurs',
                    error
                );

                this.errorMessage =
                    'Impossible de charger les utilisateurs.';

                this.loadingUsers = false;
            }
        });
    }


    // =========================================================
    // COLLABORATEURS
    // =========================================================

    get collaborators(): User[] {

        return this.users.filter(user =>
            user.roles?.some(
                role => role.name === 'COLLABORATOR'
            )
        );
    }


    // =========================================================
    // MANAGERS
    // =========================================================

    get managers(): User[] {

        return this.users.filter(user =>
            user.roles?.some(
                role => role.name === 'MANAGER'
            )
        );
    }


    // =========================================================
    // SUBMIT
    // =========================================================

    submit(): void {

        if (this.projectForm.invalid) {
            this.projectForm.markAllAsTouched();
            return;
        }

        const formValue = this.projectForm.value;

        const projectData: CreateProjectRequest = {
            name: formValue.name,
            description: formValue.description,
            startDate: formValue.startDate,
            endDate: formValue.endDate,
            status: formValue.status,
            managerId: formValue.managerId,
            memberIds: formValue.memberIds ?? []
        };

        console.log('📤 DONNÉES ENVOYÉES :', projectData);

        if (this.isEditMode && this.projectId) {

            // UPDATE
            this.projectService
                .updateProject(this.projectId, projectData)
                .subscribe({

                    next: (updatedProject) => {

                        console.log(
                            '✅ PROJET MODIFIÉ :',
                            updatedProject
                        );

                        alert('Projet modifié avec succès.');

                        this.router.navigate([
                            '/projects',
                            this.projectId
                        ]);
                    },

                    error: (error) => {

                        console.error(
                            '❌ Erreur modification :',
                            error
                        );

                        alert(
                            error.error?.message ||
                            'Impossible de modifier le projet.'
                        );
                    }
                });

        } else {

            // CREATE
            this.projectService
                .createProject(projectData)
                .subscribe({

                    next: (project) => {

                        console.log(
                            '✅ PROJET CRÉÉ :',
                            project
                        );

                        alert('Projet créé avec succès.');

                        this.router.navigate(['/projects']);
                    },

                    error: (error) => {

                        console.error(
                            '❌ Erreur création :',
                            error
                        );

                        alert(
                            error.error?.message ||
                            'Impossible de créer le projet.'
                        );
                    }
                });
        }
    }


    // =========================================================
    // ANNULER
    // =========================================================

    cancel(): void {

        this.router.navigate(
            ['/projects']
        );
    }

    loadProjectForEdit(id: number): void {

        this.projectService.getProjectById(id).subscribe({
            next: (project) => {

                console.log('✅ PROJET À MODIFIER :', project);

                this.projectForm.patchValue({
                    name: project.name,
                    description: project.description,
                    startDate: project.startDate,
                    endDate: project.endDate,
                    status: project.status,
                    managerId: project.manager?.id ?? null,
                    memberIds: project.members?.map(member => member.id) ?? []
                });

                this.cd.detectChanges();
            },

            error: (error) => {
                console.error(
                    '❌ Erreur chargement projet :',
                    error
                );

                alert('Impossible de charger le projet.');
                this.router.navigate(['/projects']);
            }
        });
    }
}