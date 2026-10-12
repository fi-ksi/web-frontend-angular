import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { articlesDeleteSingle, articlesGetAll } from '../../api/client';
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
 * Admin list of articles. Port of PageAdminArticlesComponent.
 */
export function PageAdminArticles(): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const articlesQuery = useQuery({
    queryKey: ['admin', 'articles'],
    queryFn: async (): Promise<S['Article'][]> => {
      const resp = await articlesGetAll();
      return resp.articles;
    }
  });
  const articles = articlesQuery.data ?? [];

  const [articleToDelete, setArticleToDelete] = useState<S['Article'] | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (articleId: number) => articlesDeleteSingle(articleId),
    onSuccess: () => {
      setArticleToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    }
  });

  const editBase = `/${ROUTES.admin._}/${ROUTES.admin.articles._}`;
  const editHref = (articleId: number | string): string =>
    `${editBase}/${ROUTES.admin.articles.edit}/${articleId}`;

  return (
    <div className="content-container">
      <div className="content">
        <h2>{t('admin.articles.title')}</h2>
        <Link className="btn btn-ksi" href={editHref(0)}>
          {ICON_ADD} {t('admin.articles.new')}
        </Link>

        <table className="table table-striped table-hover table-responsive-md threads">
          <thead>
            <tr style={{ height: 45 }}>
              <th>{t('admin.articles.head.title')}</th>
              <th>{t('admin.articles.head.published_date')}</th>
              <th>{t('admin.articles.head.released')}</th>
              <th>{t('admin.articles.head.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td>
                  <Link href={editHref(article.id)}>{article.title}</Link>
                </td>
                <td>
                  {article.time_published ? new Date(article.time_published).toLocaleString('cs-CZ') : '---'}
                </td>
                <td>{article.published ? ICON_CHECKMARK : ICON_CROSS}</td>
                <td>
                  <Link className="btn btn-outline-primary" href={editHref(article.id)}>
                    {ICON_EDIT}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setArticleToDelete(article)}
                  >
                    {ICON_DELETE} {t('admin.articles.delete.btn')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Modal
          show={articleToDelete !== null}
          title={t('admin.articles.delete.btn')}
          onClose={() => setArticleToDelete(null)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setArticleToDelete(null)}>
                {t('modal.yes-no.no')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (articleToDelete) {
                    deleteMutation.mutate(articleToDelete.id);
                  }
                }}
              >
                {t('modal.yes-no.yes')}
              </button>
            </>
          }
        >
          <p>{t('admin.articles.delete.confirmation')}</p>
        </Modal>
      </div>
    </div>
  );
}
