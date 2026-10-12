import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useYear } from '../../hooks/useYear';
import { ROUTES } from '../../routes';
import { achievementsGetAll, achievementsGetSingle } from '../../api/client';
import './PageAchievements.scss';

/**
 * Achievements grid for the selected year, or a single achievement when the
 * :id param is present.
 */
export function PageAchievements() {
  const params = useParams();
  const rawId = params.id;
  const achievementId = typeof rawId === 'string' ? Number(rawId) : null;
  const { t } = useTranslation();
  const { selected } = useYear();
  const yearId = selected?.id;

  const allQuery = useQuery({
    queryKey: ['achievements', yearId],
    queryFn: () => achievementsGetAll(20, 0, undefined, yearId).then((r) => r.achievements),
    enabled: achievementId === null && yearId !== undefined
  });
  const singleQuery = useQuery({
    queryKey: ['achievement', achievementId],
    queryFn: () => achievementsGetSingle(achievementId as number).then((r) => [r.achievement]),
    enabled: achievementId !== null
  });

  const achievements = achievementId === null ? allQuery.data ?? [] : singleQuery.data ?? [];

  return (
    <div className="achievements-page">
      <div className="content">
        <h1>{t('achievements.title')}</h1>
        {(allQuery.isLoading || singleQuery.isLoading) && <div>…</div>}
        <div className="achievements">
          {achievements.map((achievement) => (
            <Link
              key={achievement.id}
              href={`/${ROUTES.achievements}/${achievement.id}`}
              className="achievement"
            >
              <img src={achievement.picture} className="icon" alt="" />
              <span className="name">{achievement.title}</span>
              <p className="description" dangerouslySetInnerHTML={{ __html: achievement.description ?? '' }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
