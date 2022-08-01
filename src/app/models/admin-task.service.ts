import { AdminTask } from '../../api';
import { Observable } from 'rxjs';

export interface IAdminTask extends AdminTask {
  $canBeDeployed$: Observable<boolean>;
}
