import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  achievementsCreateNew,
  achievementsEditSingle,
  achievementsGetSingle,
  contentsCreateNewForm,
  contentsDeleteSingle,
  contentsGetSingle
} from '../../api/client';
import type { components } from '../../api/schema';
import { ROUTES } from '../../routes';
import { useTranslation } from 'react-i18next';
import { Modal } from './shared/Modal';
import { RichTextEditor } from '../shared/RichTextEditor';
import { isRichTextEmpty } from '../../utils/richtext';
import './PageAdminAchievementsEdit.scss';

type S = components['schemas'];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030/';

interface AchievementForm {
  title: string;
  description: string;
  persistent: boolean;
  picture: string;
  active: boolean;
}

/**
 * Admin create/edit form for a single achievement, including the shared
 * image gallery (upload/delete/pick-as-thumbnail) backed by the content API.
 */
export function PageAdminAchievementsEdit(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const rawAchievementId = params?.achievementId;
  const achievementId = Array.isArray(rawAchievementId) ? rawAchievementId[0] : rawAchievementId ?? '0';
  const isNew = achievementId === '0';
  const numericId = Number.parseInt(achievementId, 10);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<AchievementForm>({
    title: '',
    description: '',
    persistent: false,
    picture: '',
    active: false
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [notFound, setNotFound] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseHref = `/${ROUTES.admin._}/${ROUTES.admin.achievements._}`;

  const achievementQuery = useQuery({
    queryKey: ['admin', 'achievement', numericId],
    queryFn: async (): Promise<S['Achievement']> => {
      const resp = await achievementsGetSingle(numericId);
      return resp.achievement;
    },
    enabled: !isNew && !Number.isNaN(numericId)
  });

  useEffect(() => {
    if (achievementQuery.data) {
      const achievement = achievementQuery.data;
      setForm({
        title: achievement.title,
        description: achievement.description,
        persistent: achievement.persistent,
        picture: achievement.picture ?? '',
        active: false
      });
    }
  }, [achievementQuery.data]);

  useEffect(() => {
    if (achievementQuery.isError) {
      setNotFound(true);
    }
  }, [achievementQuery.isError]);

  const imagesQuery = useQuery({
    queryKey: ['admin', 'achievement-images'],
    queryFn: async (): Promise<string[]> => {
      const resp = await contentsGetSingle('achievements');
      if (resp instanceof Blob) {
        return [];
      }
      return resp.content?.files ?? [];
    }
  });
  const images = imagesQuery.data ?? [];

  const deleteImageMutation = useMutation({
    mutationFn: (imageName: string) => contentsDeleteSingle(`achievements/${imageName}`),
    onSuccess: () => {
      setImageToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'achievement-images'] });
    }
  });

  const uploadImageMutation = useMutation({
    mutationFn: (uploadFiles: File[]) => contentsCreateNewForm(uploadFiles, 'achievements'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'achievement-images'] });
    }
  });

  const getImageUrl = (filename: string): string =>
    `${BACKEND_URL}content/achievements/${filename}`;

  const markTouched = (field: string): void =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const errors: Record<string, string | null> = {
    // admin.achievements.title.required / description.required are missing
    // from the i18n bundle, so plain Czech fallbacks are used here.
    title: form.title.trim() === '' ? 'Název je povinný.' : null,
    description: isRichTextEmpty(form.description) ? 'Popis je povinný.' : null
  };
  const isValid = Object.values(errors).every((e) => e === null);

  const saveMutation = useMutation({
    mutationFn: async (): Promise<unknown> => {
      const body = {
        title: form.title.trim(),
        picture: form.picture,
        description: form.description,
        persistent: form.persistent
      };
      if (isNew) {
        return achievementsCreateNew({ achievement: body });
      }
      return achievementsEditSingle({ achievement: body }, numericId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'achievements'] });
      router.push(baseHref);
    },
    onError: () => setSaveFailed(true)
  });

  const save = (e: React.FormEvent): void => {
    e.preventDefault();
    setTouched({ title: true, description: true });
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
        <h2>{isNew ? t('admin.achievements.edit_page.new') : t('admin.achievements.edit_page.edit')}</h2>
        <Link href={baseHref}>{t('admin.achievements.edit_page.back')}</Link>

        <form onSubmit={save}>
          <div className="form-group">
            <label htmlFor="title">{t('admin.achievements.title')}*</label>
            <input
              type="text"
              id="title"
              className="form-control"
              required
              value={form.title}
              onChange={(e) => {
                setForm((f) => ({ ...f, title: e.target.value }));
                markTouched('title');
              }}
            />
            {fieldError('title') && <div className="text-danger">{fieldError('title')}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('admin.achievements.description')}*</label>
            <RichTextEditor
              className="reply-editor"
              value={form.description}
              onChange={(html) => {
                setForm((f) => ({ ...f, description: html }));
                markTouched('description');
              }}
            />
            {fieldError('description') && (
              <div className="text-danger">{fieldError('description')}</div>
            )}
          </div>

          <div className="form-group form-check">
            <input
              type="checkbox"
              id="persistent"
              className="form-check-input"
              checked={form.persistent}
              onChange={(e) => setForm((f) => ({ ...f, persistent: e.target.checked }))}
            />
            <label className="form-check-label" htmlFor="persistent">
              {t('admin.achievements.persistent')}
            </label>
          </div>

          <div className="form-group">
            <label>{t('admin.achievements.images')}</label>
            {images.length > 0 ? (
              <div className="achievement-images-selection">
                {images.map((file) => (
                  <div
                    key={file}
                    className={`achievement-image-card${form.picture === getImageUrl(file) ? ' selected' : ''}`}
                  >
                    {file}
                    <img
                      src={getImageUrl(file)}
                      alt={file}
                      style={{ maxWidth: 100, maxHeight: 100 }}
                      className="achievement-image-preview"
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => setImageToDelete(file)}
                    >
                      {t('admin.achievements.delete_image')}
                    </button>
                    {form.picture !== getImageUrl(file) ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => setForm((f) => ({ ...f, picture: getImageUrl(file) }))}
                      >
                        {t('admin.achievements.make_thumbnail')}
                      </button>
                    ) : (
                      <button type="button" className="btn btn-sm btn-secondary" disabled>
                        Trofej označena
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>{t('admin.achievements.no_images')}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                const selected = e.target.files ? Array.from(e.target.files) : [];
                if (selected.length > 0) {
                  uploadImageMutation.mutate(selected);
                }
                e.target.value = '';
              }}
            />
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('admin.achievements.upload_image')}
            </button>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
            {isNew ? t('admin.achievements.create') : t('admin.achievements.save')}
          </button>
        </form>

        <Modal
          show={imageToDelete !== null}
          onClose={() => setImageToDelete(null)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setImageToDelete(null)}>
                {t('modal.yes-no.no')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleteImageMutation.isPending}
                onClick={() => {
                  if (imageToDelete) {
                    deleteImageMutation.mutate(imageToDelete);
                  }
                }}
              >
                {t('modal.yes-no.yes')}
              </button>
            </>
          }
        >
          <p>Delete file? If other achievements are using this image, it will be removed from them too!</p>
        </Modal>

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
          <p>Failed to save achievement. Do you want to try again?</p>
        </Modal>
      </div>
    </div>
  );
}
