import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
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
    FormsModule,
  ],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent implements OnInit, OnChanges {


  @Input() user!: User;

  @Output() close = new EventEmitter<void>();

  availableRoles: Role[] = [];

  userRoles: Role[] = [];

  selectedRoleId!: number;

  private loadedUserId!: number;

  constructor(
    private userService: UserService, private cd: ChangeDetectorRef

  ) { }


  ngOnInit(): void {

    this.loadAvailableRoles();

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['user'] && changes['user'].currentValue) {

      this.userRoles = [];

      this.loadUserRoles();

    }

  }


  loadAvailableRoles() {

    this.userService.getRoles()
      .subscribe({

        next: (roles) => {

          this.availableRoles = roles;

              this.cd.detectChanges();

        },

        error: (err) => {

          console.error(err);

        }

      });

  }



  loadUserRoles() {

    console.log("USER SELECTIONNE :", this.user);


    this.userService
      .getUserRoles(this.user.id!)
      .subscribe({

        next: (roles) => {

          console.log("ROLES USER :", roles);

          this.userRoles = roles;

              this.cd.detectChanges();

          // charger la liste des rôles après
          //this.loadAvailableRoles();

        },

        error: (err) => {

          console.error(err);

        }

      });

  }

  assignRole() {

    if (!this.selectedRoleId)
      return;


    this.userService
      .assignRole(
        this.user.id!,
        this.selectedRoleId
      )
      .subscribe(() => {

        this.selectedRoleId = 0;

        this.loadUserRoles();

      });

  }



  removeRole(roleId: number) {

    this.userService
      .removeRole(
        this.user.id!,
        roleId
      )
      .subscribe(() => {

        this.loadUserRoles();

      });

  }
  closePanel() {

    this.close.emit();

  }

}