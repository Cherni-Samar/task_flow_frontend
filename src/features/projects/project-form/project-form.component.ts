import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { ProjectService } from '../project.service';
import { UserService } from '../../users/user.service';

import {
  CreateProjectRequest,
  ProjectStatus
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

  projectForm!: FormGroup;

  users: User[] = [];

  loading = false;
  loadingUsers = false;
  errorMessage = '';

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

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadUsers();
  }

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

      managerId: [
        null,
        Validators.required
      ],

      memberIds: [
        [],
        Validators.required
      ]
    });
  }

  loadUsers(): void {
    this.loadingUsers = true;

    this.userService.getAll().subscribe({
      next: (data: User[]) => {
        this.users = data;
        this.loadingUsers = false;
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

  get collaborators(): User[] {
    return this.users.filter(user =>
      user.roles?.some(role =>
        role.name === 'COLLABORATOR'
      )
    );
  }

  get managers(): User[] {
    return this.users.filter(user =>
      user.roles?.some(role =>
        role.name === 'MANAGER'
      )
    );
  }

  submit(): void {

    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.projectForm.value;

    const request: CreateProjectRequest = {
      name: formValue.name,
      description: formValue.description,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      status: formValue.status,
      managerId: Number(formValue.managerId),
      memberIds: formValue.memberIds.map(
        (id: number) => Number(id)
      )
    };

    this.projectService.createProject(request).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/projects']);
      },

      error: (error) => {
        console.error(
          'Erreur lors de la création du projet',
          error
        );

        this.errorMessage =
          error.error?.message ||
          'Impossible de créer le projet.';

        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/projects']);
  }
}