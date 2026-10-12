import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { achievementsGetSingle } from '../../api/client';
import { ROUTES } from '../../routes';
import './AchievementIcon.scss';

interface AchievementIconProps {
  achievementId: number;
}

/**
 * Small clickable achievement icon with a tooltip, linking to the
 * achievement detail page.
 */
export function AchievementIcon({ achievementId }: AchievementIconProps) {
  const { data: achievement } = useQuery({
    queryKey: ['achievement', achievementId],
    queryFn: () => achievementsGetSingle(achievementId).then((r) => r.achievement)
  });

  if (!achievement) {
    return null;
  }

  return (
    <Link href={`/${ROUTES.achievements}/${achievementId}`} className="achievement-icon" title={achievement.title}>
      <img src={achievement.picture} alt={achievement.title} />
    </Link>
  );
}
