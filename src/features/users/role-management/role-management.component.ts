import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserService } from '../user.service';
import { User } from '../../../shared/models/user.model';
import { Role } from '../../../shared/models/role.model';


@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent implements OnInit {


  @Input() user!: User;


  availableRoles: Role[] = [];

  userRoles: Role[] = [];

  selectedRoleId!: number;


  constructor(
    private userService: UserService
  ) {}


  ngOnInit(): void {

    this.loadAvailableRoles();

    this.loadUserRoles();

  }



  loadAvailableRoles(){

    this.userService.getRoles()
    .subscribe({

      next:(roles)=>{

        this.availableRoles = roles;

      }

    });

  }



  loadUserRoles(){

    this.userService
    .getUserRoles(this.user.id!)
    .subscribe({

      next:(roles)=>{

        this.userRoles = roles;

      }

    });

  }



  assignRole(){

    if(!this.selectedRoleId)
      return;


    this.userService
    .assignRole(
      this.user.id!,
      this.selectedRoleId
    )
    .subscribe(()=>{

      this.selectedRoleId = 0;

      this.loadUserRoles();

    });

  }



  removeRole(roleId:number){

    this.userService
    .removeRole(
      this.user.id!,
      roleId
    )
    .subscribe(()=>{

      this.loadUserRoles();

    });

  }

}