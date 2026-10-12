import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersDeleteSingle, usersGetAll } from '../../api/client';
import type { components } from '../../api/schema';
import { ROUTES } from '../../routes';
import { Modal } from './shared/Modal';
import { ClickableUserName } from '../shared/ClickableUserName';
import { AchievementIcon } from '../shared/AchievementIcon';

type S = components['schemas'];

const ALL_ROLES: S['UserRole'][] = ['admin', 'org', 'tester', 'participant', 'participant_hidden'];

const titleCase = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/**
 * Admin users page: text filter + role checkboxes + table of users with
 * grant-achievement links and deletion.
 */
export function PageAdminUsers(): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [textFilter, setTextFilter] = useState('');
  const [allowedRoles, setAllowedRoles] = useState<S['UserRole'][]>(ALL_ROLES);
  const [deleteTarget, setDeleteTarget] = useState<S['User'] | null>(null);

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => usersGetAll(),
    staleTime: 5 * 60_000
  });
  const users = usersQuery.data?.users ?? [];

  const filteredUsers = useMemo(() => {
    const filterValue = textFilter.toLowerCase();
    return users.filter(
      (user) =>
        allowedRoles.includes(user.role) &&
        (user.first_name.toLowerCase().startsWith(filterValue) ||
          user.last_name.toLowerCase().startsWith(filterValue) ||
          (user.nick_name && user.nick_name.toLowerCase().startsWith(filterValue)) ||
          (user.email && user.email.toLowerCase().startsWith(filterValue)))
    );
  }, [users, textFilter, allowedRoles]);

  const toggleRole = (role: S['UserRole'], checked: boolean) => {
    setAllowedRoles((roles) =>
      checked ? [...roles, role] : roles.filter((r) => r !== role)
    );
  };

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => usersDeleteSingle(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onSettled: () => setDeleteTarget(null)
  });

  return (
    <div className="content-container">
      <div className="content">
        <h2>{t('admin.users.title')}</h2>

        <form>
          <div className="form-group">
            <label htmlFor="text_filter">{t('admin.users.filter.label')}</label>
            <input
              type="text"
              id="text_filter"
              className="form-control"
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              placeholder={t('admin.users.filter.placeholder')}
            />
          </div>

          <div className="row">
            {ALL_ROLES.map((role) => (
              <div key={role} className="form-group form-check" style={{ marginLeft: '18px' }}>
                <input
                  type="checkbox"
                  id={`include_${role}`}
                  className="form-check-input"
                  checked={allowedRoles.includes(role)}
                  onChange={(e) => toggleRole(role, e.target.checked)}
                />
                <label htmlFor={`include_${role}`} className="form-check-label">
                  {titleCase(role)}
                </label>
              </div>
            ))}
          </div>
        </form>

        <table className="table table-striped table-hover table-responsive-md threads">
          <thead>
            <tr style={{ height: '45px' }}>
              <th>{t('admin.users.table.id')}</th>
              <th>{t('admin.users.table.role')}</th>
              <th>{t('admin.users.table.name')}</th>
              <th>{t('admin.users.table.email')}</th>
              <th>{t('admin.users.table.score')}</th>
              <th>{t('admin.users.table.achievements')}</th>
              <th>{t('admin.users.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{titleCase(user.role)}</td>
                <td>
                  <ClickableUserName userId={user.id} />
                </td>
                <td>{user.email}</td>
                <td>{user.score}</td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {user.achievements.map((achievementId) => (
                      <AchievementIcon key={achievementId} achievementId={achievementId} />
                    ))}
                  </div>
                </td>
                <td>
                  <Link
                    className="btn btn-outline-primary"
                    href={`/${ROUTES.admin._}/${ROUTES.admin.achievements._}/${ROUTES.admin.achievements.grant}?users=${user.id}`}
                  >
                    {t('admin.users.table.grant_achievement')}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setDeleteTarget(user)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        show={deleteTarget !== null}
        title={t('modal.yes-no.title')}
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-ksi yes"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {t('modal.yes-no.yes')}
            </button>
            <button type="button" className="btn btn-ksi no" onClick={() => setDeleteTarget(null)}>
              {t('modal.yes-no.no')}
            </button>
          </>
        }
      >
        <p className="question">{t('admin.shared.delete-confirmation')}</p>
      </Modal>
    </div>
  );
}
