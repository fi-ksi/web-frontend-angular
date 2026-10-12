import React, { useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { achievementsGetAll, adminAchievementsGrant, usersGetAll } from '../../api/client';
import type { components } from '../../api/schema';
import { ROUTES } from '../../routes';
import { useTranslation } from 'react-i18next';
import { ClickableUserName } from '../shared/ClickableUserName';
import { Modal } from './shared/Modal';

type S = components['schemas'];

const formatUser = (user: S['User']): string =>
  `${user.id} - ${user.first_name} ${user.last_name}`;

/**
 * Admin form for granting an achievement to users (optionally for a task).
 * Prefills from ?achievement=, ?users= (comma separated) and ?task= query params.
 */
export function PageAdminAchievementsGrant(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [achievement, setAchievement] = useState<string>(
    searchParams?.get('achievement') ?? ''
  );
  const [task, setTask] = useState<string>(searchParams?.get('task') ?? '');
  const [userIds, setUserIds] = useState<number[]>(() => {
    const raw = searchParams?.get('users');
    if (!raw) {
      return [];
    }
    return raw
      .split(',')
      .map((id) => Number.parseInt(id, 10))
      .filter((id) => !Number.isNaN(id));
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [grantErrors, setGrantErrors] = useState<string[]>([]);
  const [granted, setGranted] = useState(false);
  const [grantFailed, setGrantFailed] = useState(false);
  const userInputRef = useRef<HTMLInputElement>(null);

  const achievementsQuery = useQuery({
    queryKey: ['admin', 'achievements'],
    queryFn: async (): Promise<S['Achievement'][]> => {
      const resp = await achievementsGetAll();
      return resp.achievements;
    }
  });

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async (): Promise<S['User'][]> => {
      const resp = await usersGetAll();
      return resp.users;
    }
  });
  const users = usersQuery.data ?? [];

  const suggestions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term === '') {
      return [];
    }
    return users
      .filter((user) => formatUser(user).toLowerCase().includes(term))
      .slice(0, 10);
  }, [searchTerm, users]);

  const addUser = (user: S['User']): void => {
    if (!userIds.includes(user.id)) {
      setUserIds((ids) => [...ids, user.id]);
    }
    setSearchTerm('');
    userInputRef.current?.focus();
  };

  const removeUser = (userId: number): void => {
    setUserIds((ids) => ids.filter((id) => id !== userId));
  };

  const markTouched = (field: string): void =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // admin.achievements.achievement.required is missing from the i18n bundle;
  // admin.achievements.achievementId_required carries the same text.
  const errors: Record<string, string | null> = {
    achievement: achievement === '' ? t('admin.achievements.achievementId_required') : null,
    users: userIds.length === 0 ? 'Vyber aspoň jednoho uživatele.' : null,
    task: null
  };
  const isValid = Object.values(errors).every((e) => e === null);

  const grantMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const resp = await adminAchievementsGrant({
        users: userIds,
        task: task.trim() === '' ? null : Number(task),
        achievement: Number(achievement)
      });
      if (resp.errors && resp.errors.length > 0) {
        setGrantErrors(resp.errors);
        return;
      }
      setGrantErrors([]);
      setGranted(true);
    },
    onError: () => setGrantFailed(true)
  });

  const save = (e: React.FormEvent): void => {
    e.preventDefault();
    setTouched({ achievement: true, users: true, task: true });
    if (!isValid) {
      return;
    }
    grantMutation.mutate();
  };

  const fieldError = (field: string): string | null =>
    touched[field] ? errors[field] : null;

  const achievementsBase = `/${ROUTES.admin._}/${ROUTES.admin.achievements._}`;

  return (
    <div className="content-container">
      <div className="content">
        <h2>{t('admin.achievements.grant_title')}</h2>

        <form onSubmit={save}>
          <div className="form-group">
            <label htmlFor="achievement">{t('admin.achievements.achievementId')}</label>
            <select
              id="achievement"
              className="form-control"
              required
              value={achievement}
              onChange={(e) => {
                setAchievement(e.target.value);
                markTouched('achievement');
              }}
            >
              <option value=""></option>
              {(achievementsQuery.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
            {fieldError('achievement') && (
              <div className="text-danger">{fieldError('achievement')}</div>
            )}
          </div>

          <div className="users-group">
            <div className="form-group">
              <label htmlFor="user-search">{t('admin.achievements.userId')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="user-search"
                  ref={userInputRef}
                  type="text"
                  className="form-control"
                  autoComplete="off"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    markTouched('users');
                  }}
                />
              </div>
              {suggestions.length > 0 && (
                <ul className="list-group" style={{ marginTop: 4 }}>
                  {suggestions.map((user) => (
                    <li key={user.id} className="list-group-item">
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => addUser(user)}
                      >
                        {formatUser(user)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {fieldError('users') && <div className="text-danger">{fieldError('users')}</div>}
            </div>

            <div>
              <ul>
                {userIds.map((userId) => (
                  <li key={userId}>
                    <ClickableUserName userId={userId} /> ({userId})
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => removeUser(userId)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task">{t('admin.achievements.task')}</label>
            <input
              id="task"
              type="number"
              className="form-control"
              min={0}
              value={task}
              onChange={(e) => {
                setTask(e.target.value);
                markTouched('task');
              }}
            />
            {fieldError('task') && <div className="text-danger">{fieldError('task')}</div>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={grantMutation.isPending}>
            {t('admin.achievements.save')}
          </button>
        </form>

        <div className="alert alert-info" style={{ marginTop: 16 }}>
          <p>Zde udělíš trofej vybraným uživatelům.</p>
        </div>

        {grantErrors.length > 0 && (
          <div className="alert alert-danger">
            {grantErrors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        <Modal
          show={granted}
          onClose={() => setGranted(false)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setGranted(false)}>
                {t('modal.yes-no.no')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => router.push(achievementsBase)}
              >
                {t('modal.yes-no.yes')}
              </button>
            </>
          }
        >
          <p>Trofej byla úspěšně udělena 🎉. Chceš se vrátit na seznam trofejí?</p>
        </Modal>

        <Modal
          show={grantFailed}
          onClose={() => setGrantFailed(false)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => router.push(achievementsBase)}>
                {t('modal.yes-no.no')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setGrantFailed(false);
                  grantMutation.mutate();
                }}
              >
                {t('modal.yes-no.yes')}
              </button>
            </>
          }
        >
          <p>Udělení trofeje selhalo. Chceš to zkusit znovu?</p>
        </Modal>
      </div>
    </div>
  );
}
