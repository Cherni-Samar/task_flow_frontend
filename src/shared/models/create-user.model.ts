import { Role } from './role.model';
import { JobTitle } from './job-title.model';

export interface CreateUser {

  fullName: string;

  email: string;

  password: string;

  roles: Role[];

  jobTitle: JobTitle;

}