import { Role } from "./role.model";
import { JobTitle } from "./job-title.enum";

export interface User {

  id?: number;

  fullName: string;

  email: string;

  roles: Role[];

  jobTitle: JobTitle;

}