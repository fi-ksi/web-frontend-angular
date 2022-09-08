import { User } from '../../api';
import { YearSelect } from './years.service';

export interface IUser extends User {
  $isAdmin: boolean;
  $isOrg: boolean;
  $year: YearSelect | null;
  $fullName: string;
  $hasPicture: boolean;
}
