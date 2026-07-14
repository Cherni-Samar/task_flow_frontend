import { Component } from '@angular/core';

import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';


@Component({

 selector:'app-layout',

 standalone:true,

 imports:[
   NavbarComponent,
   SidebarComponent,
   RouterOutlet
 ],

 templateUrl:'./layout.component.html',

 styleUrls:['./layout.component.css']

})
export class LayoutComponent {


}