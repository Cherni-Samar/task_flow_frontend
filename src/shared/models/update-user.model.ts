import { JobTitle } from './job-title.enum';

export interface UpdateUser {

  fullName: string;

  email: string;

  jobTitle: JobTitle;

  roleIds: number[];

}