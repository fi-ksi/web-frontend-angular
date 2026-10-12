import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersGetAll, yearsCreateNew, yearsGetSingle, yearsUpdateSingle } from '../../api/client';
import type { components } from '../../api/schema';
import { ROUTES } from '../../routes';
import { useTranslation } from 'react-i18next';
import { Modal } from './shared/Modal';

type S = components['schemas'];

interface YearForm {
  index: string;
  year: string;
  sealed: boolean;
  point_pad: string;
  active_orgs: number[];
}

const EMPTY_FORM: YearForm = { index: '0', year: '', sealed: false, point_pad: '', active_orgs: [] };

/**
 * Admin create/edit form for a single year. `yearId === '0'` means a new year.
 */
export function PageAdminYearsEdit(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const rawYearId = params?.yearId;
  const yearId = Array.isArray(rawYearId) ? rawYearId[0] : rawYearId ?? '0';
  const isNew = yearId === '0';
  const numericId = Number.parseInt(yearId, 10);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<YearForm>(EMPTY_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [notFound, setNotFound] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const baseHref = `/${ROUTES.admin._}/${ROUTES.admin.years._}`;

  const organisatorsQuery = useQuery({
    queryKey: ['admin', 'organisators'],
    queryFn: async (): Promise<S['User'][]> => {
      const resp = await usersGetAll('organisators');
      return resp.users;
    }
  });
  const organisators = organisatorsQuery.data ?? [];

  // Edit mode: load the year, then pre-select organisers active in this year's seasons.
  const yearQuery = useQuery({
    queryKey: ['admin', 'year', numericId],
    queryFn: async (): Promise<S['Year']> => {
      const resp = await yearsGetSingle(numericId);
      return resp.year;
    },
    enabled: !isNew && !Number.isNaN(numericId)
  });

  useEffect(() => {
    if (yearQuery.data) {
      const year = yearQuery.data;
      const activeUsers = organisators
        .filter((user) => user.seasons?.includes(numericId))
        .map((user) => user.id);
      setForm({
        index: String(year.id),
        year: year.year,
        sealed: year.sealed,
        point_pad: String(year.point_pad ?? ''),
        active_orgs: activeUsers
      });
    }
  }, [yearQuery.data, organisators, numericId]);

  useEffect(() => {
    if (yearQuery.isError) {
      setNotFound(true);
    }
  }, [yearQuery.isError]);

  const markTouched = (field: string): void =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const toggleUserActive = (userId: number): void => {
    setForm((f) => ({
      ...f,
      active_orgs: f.active_orgs.includes(userId)
        ? f.active_orgs.filter((id) => id !== userId)
        : [...f.active_orgs, userId]
    }));
    markTouched('active_orgs');
  };

  const errors: Record<string, string | null> = {
    index: form.index.trim() === '' ? t('admin.years.editPage.indexRequired') : null,
    year: form.year.trim() === '' ? t('admin.years.editPage.yearRequired') : null,
    point_pad: form.point_pad.trim() === '' ? t('admin.years.editPage.pointPadInvalid') : null,
    active_orgs: null
  };
  const isValid = Object.values(errors).every((e) => e === null);

  const saveMutation = useMutation({
    mutationFn: async (): Promise<unknown> => {
      const payload = {
        id: isNew ? 0 : numericId,
        year: form.year.trim(),
        sealed: form.sealed,
        point_pad: Number(form.point_pad),
        active_orgs: form.active_orgs
      };
      if (isNew) {
        return yearsCreateNew({ year: payload });
      }
      return yearsUpdateSingle({ year: payload }, numericId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'years'] });
      router.push(baseHref);
    },
    onError: () => setSaveFailed(true)
  });

  const save = (e: React.FormEvent): void => {
    e.preventDefault();
    setTouched({ index: true, year: true, point_pad: true, active_orgs: true });
    if (!isValid) {
      return;
    }
    saveMutation.mutate();
  };

  const fieldError = (field: string): string | null =>
    touched[field] ? errors[field] : null;

  return (
    <div className="content-container">
      <div className="content">
        <h2>{isNew ? t('admin.years.editPage.newYear') : t('admin.years.editPage.edit')}</h2>
        <Link href={baseHref}>{t('admin.years.editPage.backToOverview')}</Link>

        <form onSubmit={save}>
          <div className="form-group">
            <label htmlFor="index">{t('admin.years.editPage.index')}*</label>
            <input
              type="number"
              id="index"
              className="form-control"
              required
              value={form.index}
              onChange={(e) => {
                setForm((f) => ({ ...f, index: e.target.value }));
                markTouched('index');
              }}
            />
            {fieldError('index') && <div className="text-danger">{fieldError('index')}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="year">{t('admin.years.editPage.year')}*</label>
            <input
              type="text"
              id="year"
              className="form-control"
              required
              value={form.year}
              onChange={(e) => {
                setForm((f) => ({ ...f, year: e.target.value }));
                markTouched('year');
              }}
            />
            {fieldError('year') && <div className="text-danger">{fieldError('year')}</div>}
          </div>

          <div className="form-group" style={{ position: 'relative', display: 'flex', flexDirection: 'row' }}>
            <label className="form-check-label" htmlFor="sealed" style={{ marginLeft: 24 }}>
              <input
                type="checkbox"
                id="sealed"
                className="form-check-input"
                checked={form.sealed}
                onChange={(e) => setForm((f) => ({ ...f, sealed: e.target.checked }))}
              />
              {t('admin.years.editPage.sealed')}
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="point_pad">{t('admin.years.editPage.pointPad')}</label>
            <input
              type="number"
              id="point_pad"
              className="form-control"
              value={form.point_pad}
              onChange={(e) => {
                setForm((f) => ({ ...f, point_pad: e.target.value }));
                markTouched('point_pad');
              }}
            />
            {fieldError('point_pad') && <div className="text-danger">{fieldError('point_pad')}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="active_orgs">{t('admin.years.editPage.activeOrgs')}</label>
            <ul>
              {organisators.map((user) => (
                <li key={user.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.active_orgs.includes(user.id)}
                      onChange={() => toggleUserActive(user.id)}
                    />
                    {user.first_name} {user.nick_name} {user.last_name} ({user.email})
                  </label>
                </li>
              ))}
            </ul>
            {fieldError('active_orgs') && <div className="text-danger">{fieldError('active_orgs')}</div>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
            {isNew ? t('admin.years.editPage.create') : t('admin.years.editPage.save')}
          </button>
        </form>

        <Modal
          show={notFound}
          onClose={() => setNotFound(false)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setNotFound(false)}>
                {t('modal.yes-no.no')}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => router.push(baseHref)}>
                {t('modal.yes-no.yes')}
              </button>
            </>
          }
        >
          <p>{t('admin.shared.not-found-redirection')}</p>
        </Modal>

        <Modal
          show={saveFailed}
          onClose={() => setSaveFailed(false)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => router.push(baseHref)}>
                {t('modal.yes-no.no')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setSaveFailed(false);
                  saveMutation.mutate();
                }}
              >
                {t('modal.yes-no.yes')}
              </button>
            </>
          }
        >
          <p>Failed to save year. Do you want to try again?</p>
        </Modal>
      </div>
    </div>
  );
}
