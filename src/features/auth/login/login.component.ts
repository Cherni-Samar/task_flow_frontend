import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})


export class LoginComponent{

email='';

password='';

loading=false;

error='';

constructor(

private authService:AuthService,

private router:Router

){}

login(){

this.loading=true;

this.error='';

this.authService.login({

email:this.email,

password:this.password

})

.subscribe({

next:(response)=>{

localStorage.setItem(

'token',

response.token

);

this.router.navigate(['/dashboard']);

},

error:()=>{

this.loading=false;

this.error='Email ou mot de passe incorrect';

},

complete:()=>{

this.loading=false;

}

});

}

}