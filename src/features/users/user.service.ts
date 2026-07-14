import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { CreateUser } from '../../shared/models/create-user.model';
import { User } from '../../shared/models/user.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.api);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.api}/${id}`);
  }

  create(user: CreateUser): Observable<User> {
    return this.http.post<User>(this.api, user);
  }

  update(id: number, user: CreateUser): Observable<User> {
    return this.http.put<User>(`${this.api}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

}