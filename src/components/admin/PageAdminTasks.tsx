import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminTaskDeploySingle,
  adminTaskMergeSingle,
  adminTasksGetAll,
  adminTasksGetDeploySingle,
  wavesGetAll
} from '../../api/client';
import type { components } from '../../api/schema';
import { ROUTES } from '../../routes';
import { useAuth } from '../../auth/AuthContext';
import { Modal } from './shared/Modal';
import { AdminWaveSelector } from './shared/AdminWaveSelector';
import { ClickableUserName } from '../shared/ClickableUserName';

type S = components['schemas'];

const isStableDeployState = (status: S['AdminTaskDeployStatus']): boolean =>
  status === 'done' || status === 'error' || status === 'default';

/** Czech plural for "points": 1 bod, 2-4 body, 5+ bodů. */
const pointsLabel = (n: number): string => {
  if (n === 1) return 'bod';
  if (n >= 2 && n <= 4) return 'body';
  return 'bodů';
};

const deployBadgeClass = (status: S['AdminTaskDeployStatus']): string =>
  `clickable badge deploy-status badge-${
    status === 'done' ? 'success' : status === 'error' ? 'danger' : 'warning'
  }`;

const deployIcon = (status: S['AdminTaskDeployStatus']): string =>
  status === 'done' ? '✓' : status === 'error' ? '☓' : '⚠';

/**
 * Admin tasks page: tasks grouped by wave, with per-task deploy and merge
 * actions. Deploy status is polled while a deployment is in progress; the
 * deploy log opens in a modal when the status badge is clicked (or when a
 * deployment finishes with an error).
 */
export function PageAdminTasks(): React.ReactElement {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [waveFilter, setWaveFilter] = useState<number | null>(null);
  const [deployingIds, setDeployingIds] = useState<number[]>([]);
  const [mergeTarget, setMergeTarget] = useState<S['AdminTask'] | null>(null);
  const [logTaskId, setLogTaskId] = useState<number | null>(null);
  const [deployLog, setDeployLog] = useState<S['AdminTaskDeployResponse'] | null>(null);

  const tasksQuery = useQuery({
    queryKey: ['admin', 'tasks'],
    queryFn: () => adminTasksGetAll(),
    staleTime: 30_000
  });
  const wavesQuery = useQuery({
    queryKey: ['admin', 'waves'],
    queryFn: () => wavesGetAll(),
    staleTime: 5 * 60_000
  });

  const waveMap = useMemo(() => {
    const map = new Map<number, S['Wave']>();
    (wavesQuery.data?.waves ?? []).forEach((wave) => map.set(wave.id, wave));
    return map;
  }, [wavesQuery.data]);

  const isAdmin = user?.role === 'admin';

  const canDeploy = (task: S['AdminTask']): boolean => {
    const isMerged = task.git_branch === 'master';
    const wave = waveMap.get(task.wave);
    return (
      isAdmin ||
      user?.id === wave?.garant ||
      (!isMerged && (user?.id === task.author || user?.id === task.co_author))
    );
  };

  const canMerge = (task: S['AdminTask']): boolean => {
    const isMerged = task.git_branch === 'master';
    const wave = waveMap.get(task.wave);
    return (isAdmin || user?.id === wave?.garant) && !isMerged;
  };

  const grouped = useMemo(() => {
    const all = tasksQuery.data?.atasks ?? [];
    const filtered = waveFilter === null ? all : all.filter((task) => task.wave === waveFilter);
    const byWave = new Map<number, S['AdminTask'][]>();
    filtered.forEach((task) => {
      const list = byWave.get(task.wave) ?? [];
      list.push(task);
      byWave.set(task.wave, list);
    });
    return [...byWave.entries()]
      .map(([waveId, tasks]) => ({ waveId, wave: waveMap.get(waveId), tasks }))
      .sort((a, b) => b.waveId - a.waveId);
  }, [tasksQuery.data, waveFilter, waveMap]);

  // Poll the deploy endpoint until the task reaches a stable deploy state.
  const pollDeployUntilStable = (taskId: number, onDone: (r: S['AdminTaskDeployResponse']) => void) => {
    const iv = setInterval(async () => {
      try {
        const r = await adminTasksGetDeploySingle(taskId);
        if (isStableDeployState(r.deploy_status)) {
          clearInterval(iv);
          setDeployingIds((ids) => ids.filter((id) => id !== taskId));
          void queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] });
          onDone(r);
        }
      } catch {
        clearInterval(iv);
        setDeployingIds((ids) => ids.filter((id) => id !== taskId));
      }
    }, 1500);
  };

  const deployMutation = useMutation({
    mutationFn: (taskId: number) => adminTaskDeploySingle(taskId),
    onSuccess: (_resp, taskId) => {
      setDeployingIds((ids) => [...ids, taskId]);
      pollDeployUntilStable(taskId, (r) => {
        if (r.deploy_status === 'error') {
          setDeployLog(r);
          setLogTaskId(taskId);
        }
      });
    }
  });

  const mergeMutation = useMutation({
    mutationFn: (taskId: number) => adminTaskMergeSingle(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] });
    },
    onSettled: () => setMergeTarget(null)
  });

  const openDeployLog = (taskId: number) => {
    setDeployLog(null);
    setLogTaskId(taskId);
  };

  // While the deploy-log modal is open, refresh the log periodically.
  useEffect(() => {
    if (logTaskId === null) return;
    let cancelled = false;
    const fetchLog = async () => {
      try {
        const r = await adminTasksGetDeploySingle(logTaskId);
        if (!cancelled) setDeployLog(r);
      } catch {
        // keep the previous log content on transient errors
      }
    };
    void fetchLog();
    const iv = setInterval(() => void fetchLog(), 1500);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [logTaskId]);

  return (
    <div className="content-container">
      <div className="content">
        <h2 className="title">{t('admin.root.tasks.title')}</h2>

        <AdminWaveSelector value={waveFilter} onChange={setWaveFilter} />

        <table className="table table-striped table-responsive-md tasks-table">
          <thead>
            <tr className="table-head-row">
              <th scope="col">{t('admin.tasks.head.id')}</th>
              <th scope="col">{t('admin.tasks.head.name')}</th>
              <th scope="col">{t('admin.tasks.head.author')}</th>
              <th scope="col">{t('admin.tasks.head.max-points')}</th>
              <th scope="col">{t('admin.tasks.head.last-deploy')}</th>
              <th scope="col">{t('admin.tasks.head.actions.title')}</th>
              <th scope="col">{t('admin.tasks.head.state')}</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(({ waveId, wave, tasks }) => (
              <React.Fragment key={waveId}>
                <tr className="wave">
                  <td colSpan={7}>
                    <div className="info">
                      <span className="title">{wave?.caption ?? `#${waveId}`}</span>
                      {wave && (
                        <span className="desc">
                          ({wave.sum_points} {pointsLabel(wave.sum_points)}, {wave.tasks_cnt} {t('admin.tasks.wave.tasks')})
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                {tasks.map((task) => (
                  <tr key={task.id} className="row-task">
                    <td>
                      <Link href={`/${ROUTES.tasks._}/${task.id}`}>{task.id}</Link>
                    </td>
                    <td>
                      <Link href={`/${ROUTES.tasks._}/${task.id}`}>{task.title}</Link>
                    </td>
                    <td>
                      <ClickableUserName userId={task.author} />
                    </td>
                    <td>{task.max_score}</td>
                    <td>
                      {task.deploy_date
                        ? new Date(task.deploy_date).toLocaleString('cs-CZ', {
                            dateStyle: 'medium',
                            timeStyle: 'medium'
                          })
                        : ''}
                    </td>
                    <td className="actions">
                      {canDeploy(task) && (
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-deploy"
                          disabled={deployingIds.includes(task.id) || deployMutation.isPending}
                          onClick={() => deployMutation.mutate(task.id)}
                        >
                          {t('admin.tasks.head.actions.deploy')}
                        </button>
                      )}
                      {canMerge(task) && (
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => setMergeTarget(task)}
                        >
                          {t('admin.tasks.head.actions.merge.title')}
                        </button>
                      )}
                    </td>
                    <td className="text-center">
                      <div
                        className={deployBadgeClass(task.deploy_status)}
                        style={{ cursor: 'pointer' }}
                        title={t(`admin.tasks.deploy.status.${task.deploy_status}`)}
                        onClick={() => openDeployLog(task.id)}
                      >
                        {deployIcon(task.deploy_status)}
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        show={logTaskId !== null}
        title={t('admin.tasks.deploy.log.title')}
        onClose={() => setLogTaskId(null)}
      >
        {deployLog ? <pre>{deployLog.log}</pre> : '...'}
      </Modal>

      <Modal
        show={mergeTarget !== null}
        title={t('modal.yes-no.title')}
        onClose={() => setMergeTarget(null)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-ksi yes"
              onClick={() => mergeTarget && mergeMutation.mutate(mergeTarget.id)}
            >
              {t('modal.yes-no.yes')}
            </button>
            <button type="button" className="btn btn-ksi no" onClick={() => setMergeTarget(null)}>
              {t('modal.yes-no.no')}
            </button>
          </>
        }
      >
        <p className="question">{t('admin.tasks.head.actions.merge.confirmation')}</p>
      </Modal>
    </div>
  );
}
