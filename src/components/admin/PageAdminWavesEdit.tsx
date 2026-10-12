import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wavesCreateNew, wavesGetAll, wavesGetSingle, wavesUpdateSingle } from '../../api/client';
import type { components } from '../../api/schema';
import { ROUTES } from '../../routes';
import { useTranslation } from 'react-i18next';
import { useOrganisators } from '../../hooks/useNews';
import { useSelectedYear } from '../../hooks/useSelectedYear';
import { Modal } from './shared/Modal';
import { isoToDateInput } from './dateInput';

type S = components['schemas'];

interface WaveForm {
  index: string;
  caption: string;
  time_published: string;
  garant: string;
}

const EMPTY_FORM: WaveForm = { index: '0', caption: '', time_published: '', garant: '' };

/**
 * Admin create/edit form for a single wave. `waveId === '0'` means a new wave,
 * mirroring AdminBaseEditComponent's EditMode logic.
 */
export function PageAdminWavesEdit(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const rawWaveId = params?.waveId;
  const waveId = Array.isArray(rawWaveId) ? rawWaveId[0] : rawWaveId ?? '0';
  const isNew = waveId === '0';
  const numericId = Number.parseInt(waveId, 10);
  const queryClient = useQueryClient();

  const { selectedYear } = useSelectedYear();
  const { organisators } = useOrganisators();

  const [form, setForm] = useState<WaveForm>(EMPTY_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [notFound, setNotFound] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const baseHref = `/${ROUTES.admin._}/${ROUTES.admin.waves._}`;

  // New mode: prefill the index with waves count + 1, mirroring the Angular component.
  const wavesCountQuery = useQuery({
    queryKey: ['admin', 'waves', selectedYear?.id],
    queryFn: async (): Promise<number> => {
      const resp = await wavesGetAll(selectedYear?.id);
      return resp.waves.length;
    },
    enabled: isNew && selectedYear?.id !== undefined
  });

  useEffect(() => {
    if (isNew && wavesCountQuery.data !== undefined) {
      setForm((f) => ({ ...f, index: String(wavesCountQuery.data + 1) }));
    }
  }, [isNew, wavesCountQuery.data]);

  // Edit mode: load the wave and patch the form (ISO -> YYYY-MM-DD for the date input).
  const waveQuery = useQuery({
    queryKey: ['admin', 'wave', numericId],
    queryFn: async (): Promise<S['Wave']> => {
      const resp = await wavesGetSingle(numericId);
      return resp.wave;
    },
    enabled: !isNew && !Number.isNaN(numericId)
  });

  useEffect(() => {
    if (waveQuery.data) {
      const wave = waveQuery.data;
      setForm({
        index: String(wave.index),
        caption: wave.caption ?? '',
        time_published: isoToDateInput(wave.time_published),
        garant: String(wave.garant)
      });
    }
  }, [waveQuery.data]);

  useEffect(() => {
    if (waveQuery.isError) {
      setNotFound(true);
    }
  }, [waveQuery.isError]);

  const set = (field: keyof WaveForm, value: string): void => {
    setForm((f) => ({ ...f, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const errors: Record<keyof WaveForm, string | null> = {
    index: form.index.trim() === '' ? t('admin.waves.index.required') : null,
    caption: form.caption.trim() === '' ? t('admin.waves.caption.required') : null,
    time_published: form.time_published === '' ? t('admin.waves.time_published.required') : null,
    garant: form.garant === '' ? t('admin.waves.garant.required') : null
  };
  const isValid = Object.values(errors).every((e) => e === null);

  const saveMutation = useMutation({
    mutationFn: async (): Promise<unknown> => {
      const body = {
        index: Number(form.index),
        caption: form.caption.trim(),
        garant: Number(form.garant),
        time_published: form.time_published
      };
      if (isNew) {
        return wavesCreateNew({ wave: { ...body, year: selectedYear?.id ?? 0 } });
      }
      return wavesUpdateSingle({ wave: body }, numericId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'waves'] });
      router.push(baseHref);
    },
    onError: () => setSaveFailed(true)
  });

  const save = (e: React.FormEvent): void => {
    e.preventDefault();
    setTouched({ index: true, caption: true, time_published: true, garant: true });
    if (!isValid) {
      return;
    }
    saveMutation.mutate();
  };

  const fieldError = (field: keyof WaveForm): string | null =>
    touched[field] ? errors[field] : null;

  return (
    <div className="content-container">
      <div className="content">
        <h2>{isNew ? t('admin.waves.edit_page.new') : t('admin.waves.edit_page.edit')}</h2>
        <Link href={baseHref}>{t('admin.waves.back')}</Link>

        <form onSubmit={save}>
          <div className="form-group">
            <label htmlFor="caption">{t('admin.waves.caption')}*</label>
            <input
              type="text"
              id="caption"
              className="form-control"
              required
              value={form.caption}
              onChange={(e) => set('caption', e.target.value)}
            />
            {fieldError('caption') && <div className="text-danger">{fieldError('caption')}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="garant">{t('admin.waves.garant')}*</label>
            <select
              id="garant"
              className="form-control"
              required
              value={form.garant}
              onChange={(e) => set('garant', e.target.value)}
            >
              <option value=""></option>
              {organisators.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.nick_name} {user.last_name} ( {user.id} )
                </option>
              ))}
            </select>
            {fieldError('garant') && <div className="text-danger">{fieldError('garant')}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="time_published">{t('admin.waves.time_published')}*</label>
            <input
              type="date"
              id="time_published"
              className="form-control"
              placeholder="DD.MM.YYYY"
              value={form.time_published}
              onChange={(e) => set('time_published', e.target.value)}
            />
            {fieldError('time_published') && (
              <div className="text-danger">{fieldError('time_published')}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="index">{t('admin.waves.index')}*</label>
            <input
              type="number"
              id="index"
              className="form-control"
              required
              value={form.index}
              onChange={(e) => set('index', e.target.value)}
            />
            {fieldError('index') && <div className="text-danger">{fieldError('index')}</div>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
            {isNew ? t('admin.waves.create') : t('admin.waves.save')}
          </button>
        </form>

        <Modal
          show={notFound}
          title={t('admin.shared.not-found-redirection')}
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
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push(baseHref)}
              >
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
          <p>Failed to save wave. Do you want to try again?</p>
        </Modal>
      </div>
    </div>
  );
}
