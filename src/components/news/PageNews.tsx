import React from 'react';
import { useTranslation } from 'react-i18next';
import { useArticles } from '../../hooks/useNews';
import { ArticlePreview } from '../shared/ArticlePreview';
import { Spinner } from '../shared/Spinner';

/**
 * News listing: all article previews of the selected year.
 */
export function PageNews(): React.ReactElement {
  const { t } = useTranslation();
  const { articles, isLoading } = useArticles();

  return (
    <div className="page-news">
      <h2 className="title">{t('news.title')}</h2>
      <Spinner show={isLoading} />
      <div className="preview">
        {articles.map((article) => (
          <ArticlePreview key={article.id} article={article} clickable />
        ))}
      </div>
    </div>
  );
}
