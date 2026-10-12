import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { yearsDeleteSingle, yearsGetAll } from '../../api/client';
import type { components } from '../../api/schema';
import { ROUTES } from '../../routes';
import { useTranslation } from 'react-i18next';
import { Modal } from './shared/Modal';

type S = components['schemas'];

const ICON_ADD = '+';
const ICON_EDIT = '🖉';
const ICON_DELETE = '🗑';
const ICON_CHECKMARK = '✓';
const ICON_CROSS = '☓';

/**
 * Admin list of years. Sealed years cannot be deleted, mirroring the Angular template.
 */
export function PageAdminYears(): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const yearsQuery = useQuery({
    queryKey: ['admin', 'years'],
    queryFn: async (): Promise<S['Year'][]> => {
      const resp = await yearsGetAll();
      return resp.years;
    }
  });
  const years = yearsQuery.data ?? [];

  const [yearToDelete, setYearToDelete] = useState<S['Year'] | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (yearId: number) => yearsDeleteSingle(yearId),
    onSuccess: () => {
      setYearToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'years'] });
    }
  });

  const editBase = `/${ROUTES.admin._}/${ROUTES.admin.years._}`;
  const editHref = (yearId: number | string): string =>
    `${editBase}/${ROUTES.admin.years.edit}/${yearId}`;

  return (
    <div className="content-container">
      <div className="content">
        <h2>{t('admin.years.title')}</h2>
        <Link className="btn btn-ksi" href={editHref(0)}>
          {ICON_ADD} {t('admin.years.newYear')}
        </Link>

        <table className="table table-striped table-hover table-responsive-md threads">
          <thead>
            <tr style={{ height: 45 }}>
              <th>{t('admin.years.index')}</th>
              <th>{t('admin.years.year')}</th>
              <th>{t('admin.years.maxPoints')}</th>
              <th>{t('admin.years.pointPad')}</th>
              <th>{t('admin.years.taskCount')}</th>
              <th>{t('admin.years.sealed')}</th>
              <th>{t('admin.years.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {years.map((year) => (
              <tr key={year.id}>
                <td>{year.id}</td>
                <td>
                  <Link href={editHref(year.id)}>{year.year}</Link>
                </td>
                <td>{year.sum_points}</td>
                <td>{year.point_pad}</td>
                <td>{year.tasks_cnt}</td>
                <td>{year.sealed ? ICON_CHECKMARK : ICON_CROSS}</td>
                <td>
                  <Link className="btn btn-outline-primary" href={editHref(year.id)}>
                    {ICON_EDIT} {t('admin.years.edit')}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={year.sealed}
                    title={year.sealed ? t('admin.years.cannotDeleteSealed') : t('admin.years.delete')}
                    onClick={() => setYearToDelete(year)}
                  >
                    {ICON_DELETE}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="alert alert-warning">
          <b>{t('admin.years.warningTitle')}</b>: {t('admin.years.warningMessage')}
        </div>

        <Modal
          show={yearToDelete !== null}
          title={t('admin.years.delete')}
          onClose={() => setYearToDelete(null)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setYearToDelete(null)}>
                {t('modal.yes-no.no')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (yearToDelete) {
                    deleteMutation.mutate(yearToDelete.id);
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
