import { Injectable } from '@angular/core';
import { Cache } from '../../util';
import { AdminTask } from '../../../api';
import { BackendService, UserService } from '../shared';
import { map, mergeMap } from 'rxjs/operators';
import { IAdminTask } from '../../models';
import { combineLatest, Subscription, timer } from 'rxjs';
import { TasksService } from '../tasks';

@Injectable({
  providedIn: 'root'
})
export class AdminTaskService {
  public readonly tasksCache = new Cache<number, IAdminTask>(
    100,
    (id) => this.backend.http.adminTasksGetSingle(id).pipe(map((r) => this.enrichTask(r.atask)))
  );

  private listeningDeployStatusChanges: {[taskId: number]: Subscription} = {};

  constructor(private backend: BackendService, private user: UserService, private tasks: TasksService) { }

  public enrichTask(task: AdminTask): IAdminTask {
    const isStableDeployState = task.deploy_status === 'done' || task.deploy_status === 'error' || task.deploy_status === 'default';
    const isMerged = task.git_branch === 'master';

    const canBeDeployed$ = combineLatest([this.backend.user$, this.user.isAdmin$, this.tasks.cacheWaves.get(task.wave)]).pipe(
      map(([user, isAdmin, wave]) => isAdmin || (!isMerged && (user?.id === task.author || user?.id === wave.garant)))
    );
    const canBeDeleted$ = this.user.isAdmin$;
    const canBeMerged$ = this.user.isAdmin$.pipe(map((isAdmin) => isAdmin && !isMerged));

    const listeningForDeployStatusChange = task.id in this.listeningDeployStatusChanges;

    if (!isStableDeployState && !listeningForDeployStatusChange) {
      // If the task id deploying or in a diff, then listen for subsequent status changes
      this.listeningDeployStatusChanges[task.id] = timer(5000).pipe(mergeMap(() => this.tasksCache.refresh(task.id))).subscribe();
    } else if (listeningForDeployStatusChange) {
      // If the task has entered to a stable deploy state, stop listening
      this.listeningDeployStatusChanges[task.id].unsubscribe();
      this.tasks.getTaskOnce(task.id, true).subscribe();
    }

    return {
      ...task,
      $canBeDeployed$: canBeDeployed$,
      $isStableDeployState: isStableDeployState,
      $canBeDeleted$: canBeDeleted$,
      $isMerged: isMerged,
      $canBeMerged$: canBeMerged$
    };
  }
}
