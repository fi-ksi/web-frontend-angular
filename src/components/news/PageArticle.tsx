import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { articlesGetSingle } from '../../api/client';
import { Spinner } from '../shared/Spinner';
import { formatKsiDate } from '../../utils/date';
import { parseLegacyAssetsUrl } from '../../utils/utils';

/**
 * Single article page, rendered from the :id route param.
 */
export function PageArticle(): React.ReactElement {
  const params = useParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const articleId = Number(idParam);

  const articleQuery = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const response = await articlesGetSingle(articleId);
      return {
        ...response,
        article: { ...response.article, picture: parseLegacyAssetsUrl(response.article.picture) }
      };
    },
    enabled: Number.isFinite(articleId),
    staleTime: 60_000
  });

  const article = articleQuery.data?.article;

  return (
    <div className="page-article">
      <Spinner show={articleQuery.isLoading} />
      {article && (
        <div className="article">
          <div className="header">
            <img src={article.picture} alt="" />
            <h2>{article.title}</h2>
          </div>
          <div className="content">
            <span className="date">{formatKsiDate(article.time_published)}</span>
            <article className="text" dangerouslySetInnerHTML={{ __html: article.body }} />
          </div>
        </div>
      )}
    </div>
  );
}
