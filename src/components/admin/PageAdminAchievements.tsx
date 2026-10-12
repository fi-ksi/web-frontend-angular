import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { achievementsDeleteSingle, achievementsGetAll } from '../../api/client';
import type { components } from '../../api/schema';
import { ROUTES } from '../../routes';
import { useTranslation } from 'react-i18next';
import { Modal } from './shared/Modal';

type S = components['schemas'];

const ICON_ADD = '+';
const ICON_EDIT = '🖉';
const ICON_DELETE = '🗑';

/**
 * Admin list of achievements, split into yearly and persistent tables.
 * Port of PageAdminAchievementsComponent.
 */
export function PageAdminAchievements(): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const achievementsQuery = useQuery({
    queryKey: ['admin', 'achievements'],
    queryFn: async (): Promise<S['Achievement'][]> => {
      const resp = await achievementsGetAll();
      return resp.achievements;
    }
  });
  const achievements = achievementsQuery.data ?? [];
  const yearly = achievements.filter((a) => !a.persistent);
  const persistent = achievements.filter((a) => a.persistent);

  const [achievementToDelete, setAchievementToDelete] = useState<S['Achievement'] | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (achievementId: number) => achievementsDeleteSingle(achievementId),
    onSuccess: () => {
      setAchievementToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'achievements'] });
    }
  });

  const base = `/${ROUTES.admin._}/${ROUTES.admin.achievements._}`;
  const editHref = (achievementId: number | string): string =>
    `${base}/${ROUTES.admin.achievements.edit}/${achievementId}`;
  const grantHref = (achievementId: number): string =>
    `${base}/${ROUTES.admin.achievements.grant}?achievement=${achievementId}`;

  const renderTable = (items: S['Achievement'][]): React.ReactElement => (
    <table className="table table-striped table-hover table-responsive-md">
      <thead>
        <tr>
          <th scope="col">{t('admin.achievements.picture')}</th>
          <th scope="col">{t('admin.achievements.name')}</th>
          <th scope="col">{t('admin.achievements.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((achievement) => (
          <tr key={achievement.id}>
            <td>
              <img src={achievement.picture} alt={achievement.title} style={{ maxWidth: 32 }} />
            </td>
            <td>{achievement.title}</td>
            <td>
              <Link className="btn btn-outline-primary" href={grantHref(achievement.id)}>
                {ICON_ADD} {t('admin.achievements.give.btn')}
              </Link>
              <Link className="btn btn-outline-primary" href={editHref(achievement.id)}>
                {ICON_EDIT} {t('admin.achievements.edit.btn')}
              </Link>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setAchievementToDelete(achievement)}
              >
                {ICON_DELETE} {t('admin.achievements.delete.btn')}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="content-container">
      <div className="content">
        <h2 className="title">{t('admin.achievements.title')}</h2>
        <Link className="btn btn-ksi" href={editHref(0)}>
          {ICON_ADD} {t('admin.achievements.new')}
        </Link>

        <h3>{t('admin.achievements.yearly')}</h3>
        {renderTable(yearly)}

        <h3>{t('admin.achievements.persistent')}</h3>
        {renderTable(persistent)}

        <Modal
          show={achievementToDelete !== null}
          title={t('admin.achievements.delete.btn')}
          onClose={() => setAchievementToDelete(null)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setAchievementToDelete(null)}>
                {t('modal.yes-no.no')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (achievementToDelete) {
                    deleteMutation.mutate(achievementToDelete.id);
                  }
                }}
              >
                {t('modal.yes-no.yes')}
              </button>
            </>
          }
        >
          <p>{t('admin.achievements.delete.message')}</p>
        </Modal>
      </div>
    </div>
  );
}
