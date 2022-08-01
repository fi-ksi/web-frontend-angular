import { Injectable } from '@angular/core';
import { Cache } from '../../util';
import { AdminTask } from '../../../api';
import { BackendService, UserService } from '../shared';
import { map, mergeMap } from 'rxjs/operators';
import { IAdminTask } from '../../models';
import { combineLatest, Subscription, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminTaskService {
  public readonly tasksCache = new Cache<number, IAdminTask>(
    100,
    (id) => this.backend.http.adminTasksGetSingle(id).pipe(map((r) => this.enrichTask(r.atask)))
  );

  private listeningDeployStatusChanges: {[taskId: number]: Subscription} = {};

  constructor(private backend: BackendService, private user: UserService) { }

  public enrichTask(task: AdminTask): IAdminTask {
    const isStableDeployState = task.deploy_status === 'done' || task.deploy_status === 'error' || task.deploy_status === 'default';
    const userHasPermissions = combineLatest([this.backend.user$, this.user.isAdmin$]).pipe(
      map(([user, isAdmin]) => isAdmin || user?.id === task.author)
    );

    const listeningForDeployStatusChange = task.id in this.listeningDeployStatusChanges;

    if (!isStableDeployState && !listeningForDeployStatusChange) {
      // If the task id deploying or in a diff, then listen for subsequent status changes
      this.listeningDeployStatusChanges[task.id] = timer(5000).pipe(mergeMap(() => this.tasksCache.refresh(task.id))).subscribe();
    } else if (listeningForDeployStatusChange) {
      // If the task has entered to a stable deploy state, stop listening
      this.listeningDeployStatusChanges[task.id].unsubscribe();
    }

    return {
      ...task,
      $canBeDeployed$: userHasPermissions.pipe(map((userHasPermissions) => userHasPermissions && isStableDeployState)),
      $isStableDeployState: isStableDeployState
    };
  }
}
