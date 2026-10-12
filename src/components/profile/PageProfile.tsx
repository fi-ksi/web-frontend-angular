import { useMemo, useRef, useState } from 'react';
import { redirect, useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import { useYear } from '../../hooks/useYear';
import { ROUTES } from '../../routes';
import {
  adminAchievementsGrant,
  adminDiplomaGrantForm,
  achievementsGetSuccessful,
  diplomasListForUserSingle,
  profileGetMy,
  profileGetSingle,
  tasksGetAll,
  usersGetSingle,
  wavesGetAll
} from '../../api/client';
import type { components } from '../../api/schema';
import { COUNTRIES } from '../../utils/countries';
import { AchievementIcon } from '../shared/AchievementIcon';
import { ProfileTaskThumbnail } from './ProfileTaskThumbnail';
import {
  generatePrediction,
  generateProgressBar,
  getFullName,
  getProfilePictureUrl,
  genderKey,
  mergeSimilarWaves,
  translateRole,
  translateSkillLevel,
  type TaskScoreRef
} from './profile-utils';
import './PageProfile.scss';

type S = components['schemas'];

const ICON = {
  EMAIL: '🖃',
  DISCORD: '💬',
  SCHOOL: '🎓',
  LOCATION: '🖈'
};

export type ProfileUser = S['User'] & {
  isAdmin: boolean;
  isOrg: boolean;
  fullName: string;
  profilePicture: string;
  seasonsString: string;
};

function decorateUser(user: S['User']): ProfileUser {
  const isAdmin = user.role === 'admin';
  const isOrg = isAdmin || user.role === 'org';
  return {
    ...user,
    isAdmin,
    isOrg,
    fullName: getFullName(user),
    profilePicture: getProfilePictureUrl(user, isOrg),
    seasonsString: user.seasons ? user.seasons.map((x) => `${x}.`).join(', ') : ''
  };
}

function ProgressBars({ bars }: { bars: { type: string; value: number; max: number; label: string }[] }) {
  return (
    <div className="progress" style={{ height: '1.5rem' }}>
      {bars.map((bar, i) => (
        <div
          key={i}
          className={`progress-bar progress-bar-striped bg-${bar.type}`}
          role="progressbar"
          style={{ width: `${bar.value}%` }}
          aria-valuenow={bar.value}
          aria-valuemin={0}
          aria-valuemax={bar.max}
        >
          {bar.label}
        </div>
      ))}
    </div>
  );
}

/**
 * Public profile page: user header, trophies, stats with progress bars,
 * prediction and the user's tasks. Also handles the bare /profil URL by
 * redirecting to the logged-in user's profile.
 */
export function PageProfile() {
  const params = useParams();
  const rawId = params.id;
  const router = useRouter();
  const { user: loggedUser, isLoggedIn } = useAuth();
  const { selectedFull: year } = useYear();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const yearId = year?.id;

  const idParam = typeof rawId === 'string' ? Number(rawId) : NaN;
  const userId = !isNaN(idParam) && rawId !== undefined ? idParam : undefined;

  const userQuery = useQuery({
    queryKey: ['user', userId, yearId],
    queryFn: () => usersGetSingle(userId as number, yearId).then((r) => decorateUser(r.user)),
    enabled: userId !== undefined && yearId !== undefined
  });
  const user = userQuery.data;

  const viewerIsOrg = loggedUser ? loggedUser.role === 'admin' || loggedUser.role === 'org' : false;
  const canSeeProfile = user ? user.id === loggedUser?.id || viewerIsOrg : false;

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id, yearId, viewerIsOrg],
    queryFn: () => (viewerIsOrg ? profileGetSingle(user!.id, yearId) : profileGetMy(yearId)),
    enabled: !!user && canSeeProfile && yearId !== undefined
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks', yearId],
    queryFn: () => tasksGetAll(yearId).then((r) => r.tasks),
    enabled: yearId !== undefined
  });
  const allTasks = tasksQuery.data ?? [];

  const wavesQuery = useQuery({
    queryKey: ['waves', yearId],
    queryFn: () => wavesGetAll(yearId).then((r) => r.waves),
    enabled: yearId !== undefined
  });
  const waves = wavesQuery.data ?? [];

  const successfulQuery = useQuery({
    queryKey: ['achievement', 'successful'],
    queryFn: () => achievementsGetSuccessful().then((r) => r.achievement),
    enabled: !!user?.successful && !user?.isOrg
  });
  const hasSuccessfulTrophy = successfulQuery.data ? user!.achievements.includes(successfulQuery.data.id) : false;

  const grantMutation = useMutation({
    mutationFn: (achievementId: number) =>
      adminAchievementsGrant({ users: [user!.id], achievement: achievementId, task: null }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', userId, yearId] });
    }
  });

  const diplomasQuery = useQuery({
    queryKey: ['diplomas', user?.id],
    queryFn: () => diplomasListForUserSingle(user!.id).then((r) => r.diplomas),
    enabled: !!user
  });
  const diplomaForYear = diplomasQuery.data?.find((d) => d.year === yearId);

  const [diplomaUrl, setDiplomaUrl] = useState<string | null>(null);
  const [diplomaUploading, setDiplomaUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tasksWithScore: TaskScoreRef[] = useMemo(() => {
    if (!user) {
      return [];
    }
    if (user.isOrg) {
      return (user.tasks ?? []).map((id) => ({ id }));
    }
    const profile = profileQuery.data;
    if (!profile) {
      return [];
    }
    return profile.taskScores.map((score) => ({ id: score.task, score: score.score }));
  }, [user, profileQuery.data]);

  const userProgress = useMemo(() => {
    if (!user || !year) {
      return [];
    }
    const maxPoints = Math.max(year.sum_points || 0, year.point_pad || 0);
    const yearProgress = {
      title: t('profile.stats.whole-year'),
      tasksSolved: user.tasks_num,
      score: user.score,
      bars: generateProgressBar(user.score, maxPoints)
    };
    if (tasksWithScore.length === 0 || waves.length === 0) {
      return [yearProgress];
    }
    const extendedWaves = mergeSimilarWaves(waves);
    const waveMap: { [waveId: number]: number } = {};
    const waveScore: { [waveId: number]: { title: string; max: number; current: number; solved: number } } = {};
    extendedWaves.forEach((wave) => {
      waveScore[wave.id] = { title: wave.caption ?? '', max: wave.sum_points, current: 0, solved: 0 };
      waveMap[wave.id] = wave.id;
      wave.mergedWaveIds?.forEach((waveId2) => {
        waveMap[waveId2] = wave.id;
      });
    });
    const taskScoresById: { [taskId: number]: number } = {};
    tasksWithScore.forEach((taskScore) => {
      taskScoresById[taskScore.id] = taskScore.score ?? 0;
    });
    const tasksById = new Map(allTasks.map((task) => [task.id, task]));
    tasksWithScore.forEach((taskScore) => {
      const task = tasksById.get(taskScore.id);
      if (!task) {
        return;
      }
      const scoreKey = waveMap[task.wave];
      if (scoreKey in waveScore) {
        waveScore[scoreKey].current += taskScoresById[task.id];
        if (task.state === 'done') {
          waveScore[scoreKey].solved += 1;
        }
      }
    });
    const wavesProgress = Object.keys(waveScore)
      .map((waveId) => {
        const wave = waveScore[Number(waveId)];
        return {
          title: wave.title,
          score: Math.round(10 * wave.current) / 10,
          tasksSolved: wave.solved,
          bars: generateProgressBar(wave.current, wave.max)
        };
      })
      .filter((wave) => wave.tasksSolved > 0);
    return [yearProgress, ...wavesProgress];
  }, [user, year, tasksWithScore, waves, allTasks, t]);

  const prediction = useMemo(() => {
    if (!user || !year || userProgress.length === 0) {
      return null;
    }
    const maxPoints = Math.max(year.sum_points || 0, year.point_pad || 0);
    const p = generatePrediction(allTasks, tasksWithScore, userProgress[0].score, maxPoints);
    if (p?.doable && user.cheat) {
      p.doable = false;
    }
    return p;
  }, [user, year, userProgress, allTasks, tasksWithScore]);

  const uploadDiploma = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);
    event.target.value = '';
    if (!file || !user) {
      return;
    }
    if (!window.confirm(t('profile.diploma.grant.confirmation'))) {
      return;
    }
    setDiplomaUploading(true);
    try {
      await adminDiplomaGrantForm(file, user.id, yearId);
      await queryClient.invalidateQueries({ queryKey: ['diplomas', user.id] });
    } finally {
      setDiplomaUploading(false);
    }
  };

  if (userId === undefined) {
    if (loggedUser) {
      router.replace(`/${ROUTES.profile._}/${loggedUser.id}`);
      return null;
    }
    if (!isLoggedIn && loggedUser === null) {
      redirect('/403');
    }
    return <div className="content">…</div>;
  }

  if (userQuery.isLoading || !user) {
    return <div className="content">…</div>;
  }

  const g = genderKey(user.gender);

  return (
    <div className="content">
      <div className="left-panel">
        <img className="picture" src={user.profilePicture} alt="" />
        <span className="info">
          <span className="name text-uppercase">{user.fullName}</span>
          <span className="role" title={`${t(`profile.seasons.${g}`)}: ${user.seasonsString}`}>
            <span className="text-capitalize">{translateSkillLevel(user, t)}</span> <span>{translateRole(user, t)}</span>
            {viewerIsOrg && <span> ({user.role})</span>}
          </span>
        </span>

        {loggedUser?.role === 'admin' && !hasSuccessfulTrophy && !user.isOrg && !user.cheat && user.successful && (
          <div className="grant-successful">
            <button
              className="btn btn-ksi w-100"
              disabled={grantMutation.isPending}
              onClick={() => successfulQuery.data && grantMutation.mutate(successfulQuery.data.id)}
            >
              {t('profile.grant-successful-trophy.button')}
            </button>
          </div>
        )}

        {user.successful && !user.isOrg && (
          <div className="diploma">
            {diplomaForYear ? (
              <button className="btn btn-ksi w-100" onClick={() => setDiplomaUrl(diplomaForYear.url)}>
                {t('profile.diploma.show')}
              </button>
            ) : (
              loggedUser?.role === 'admin' && (
                <>
                  <input
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    type="file"
                    multiple={false}
                    onChange={uploadDiploma}
                  />
                  <button
                    className="btn btn-ksi w-100"
                    disabled={diplomaUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('profile.diploma.grant.button')}
                  </button>
                </>
              )
            )}
          </div>
        )}

        <div className="contact">
          <table className="contact table table-borderless">
            <tbody>
              {user.email && (
                <tr>
                  <th scope="col">{ICON.EMAIL}</th>
                  <td>
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </td>
                </tr>
              )}
              {user.discord && (
                <tr>
                  <th scope="col">{ICON.DISCORD}</th>
                  <td>{user.discord}</td>
                </tr>
              )}
              {!user.isOrg && (
                <>
                  <tr>
                    <th scope="col">{ICON.SCHOOL}</th>
                    <td>{user.school_name}</td>
                  </tr>
                  {user.addr_country && (
                    <tr>
                      <th scope="col">{ICON.LOCATION}</th>
                      <td>{COUNTRIES[user.addr_country] || COUNTRIES[user.addr_country.toUpperCase()] || user.addr_country}</td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="right-panel">
        {user.achievements.length > 0 && (
          <>
            <h3>{t('profile.trophies')}</h3>
            <div className="trophies">
              {user.achievements.map((ach) => (
                <AchievementIcon key={ach} achievementId={ach} />
              ))}
            </div>
          </>
        )}

        {!user.isOrg && (
          <>
            <h3>{t('profile.stats.title')}</h3>
            {user.cheat && <div className="alert alert-danger alert-cheat">{t('profile.stats.cheat')}</div>}
            {userProgress.map((stats, i) => (
              <div className="stats" key={i}>
                <h4 className="title">{stats.title}</h4>
                {i === 0 && prediction && (
                  <h5 className="prediction">
                    {user.successful ? (
                      <span className="text-success">{t(`profile.stats.prediction.positive.${g}`)}</span>
                    ) : prediction.doable ? (
                      <span>{t('profile.stats.prediction.normal', { percent: prediction.percentFromTotalNeeded })}</span>
                    ) : (
                      <span>{t(`profile.stats.prediction.negative.${g}`)}</span>
                    )}
                  </h5>
                )}
                <div className="numeric">
                  <div>
                    <span className="name">{t('profile.stats.score')}:</span> {stats.score}
                  </div>
                  <div>
                    <span className="name">{t('profile.stats.solved-count')}:</span> {stats.tasksSolved}
                  </div>
                </div>
                <ProgressBars bars={stats.bars} />
              </div>
            ))}
          </>
        )}

        <div>
          <h3>{t(`profile.tasks.${user.isOrg ? 'author' : 'participant'}.${g}`)}</h3>
          {tasksWithScore.length > 0 ? (
            <div className="tasks">
              {tasksWithScore.map((task) => (
                <ProfileTaskThumbnail key={task.id} taskId={task.id} score={task.score} />
              ))}
            </div>
          ) : (
            <div className="tasks empty">{t('profile.tasks.no-yet', { name: user.first_name })}</div>
          )}
        </div>
      </div>

      {diplomaUrl && (
        <div className="modal show d-block" tabIndex={-1} role="dialog" onClick={() => setDiplomaUrl(null)}>
          <div className="modal-dialog modal-full-width modal-full-height" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t('profile.diploma.modal.title')}</h5>
                <button type="button" className="close" onClick={() => setDiplomaUrl(null)} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body modal-diploma">
                <a href={diplomaUrl} download="diploma.pdf">
                  {t('profile.diploma.modal.download')}
                </a>
                <embed className="pdf" src={diplomaUrl} type="application/pdf" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
