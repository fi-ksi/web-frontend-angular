import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wavesDeleteSingle, wavesGetAll } from '../../api/client';
import type { components } from '../../api/schema';
import { ROUTES } from '../../routes';
import { useTranslation } from 'react-i18next';
import { useSelectedYear } from '../../hooks/useSelectedYear';
import { ClickableUserName } from '../shared/ClickableUserName';
import { Modal } from './shared/Modal';

type S = components['schemas'];

const ICON_ADD = '+';
const ICON_EDIT = '🖉';
const ICON_DELETE = '🗑';

/**
 * Admin list of waves of the selected year. Port of PageAdminWavesComponent.
 */
export function PageAdminWaves(): React.ReactElement {
  const { t } = useTranslation();
  const { selectedYear } = useSelectedYear();
  const queryClient = useQueryClient();
  const yearId = selectedYear?.id;

  const wavesQuery = useQuery({
    queryKey: ['admin', 'waves', yearId],
    queryFn: async (): Promise<S['Wave'][]> => {
      const resp = await wavesGetAll(yearId);
      return resp.waves;
    },
    enabled: yearId !== undefined
  });
  const waves = wavesQuery.data ?? [];

  const [waveToDelete, setWaveToDelete] = useState<S['Wave'] | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (waveId: number) => wavesDeleteSingle(waveId),
    onSuccess: () => {
      setWaveToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'waves'] });
    }
  });

  const totalPoints = waves.reduce((sum, wave) => sum + (wave.sum_points || 0), 0);
  const tasksCount = waves.reduce((count, wave) => count + (wave.tasks_cnt || 0), 0);

  const isReleased = (wave: S['Wave']): boolean =>
    wave.time_published != null && new Date(wave.time_published) < new Date();
  const hasTasks = (wave: S['Wave']): boolean => wave.tasks_cnt > 0;
  const canDelete = (wave: S['Wave']): boolean => !isReleased(wave) && !hasTasks(wave);
  const deleteTitle = (wave: S['Wave']): string => {
    if (isReleased(wave)) {
      return 'Nelze smazat zveřejněnou vlnu';
    }
    if (hasTasks(wave)) {
      return 'Nelze smazat vlnu s úlohami';
    }
    return 'Smazat';
  };

  const editBase = `/${ROUTES.admin._}/${ROUTES.admin.waves._}`;
  const editHref = (waveId: number | string): string =>
    `${editBase}/${ROUTES.admin.waves.edit}/${waveId}`;

  return (
    <div className="content-container">
      <div className="content">
        <h2>{t('admin.waves.title')}</h2>
        <Link className="btn btn-ksi" href={editHref(0)}>
          {ICON_ADD} {t('admin.waves.new')}
        </Link>

        <table className="table table-striped table-hover table-responsive-md threads">
          <thead>
            <tr style={{ height: 45 }}>
              <th>{t('admin.waves.head.wave')}</th>
              <th>{t('admin.waves.head.name')}</th>
              <th>{t('admin.waves.head.guarantor')}</th>
              <th>{t('admin.waves.head.release')}</th>
              <th>{t('admin.waves.head.max-points')}</th>
              <th>{t('admin.waves.head.task-count')}</th>
              <th>{t('admin.waves.head.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {waves.map((wave) => (
              <tr key={wave.id}>
                <td>{wave.index}</td>
                <td>
                  <Link href={editHref(wave.id)}>{wave.caption}</Link>
                </td>
                <td>
                  <ClickableUserName userId={wave.garant} />
                </td>
                <td>{wave.time_published ? new Date(wave.time_published).toLocaleString('cs-CZ') : '---'}</td>
                <td>{wave.sum_points}</td>
                <td>{wave.tasks_cnt}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => window.alert('Feature is not implemented yet.')}
                  >
                    {ICON_ADD} Přidat úlohu
                  </button>
                  <Link className="btn btn-outline-primary" href={editHref(wave.id)}>
                    {ICON_EDIT}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={!canDelete(wave)}
                    title={deleteTitle(wave)}
                    onClick={() => setWaveToDelete(wave)}
                  >
                    {ICON_DELETE}
                  </button>
                </td>
              </tr>
            ))}
            <tr className="selected" style={{ backgroundColor: 'var(--ksi-dropdown-hover-bg)' }}>
              <td>∑</td>
              <td></td>
              <td></td>
              <td></td>
              <td>{totalPoints}</td>
              <td>{tasksCount}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div className="alert alert-warning">
          <p>
            <b>{t('admin.waves.warning.title')}</b>: {t('admin.waves.warning.message')}
          </p>
        </div>

        <Modal
          show={waveToDelete !== null}
          title={t('admin.waves.delete.btn')}
          onClose={() => setWaveToDelete(null)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setWaveToDelete(null)}>
                {t('modal.yes-no.no')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (waveToDelete) {
                    deleteMutation.mutate(waveToDelete.id);
                  }
                }}
              >
                {t('modal.yes-no.yes')}
              </button>
            </>
          }
        >
          <p>{t('admin.shared.delete-confirmation')}</p>
        </Modal>
      </div>
    </div>
  );
}
