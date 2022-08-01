import { AdminTask } from '../../api';
import { Observable } from 'rxjs';

export interface IAdminTask extends AdminTask {
  $canBeDeployed$: Observable<boolean>;
  $canBeDeleted$: Observable<boolean>;
  $canBeMerged$: Observable<boolean>;
  $isStableDeployState: boolean;
  $isMerged: boolean;
}
