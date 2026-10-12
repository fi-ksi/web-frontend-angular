import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  articlesCreateNew,
  articlesEditSingle,
  articlesGetSingle,
  contentsCreateNewForm,
  contentsDeleteSingle,
  contentsGetSingle
} from '../../api/client';
import type { components } from '../../api/schema';
import { ROUTES } from '../../routes';
import { useTranslation } from 'react-i18next';
import { useSelectedYear } from '../../hooks/useSelectedYear';
import { Modal } from './shared/Modal';
import { RichTextEditor } from '../shared/RichTextEditor';
import { isRichTextEmpty } from '../../utils/richtext';
import { isoToDatetimeLocal } from './dateInput';

type S = components['schemas'];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030/';

interface ArticleForm {
  title: string;
  body: string;
  published: boolean;
  time_published: string;
  picture: string;
}

/**
 * Admin create/edit form for a single article. `articleId === '0'` means a new article.
 * Attached files are managed through the content API (upload/list/delete).
 */
export function PageAdminArticleEdit(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const rawArticleId = params?.articleId;
  const articleId = Array.isArray(rawArticleId) ? rawArticleId[0] : rawArticleId ?? '0';
  const isNew = articleId === '0';
  const numericId = Number.parseInt(articleId, 10);
  const queryClient = useQueryClient();

  const { selectedYear } = useSelectedYear();

  const [form, setForm] = useState<ArticleForm>({
    title: '',
    body: '',
    published: false,
    time_published: isoToDatetimeLocal(new Date().toISOString()),
    picture: ''
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [notFound, setNotFound] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseHref = `/${ROUTES.admin._}/${ROUTES.admin.articles._}`;

  const articleQuery = useQuery({
    queryKey: ['admin', 'article', numericId],
    queryFn: async (): Promise<S['Article']> => {
      const resp = await articlesGetSingle(numericId);
      return resp.article;
    },
    enabled: !isNew && !Number.isNaN(numericId)
  });

  useEffect(() => {
    if (articleQuery.data) {
      const article = articleQuery.data;
      setForm({
        title: article.title,
        body: article.body,
        published: article.published,
        time_published: isoToDatetimeLocal(article.time_published),
        picture: article.picture ?? ''
      });
    }
  }, [articleQuery.data]);

  useEffect(() => {
    if (articleQuery.isError) {
      setNotFound(true);
    }
  }, [articleQuery.isError]);

  // Attached files, edit mode only.
  const filesQuery = useQuery({
    queryKey: ['admin', 'article', numericId, 'files'],
    queryFn: async (): Promise<string[]> => {
      const resp = await contentsGetSingle(`articles/${numericId}`);
      if (resp instanceof Blob) {
        return [];
      }
      return resp.content?.files ?? [];
    },
    enabled: !isNew && !Number.isNaN(numericId)
  });
  const files = filesQuery.data ?? [];

  const deleteFileMutation = useMutation({
    mutationFn: (file: string) => contentsDeleteSingle(`articles/${numericId}/${file}`),
    onSuccess: () => {
      setFileToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'article', numericId, 'files'] });
    }
  });

  const uploadFilesMutation = useMutation({
    mutationFn: (uploadFiles: File[]) => contentsCreateNewForm(uploadFiles, `articles/${numericId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'article', numericId, 'files'] });
    }
  });

  const copyFileUrl = (file: string): void => {
    const url = `${BACKEND_URL}content/articles/${numericId}/${file}`;
    void navigator.clipboard.writeText(url).then(() => window.alert('URL copied to clipboard'));
  };

  const markTouched = (field: string): void =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const errors: Record<string, string | null> = {
    // admin.articles.title.required / body.required / picture.required are missing
    // from the i18n bundle, so plain Czech fallbacks are used here.
    title: form.title.trim() === '' ? 'Titulek je povinný.' : null,
    body: isRichTextEmpty(form.body) ? 'Obsah je povinný.' : null,
    time_published: form.time_published === '' ? t('admin.articles.time_published.required') : null
  };
  const isValid = Object.values(errors).every((e) => e === null);

  const saveMutation = useMutation({
    mutationFn: async (): Promise<unknown> => {
      const body = {
        title: form.title.trim(),
        body: form.body,
        published: form.published,
        year: selectedYear?.id ?? 0,
        time_published: form.time_published,
        picture: form.picture
      };
      if (isNew) {
        return articlesCreateNew({ article: body });
      }
      return articlesEditSingle({ article: body }, numericId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
      router.push(baseHref);
    },
    onError: () => setSaveFailed(true)
  });

  const save = (e: React.FormEvent): void => {
    e.preventDefault();
    setTouched({ title: true, body: true, time_published: true, picture: true });
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
        <h2>{isNew ? t('admin.articles.edit_page.new') : t('admin.articles.edit_page.edit')}</h2>
        <Link href={baseHref}>{t('admin.articles.back')}</Link>

        <form onSubmit={save}>
          <div className="form-group">
            <label htmlFor="title">{t('admin.articles.title')}*</label>
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
            <label htmlFor="body">{t('admin.articles.body')}*</label>
            <RichTextEditor
              className="reply-editor"
              value={form.body}
              onChange={(html) => {
                setForm((f) => ({ ...f, body: html }));
                markTouched('body');
              }}
            />
            {fieldError('body') && <div className="text-danger">{fieldError('body')}</div>}
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              />
              {t('admin.articles.published')}
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="time_published">{t('admin.articles.time_published')}</label>
            <input
              type="datetime-local"
              id="time_published"
              className="form-control"
              value={form.time_published}
              onChange={(e) => {
                setForm((f) => ({ ...f, time_published: e.target.value }));
                markTouched('time_published');
              }}
            />
            {fieldError('time_published') && (
              <div className="text-danger">{fieldError('time_published')}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="picture">{t('admin.articles.picture')}*</label>
            <input
              type="text"
              id="picture"
              className="form-control"
              required
              value={form.picture}
              onChange={(e) => {
                setForm((f) => ({ ...f, picture: e.target.value }));
                markTouched('picture');
              }}
            />
          </div>

          {!isNew && (
            <div className="form-group">
              <label>{t('admin.articles.files')}</label>
              {files.length > 0 ? (
                <ul>
                  {files.map((file) => (
                    <li key={file}>
                      {file}
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => setFileToDelete(file)}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => copyFileUrl(file)}
                      >
                        Copy URL
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No files</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const selected = e.target.files ? Array.from(e.target.files) : [];
                  if (selected.length > 0) {
                    uploadFilesMutation.mutate(selected);
                  }
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                className="btn btn-sm btn-success"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload File
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            disabled={saveMutation.isPending}
          >
            {isNew ? t('admin.articles.create') : t('admin.articles.save')}
          </button>
        </form>

        <Modal
          show={fileToDelete !== null}
          onClose={() => setFileToDelete(null)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setFileToDelete(null)}>
                {t('modal.yes-no.no')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleteFileMutation.isPending}
                onClick={() => {
                  if (fileToDelete) {
                    deleteFileMutation.mutate(fileToDelete);
                  }
                }}
              >
                {t('modal.yes-no.yes')}
              </button>
            </>
          }
        >
          <p>Delete file</p>
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
          <p>Failed to save article. Do you want to try again?</p>
        </Modal>
      </div>
    </div>
  );
}
