import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { CreateUser } from '../../shared/models/create-user.model';
import { User } from '../../shared/models/user.model';
import { Permission } from '../../shared/models/permission.model';
import { Role } from '../../shared/models/role.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

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


  // récupérer tous les rôles disponibles

  getRoles() {

    return this.http.get<Role[]>(
      `${this.api}/roles`
    );

  }


  // récupérer les rôles d'un utilisateur

  getUserRoles(userId: number) {

    return this.http.get<Role[]>(
      `${this.api}/${userId}/roles`
    );

  }


  // affecter un rôle

  assignRole(
    userId: number,
    roleId: number
  ) {

    return this.http.post(
      `${this.api}/${userId}/roles/${roleId}`,
      {}
    );

  }


  // retirer un rôle

  removeRole(
    userId: number,
    roleId: number
  ) {

    return this.http.delete(
      `${this.api}/${userId}/roles/${roleId}`
    );

  }


  // ================= PERMISSIONS =================


  // toutes les permissions

  getPermissions() {

    return this.http.get<Permission[]>(
      `${this.api}/permissions`
    );

  }

  // permissions d'un rôle

  getRolePermissions(
    roleId: number
  ) {

    return this.http.get<Permission[]>(
      `${this.api}/roles/${roleId}/permissions`
    );

  }

}