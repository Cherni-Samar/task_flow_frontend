import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { UserService } from '../user.service';
import { Role } from '../../../shared/models/role.model';
import { JobTitle } from '../../../shared/models/job-title.enum';


@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
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
        private route: ActivatedRoute
    ) { }



    ngOnInit(): void {


        this.loadRoles();


        this.id =
            Number(this.route.snapshot.paramMap.get('id'));


        if (this.id) {

            this.loadUser();

        }


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
            .subscribe(user => {


                this.fullName = user.fullName;

                this.email = user.email;

                this.jobTitle = user.jobTitle;


                this.selectedRoles =
                    user.roles.map(r => r.id);


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


        const data = {

            fullName: this.fullName,

            email: this.email,

            password: this.password,

            jobTitle: this.jobTitle,

            roleIds: this.selectedRoles


        };



        this.loading = true;



        if (this.id) {


            this.userService.update(
                this.id,
                data
            )
                .subscribe(() => {

                    this.router.navigate(['/users']);

                });



        }
        else {


            this.userService.create(data)
                .subscribe(() => {

                    this.router.navigate(['/users']);

                });


        }


    }



}