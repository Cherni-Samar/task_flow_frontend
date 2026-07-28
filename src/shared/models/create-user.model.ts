import { Role } from './role.model';
import { JobTitle } from './job-title.enum';

export interface CreateUser {

  fullName: string;

  email: string;

  password: string;

  jobTitle: JobTitle;
  
  roleIds:number[];

}