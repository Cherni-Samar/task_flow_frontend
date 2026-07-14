import { Routes } from '@angular/router';
import { UserListComponent } from '../features/users/user-list/user-list.component';
import { LayoutComponent } from '../layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,

    children: [

      {
        path: 'users',
        loadComponent: () =>
          import('../features/users/user-list/user-list.component')
            .then(m => m.UserListComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('../features/projects/project-list/project-list.component')
            .then(c => c.ProjectListComponent)
      }

    ]

  }
];
