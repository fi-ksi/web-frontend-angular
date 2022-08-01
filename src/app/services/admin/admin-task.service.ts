import { Injectable } from '@angular/core';
import { Cache } from '../../util';
import { AdminTask } from '../../../api';
import { BackendService, UserService } from '../shared';
import { map } from 'rxjs/operators';
import { IAdminTask } from '../../models';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminTaskService {
  public readonly tasksCache = new Cache<number, IAdminTask>(
    100,
    (id) => this.backend.http.adminTasksGetSingle(id).pipe(map((r) => this.enrichTask(r.atask)))
  );

  constructor(private backend: BackendService, private user: UserService) { }

  public enrichTask(task: AdminTask): IAdminTask {
    const isStableDeployState = task.deploy_status === 'done' || task.deploy_status === 'error' || task.deploy_status === 'default';
    const userHasPermissions = combineLatest([this.backend.user$, this.user.isAdmin$]).pipe(
      map(([user, isAdmin]) => isAdmin || user?.id === task.author)
    );

    return {
      ...task,
      $canBeDeployed$: userHasPermissions.pipe(map((userHasPermissions) => userHasPermissions && isStableDeployState))
    };
  }
}
