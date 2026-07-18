import { Routes } from '@angular/router';
import { UserListComponent } from '../features/users/user-list/user-list.component';
import { LayoutComponent } from '../layout/layout.component';
import { LoginComponent } from '../features/auth/login/login.component';
import { authGuard, loginGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('../features/auth/login/login.component')
        .then(c => c.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [

      {
        path: 'users',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../features/users/user-list/user-list.component')
            .then(m => m.UserListComponent)
      },
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../features/projects/project-list/project-list.component')
            .then(c => c.ProjectListComponent)
      }

    ]

  }
];
