import React from 'react';
import Link from 'next/link';
import type { components } from '../../api/schema';
import { ROUTES } from '../../routes';
import { formatKsiDate } from '../../utils/date';
import './ArticlePreview.scss';

type S = components['schemas'];

interface ArticlePreviewProps {
  article: S['Article'];
  clickable?: boolean;
}

/**
 * Article preview card; the whole card navigates to the article when
 * `clickable` is set.
 */
export function ArticlePreview({ article, clickable = false }: ArticlePreviewProps): React.ReactElement {
  const link = `/${ROUTES.news}/${article.id}`;

  return (
    <div
      className={`article-preview${clickable ? ' clickable' : ''}`}
      onClick={clickable ? () => { window.location.href = link; } : undefined}
    >
      <Link className="img" href={link} onClick={(e) => e.stopPropagation()}>
        <img src={article.picture} alt="" />
      </Link>
      <Link className="title" href={link} onClick={(e) => e.stopPropagation()}>{article.title}</Link>
      <span className="date">{formatKsiDate(article.time_published, 'short')}</span>
      <p className="body">{article.body}</p>
    </div>
  );
}
