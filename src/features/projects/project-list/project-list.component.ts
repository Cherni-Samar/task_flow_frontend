import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


interface Project {

 id:number;

 name:string;

 description:string;

 manager:string;

 status:string;

 progress:number;

 startDate:string;

 endDate:string;

}



@Component({

 selector:'app-project-list',

 standalone:true,

 imports:[
   CommonModule,
   RouterModule
 ],

 templateUrl:'./project-list.component.html',

 styleUrls:['./project-list.component.css']

})
export class ProjectListComponent {



projects:Project[]=[


{
 id:1,

 name:'Application TaskFlow',

 description:'Gestion collaborative des tâches',

 manager:'Samar Cherni',

 status:'EN_COURS',

 progress:65,

 startDate:'2026-07-01',

 endDate:'2026-09-30'

},



{
 id:2,

 name:'Application Mobile',

 description:'Application Android/iOS',

 manager:'Ali Ben Ali',

 status:'TERMINE',

 progress:100,

 startDate:'2026-01-10',

 endDate:'2026-05-20'

}


];



}