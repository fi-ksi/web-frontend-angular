import { User } from "../../api";

export interface IUser extends User {
  isAdmin: boolean;
  isOrg: boolean;
}
