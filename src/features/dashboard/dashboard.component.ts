import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {


  // données temporaires (mock)
  stats = {

    projects: 8,

    tasks: 45,

    completed: 28,

    delayed: 7

  };



  taskStatus = [

    {
      label:'À faire',
      value:10
    },

    {
      label:'En cours',
      value:12
    },

    {
      label:'Terminées',
      value:28
    },

    {
      label:'En retard',
      value:7
    }

  ];




  collaborators = [

    {
      name:'Ali Ben Ali',
      tasks:12
    },

    {
      name:'Samar Cherni',
      tasks:15
    },

    {
      name:'Ahmed Trabelsi',
      tasks:8
    },

    {
      name:'Fatma Salah',
      tasks:10
    }

  ];

}