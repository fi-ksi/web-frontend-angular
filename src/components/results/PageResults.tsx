import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useYear } from '../../hooks/useYear';
import { ROUTES } from '../../routes';
import { usersGetAll } from '../../api/client';
import type { components } from '../../api/schema';
import { AchievementIcon } from '../shared/AchievementIcon';
import { countPositions } from '../profile/profile-utils';
import './PageResults.scss';

type S = components['schemas'];

interface ResultsCategory {
  nameKey: string;
  users: S['User'][];
  isLoading: boolean;
}

/**
 * Results tables for the selected year: high-schoolers and others,
 * sorted by score with shared positions (1., 2.-4., ...).
 */
export function PageResults() {
  const { t } = useTranslation();
  const { selected } = useYear();
  const yearId = selected?.id;

  const highSchoolQuery = useQuery({
    queryKey: ['users', 'part-hs', yearId],
    queryFn: () => usersGetAll('part-hs', 'score', yearId).then((r) => r.users),
    enabled: yearId !== undefined
  });
  const otherQuery = useQuery({
    queryKey: ['users', 'part-other', yearId],
    queryFn: () => usersGetAll('part-other', 'score', yearId).then((r) => r.users),
    enabled: yearId !== undefined
  });

  const categories: ResultsCategory[] = [
    {
      nameKey: 'results.category.highschoolers',
      users: highSchoolQuery.data ?? [],
      isLoading: highSchoolQuery.isLoading
    },
    {
      nameKey: 'results.category.others',
      users: otherQuery.data ?? [],
      isLoading: otherQuery.isLoading
    }
  ];

  return (
    <div className="results-page">
    <main>
      <h2>{t('results.title')}</h2>

      {categories.map((category) => {
        const users = countPositions(category.users);
        return (
          <div className="category" key={category.nameKey}>
            <h3>{t(category.nameKey)}</h3>
            {category.isLoading && <div>…</div>}
            <table className="table table-striped results-table table-responsive-md">
              <thead>
                <tr>
                  <th scope="col" className="text-center">
                    {t('results.table.position')}
                  </th>
                  <th scope="col">{t('results.table.name')}</th>
                  <th scope="col">{t('results.table.trophies')}</th>
                  <th scope="col" className="text-center">
                    {t('results.table.score')}
                  </th>
                  <th scope="col" className="text-center">
                    {t('results.table.taskNum')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={user.successful ? 'successful' : undefined}>
                    <td className="text-center">{user.position}</td>
                    <td>
                      <Link href={`/${ROUTES.profile._}/${user.id}`}>
                        {user.first_name} {user.last_name}
                      </Link>
                    </td>
                    <td>
                      {user.achievements.map((ach) => (
                        <AchievementIcon key={ach} achievementId={ach} />
                      ))}
                    </td>
                    <td className="text-center">{user.score}</td>
                    <td className="text-center">{user.tasks_num}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </main>
    </div>
  );
}
