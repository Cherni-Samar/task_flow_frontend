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
  openRoleManagement(user: User) {

    this.selectedUser = user;

    this.showRoleManagement = true;

  }

  closeRoleManagement() {

    this.showRoleManagement = false;

  }

}