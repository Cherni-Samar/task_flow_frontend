import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { ProjectService } from '../project.service';
import { UserService } from '../../users/user.service';

import {
    CreateProjectRequest,
    Project,
    ProjectStatus
} from '../../../shared/models/project.model';

import { User } from '../../../shared/models/user.model';

@Component({
    selector: 'app-project-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule
    ],
    templateUrl: './project-form.component.html',
    styleUrls: ['./project-form.component.css']
})
export class ProjectFormComponent implements OnInit {

    // =========================
    // FORMULAIRE
    // =========================

    projectForm!: FormGroup;

    // =========================
    // MODE
    // =========================

    isEditMode = false;
    projectId: number | null = null;

    // =========================
    // UTILISATEUR CONNECTÉ
    // =========================

    currentUser!: User;

    isAdmin = false;
    isManager = false;

    // =========================
    // UTILISATEURS
    // =========================

    users: User[] = [];

    loadingUsers = false;

    // =========================
    // COLLABORATEURS
    // =========================

    /**
     * Contient uniquement les IDs des collaborateurs sélectionnés.
     *
     * Exemple :
     * [4, 7, 12]
     */
    selectedCollaboratorIds: number[] = [];

    /**
     * Texte de recherche
     */
    collaboratorSearch = '';

    // =========================
    // ÉTATS
    // =========================

    loading = false;
    errorMessage = '';

    // =========================
    // STATUTS
    // =========================

    statuses = [
        {
            value: ProjectStatus.PLANNED,
            label: 'Planifié'
        },
        {
            value: ProjectStatus.IN_PROGRESS,
            label: 'En cours'
        },
        {
            value: ProjectStatus.COMPLETED,
            label: 'Terminé'
        },
        {
            value: ProjectStatus.CANCELLED,
            label: 'Annulé'
        }
    ];

    // =========================
    // CONSTRUCTOR
    // =========================

    constructor(
        private fb: FormBuilder,
        private projectService: ProjectService,
        private userService: UserService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    // =========================
    // INIT
    // =========================

    ngOnInit(): void {

        this.initForm();

        this.loadCurrentUser();

        this.loadUsers();

        this.checkEditMode();
    }

    // =========================
    // INITIALISATION FORMULAIRE
    // =========================

    initForm(): void {

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
                [
                    Validators.required
                ]
            ],

            endDate: [
                '',
                [
                    Validators.required
                ]
            ],

            status: [
                ProjectStatus.PLANNED,
                [
                    Validators.required
                ]
            ],

            managerId: [
                null
            ],

            memberIds: [
                [],
                [
                    Validators.required
                ]
            ]

        });
    }

    // =========================
    // UTILISATEUR CONNECTÉ
    // =========================

    loadCurrentUser(): void {

        this.userService.getCurrentUser().subscribe({

            next: (user: User) => {

                console.log('👤 Utilisateur connecté :', user);

                this.currentUser = user;

                this.isAdmin =
                    user.roles?.some(
                        role => role.name === 'ADMIN'
                    ) ?? false;

                this.isManager =
                    user.roles?.some(
                        role => role.name === 'MANAGER'
                    ) ?? false;

                /**
                 * Si c'est un MANAGER et pas ADMIN,
                 * il devient automatiquement le manager
                 * du projet.
                 */
                if (this.isManager && !this.isAdmin) {

                    this.projectForm.patchValue({
                        managerId: user.id
                    });

                }

            },

            error: (error) => {

                console.error(
                    '❌ Erreur récupération utilisateur connecté :',
                    error
                );

            }

        });
    }

    // =========================
    // CHARGER LES UTILISATEURS
    // =========================

    loadUsers(): void {

        this.loadingUsers = true;

        this.userService.getAll().subscribe({

            next: (users: User[]) => {

                console.log('👥 Utilisateurs chargés :', users);

                this.users = users;

                this.loadingUsers = false;

            },

            error: (error) => {

                console.error(
                    '❌ Erreur chargement utilisateurs :',
                    error
                );

                this.loadingUsers = false;

                this.errorMessage =
                    'Impossible de charger les utilisateurs.';

            }

        });
    }

    // =========================
    // VÉRIFIER MODE ÉDITION
    // =========================

    checkEditMode(): void {

        const id = this.route.snapshot.paramMap.get('id');

        if (id) {

            this.isEditMode = true;

            this.projectId = Number(id);

            this.loadProject(this.projectId);

        }

    }

    // =========================
    // CHARGER PROJET
    // =========================

    loadProject(id: number): void {

        this.loading = true;

        this.projectService.getProjectById(id).subscribe({

            next: (project: Project) => {

                console.log(
                    '📂 Projet chargé pour modification :',
                    project
                );

                /**
                 * Récupérer les IDs des collaborateurs
                 */
                this.selectedCollaboratorIds =
                    project.members?.map(
                        member => Number(member.id)
                    ) ?? [];

                /**
                 * Remplir le formulaire
                 */
                this.projectForm.patchValue({

                    name: project.name,

                    description: project.description,

                    startDate: project.startDate,

                    endDate: project.endDate,

                    status: project.status,

                    managerId:
                        project.manager?.id ?? null,

                    memberIds:
                        [...this.selectedCollaboratorIds]

                });

                /**
                 * Si MANAGER connecté et pas ADMIN,
                 * on garde le manager actuel du projet.
                 */
                if (this.isManager && !this.isAdmin) {

                    this.projectForm.patchValue({
                        managerId: project.manager?.id ?? this.currentUser?.id
                    });

                }

                this.loading = false;

            },

            error: (error) => {

                console.error(
                    '❌ Erreur chargement projet :',
                    error
                );

                this.errorMessage =
                    'Impossible de charger le projet.';

                this.loading = false;

            }

        });
    }

    // =========================
    // GETTERS
    // =========================

    /**
     * Retourne uniquement les utilisateurs
     * ayant le rôle COLLABORATOR.
     */
    get collaborators(): User[] {

        return this.users.filter(user =>
            user.roles?.some(
                role => role.name === 'COLLABORATOR'
            )
        );

    }

    /**
     * Retourne uniquement les utilisateurs
     * ayant le rôle MANAGER.
     */
    get managers(): User[] {

        return this.users.filter(user =>
            user.roles?.some(
                role => role.name === 'MANAGER'
            )
        );

    }

    /**
     * Retourne les collaborateurs filtrés
     * par la recherche.
     */
    get filteredCollaborators(): User[] {

        const search =
            this.collaboratorSearch
                .trim()
                .toLowerCase();

        // Ne rien afficher si aucune recherche
        if (!search) {
            return [];
        }

        // Afficher uniquement les résultats de la recherche
        return this.collaborators.filter(
            collaborator =>
                collaborator.fullName
                    .toLowerCase()
                    .includes(search)
                ||
                collaborator.email
                    .toLowerCase()
                    .includes(search)
        );
    }

    /**
     * Retourne les objets User correspondant
     * aux IDs sélectionnés.
     */
    get selectedCollaborators(): User[] {

        return this.collaborators.filter(
            collaborator =>
                this.selectedCollaboratorIds.includes(
                    Number(collaborator.id)
                )
        );

    }

    // =========================
    // VÉRIFIER SÉLECTION
    // =========================

    isCollaboratorSelected(
        id: number | undefined
    ): boolean {

        if (!id) {
            return false;
        }

        return this.selectedCollaboratorIds.includes(
            Number(id)
        );

    }

    // =========================
    // SÉLECTION COLLABORATEUR
    // =========================

    toggleCollaborator(
        id: number | undefined
    ): void {

        if (!id) {
            return;
        }

        const collaboratorId = Number(id);

        const index =
            this.selectedCollaboratorIds.indexOf(
                collaboratorId
            );

        /**
         * Déjà sélectionné
         * → retirer
         */
        if (index !== -1) {

            this.selectedCollaboratorIds.splice(
                index,
                1
            );

        }

        /**
         * Pas encore sélectionné
         * → ajouter
         */
        else {

            this.selectedCollaboratorIds.push(
                collaboratorId
            );

        }

        /**
         * Synchroniser avec le formulaire
         */
        this.projectForm.patchValue({

            memberIds: [
                ...this.selectedCollaboratorIds
            ]

        });

        /**
         * Marquer comme touché
         */
        this.projectForm
            .get('memberIds')
            ?.markAsTouched();

        console.log(
            '👥 Collaborateurs sélectionnés :',
            this.selectedCollaboratorIds
        );

    }

    // =========================
    // SUPPRIMER COLLABORATEUR
    // =========================

    removeCollaborator(
        id: number | undefined
    ): void {

        this.toggleCollaborator(id);

    }

    // =========================
    // RECHERCHE
    // =========================

    clearCollaboratorSearch(): void {

        this.collaboratorSearch = '';

    }

    // =========================
    // SUBMIT
    // =========================

    submit(): void {

        /**
         * Vérifier le formulaire
         */
        if (this.projectForm.invalid) {

            this.projectForm.markAllAsTouched();

            this.errorMessage =
                'Veuillez remplir correctement tous les champs obligatoires.';

            return;

        }

        this.errorMessage = '';

        this.loading = true;

        const formValue =
            this.projectForm.value;

        // =========================
        // MANAGER
        // =========================

        let managerId =
            formValue.managerId
                ? Number(formValue.managerId)
                : undefined;

        /**
         * Si MANAGER connecté et pas ADMIN,
         * le manager est automatiquement
         * l'utilisateur connecté.
         */
        if (this.isManager && !this.isAdmin) {

            managerId =
                Number(this.currentUser.id);

        }

        // =========================
        // COLLABORATEURS
        // =========================

        const memberIds: number[] =
            this.selectedCollaboratorIds.map(
                id => Number(id)
            );

        // =========================
        // REQUEST
        // =========================

        const request: CreateProjectRequest = {

            name:
                formValue.name,

            description:
                formValue.description,

            startDate:
                formValue.startDate,

            endDate:
                formValue.endDate,

            status:
                formValue.status,

            managerId:
                managerId,

            memberIds:
                memberIds

        };

        console.log(
            '📤 Données envoyées au backend :',
            request
        );

        // =========================
        // UPDATE
        // =========================

        if (
            this.isEditMode &&
            this.projectId
        ) {

            this.projectService
                .updateProject(
                    this.projectId,
                    request
                )
                .subscribe({

                    next: (project) => {

                        console.log(
                            '✅ Projet modifié :',
                            project
                        );

                        this.loading = false;

                        this.router.navigate(
                            ['/projects']
                        );

                    },

                    error: (error) => {

                        console.error(
                            '❌ Erreur modification projet :',
                            error
                        );

                        this.loading = false;

                        this.errorMessage =
                            error?.error?.message ||
                            'Impossible de modifier le projet.';

                    }

                });

        }

        // =========================
        // CREATE
        // =========================

        else {

            this.projectService
                .createProject(request)
                .subscribe({

                    next: (project) => {

                        console.log(
                            '✅ Projet créé :',
                            project
                        );

                        this.loading = false;

                        this.router.navigate(
                            ['/projects']
                        );

                    },

                    error: (error) => {

                        console.error(
                            '❌ Erreur création projet :',
                            error
                        );

                        this.loading = false;

                        this.errorMessage =
                            error?.error?.message ||
                            'Impossible de créer le projet.';

                    }

                });

        }

    }

    // =========================
    // ANNULER
    // =========================

    cancel(): void {

        this.router.navigate(
            ['/projects']
        );

    }

}