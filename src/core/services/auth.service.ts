import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { LoginRequest } from '../../shared/models/login-request.model';
import { AuthResponse } from '../../shared/models/auth-response.model';
import { environment } from '../../environment/environment';


@Injectable({
  providedIn:'root'
})
export class AuthService{

  private api =
  environment.apiUrl + '/auth';

  constructor(
      private http:HttpClient
  ){}


  login(request:LoginRequest):Observable<AuthResponse>{

      return this.http.post<AuthResponse>(
          `${this.api}/login`,
          request
      );

  }

}