import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { User } from '../../../shared/models/user.model';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { RoleManagementComponent } from '../role-management/role-management.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RoleManagementComponent

  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  users: User[] = [];

  loading = false;

  errorMessage = '';

  selectedUser!: User;

  showRoleManagement = false;


  constructor(
    private userService: UserService, private cd: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    console.log("INIT USER COMPONENT");

    this.loadUsers();
  }


  loadUsers(): void {

    console.log("LOAD START");

    this.loading = true;

    console.log("BEFORE HTTP loading =", this.loading);


    this.userService.getAll().subscribe({

      next: (data) => {

        console.log("HTTP SUCCESS");

        this.users = data;

        this.loading = false;

        this.cd.detectChanges();

        console.log("AFTER HTTP loading =", this.loading);
        console.log("AFTER HTTP users =", this.users.length);

      },


      error: (err) => {

        console.log("HTTP ERROR", err);

        this.loading = false;

      }

    });

  }

  deleteUser(user: User): void {

    if (!user.id) {
      return;
    }

    if (!confirm(`Voulez-vous supprimer ${user.fullName} ?`)) {
      return;
    }

    this.userService.delete(user.id)
      .subscribe({

        next: () => {

          this.loadUsers();

        },

        error: (err) => {

          console.error(err);

          alert("Erreur lors de la suppression.");

        }

      });

  }
  openRoleManagement(user: User) {

    this.selectedUser = user;

    this.showRoleManagement = true;

  }

  closeRoleManagement() {

    this.showRoleManagement = false;

  }

}