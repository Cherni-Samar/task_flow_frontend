import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core'; import { UserService } from '../user.service';
import { Role } from '../../../shared/models/role.model';
import { JobTitle } from '../../../shared/models/job-title.enum';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { UpdateUser } from '../../../shared/models/update-user.model';
import { CreateUser } from '../../../shared/models/create-user.model';


@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NavbarComponent,
        SidebarComponent
    ],
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {


    id?: number;


    fullName = '';

    email = '';

    password = '';

    jobTitle!: JobTitle;


    roles: Role[] = [];

    selectedRoles: number[] = [];


    jobTitles = Object.values(JobTitle);



    loading = false;

    errorMessage = '';



    constructor(
        private userService: UserService,
        private router: Router,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef

    ) { }



    ngOnInit(): void {


        this.loadRoles();


        this.route.paramMap.subscribe(params => {


            const id = params.get('id');


            if (id) {

                this.id = Number(id);

                this.loadUser();

            }


        });


    }



    isFormValid(): boolean {

        if (this.id) {

            return !!(
                this.fullName.trim() &&
                this.email.trim() &&
                this.jobTitle &&
                this.selectedRoles.length > 0
            );

        }

        return !!(
            this.fullName.trim() &&
            this.email.trim() &&
            this.password.trim() &&
            this.jobTitle &&
            this.selectedRoles.length > 0
        );

    }

    loadRoles() {

        this.userService.getRoles()
            .subscribe({

                next: (data) => {

                    this.roles = data;

                }

            });

    }






    loadUser() {

        this.userService.getById(this.id!)
            .subscribe({

                next: (user) => {


                    this.fullName = user.fullName;

                    this.email = user.email;

                    this.jobTitle = user.jobTitle;


                    this.selectedRoles = user.roles.map(
                        role => role.id
                    );

                    this.cd.detectChanges();


                    console.log("USER CHARGE :", user);

                },


                error: (err) => {

                    console.error(
                        "Erreur chargement user",
                        err
                    );

                }

            });

    }





    toggleRole(id: number) {


        if (this.selectedRoles.includes(id)) {


            this.selectedRoles =
                this.selectedRoles.filter(
                    r => r !== id
                );


        }
        else {


            this.selectedRoles.push(id);


        }


    }






    save() {


        this.loading = true;


        if (this.id) {


            const data: UpdateUser = {

                fullName: this.fullName,

                email: this.email,

                jobTitle: this.jobTitle,

                roleIds: this.selectedRoles

            };


            this.userService
                .update(this.id, data)
                .subscribe({

                    next: () => {

                        this.router.navigate(['/users']);

                    },

                    error: (err) => {

                        console.error(err);

                        this.loading = false;

                    }

                });


        }
        else {


            const data: CreateUser = {

                fullName: this.fullName,

                email: this.email,

                password: this.password,

                jobTitle: this.jobTitle,

                roleIds: this.selectedRoles

            };


            this.userService
                .create(data)
                .subscribe({

                    next: () => {

                        this.router.navigate(['/users']);

                    },

                    error: (err) => {

                        console.error(err);

                        this.loading = false;

                    }

                });

        }


    }



}