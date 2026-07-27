import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../../models/user.model';
import { UserService } from '../../../features/users/user.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {



  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef

  ) { }

  currentUser: User | null = null;
  loadingUser: boolean = true;

  ngOnInit(): void {


    this.loadCurrentUser();


  }

  loadCurrentUser() {


    this.userService.getCurrentUser()
      .subscribe({

        next: (user) => {


          this.currentUser = user;

          this.loadingUser = false;
          
          this.cd.detectChanges();



        },


        error: (err) => {

          console.error(err);

          this.loadingUser = false;

        }

      });


  }

  logout() {

    localStorage.removeItem('token');
    localStorage.removeItem("currentUser");
    window.location.href = '/login';

  }


}