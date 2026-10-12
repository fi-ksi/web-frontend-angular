import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { adminExecutionGetMultiple, usersGetAll } from '../../api/client';
import type { components } from '../../api/schema';
import { Modal } from './shared/Modal';
import { ExecReport } from './ExecReport';
import { ClickableUserName } from '../shared/ClickableUserName';
import { resolveUserId, userFormatter } from './execUserUtils';
import './PageAdminExec.scss';

type S = components['schemas'];

const PAGE_SIZE = 20;

/**
 * Admin page: browse code executions, filtered by module id and user.
 * The user field is a typeahead backed by the users list, which is loaded
 * once and shared through the react-query cache.
 */
export function PageAdminExec(): React.ReactElement {
  const { t } = useTranslation();

  const [moduleId, setModuleId] = useState('');
  const [moduleTouched, setModuleTouched] = useState(false);
  const [userText, setUserText] = useState('');
  const [pickedUser, setPickedUser] = useState<S['User'] | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userError, setUserError] = useState<'required' | 'notSelected' | null>(null);
  const [search, setSearch] = useState<{ userId: number; moduleId: number } | null>(null);
  const [page, setPage] = useState(1);
  const [selectedExec, setSelectedExec] = useState(-1);
  const [infoOpen, setInfoOpen] = useState(false);

  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => usersGetAll(),
    staleTime: 5 * 60_000
  });
  const users = usersData?.users ?? [];

  const suggestions = useMemo(() => {
    const term = userText.trim().toLowerCase();
    if (!term || pickedUser) {
      return [];
    }
    return users
      .filter(
        (user) =>
          userFormatter(user).toLowerCase().includes(term) ||
          (user.email ?? '').toLowerCase().includes(term)
      )
      .slice(0, 10);
  }, [userText, users, pickedUser]);

  const execsQuery = useQuery({
    queryKey: ['admin', 'execs', search?.userId, search?.moduleId, page],
    queryFn: async () => {
      if (search === null) {
        throw new Error('no search');
      }
      return adminExecutionGetMultiple(search.userId, search.moduleId, PAGE_SIZE, page - 1);
    },
    enabled: search !== null
  });

  const executions = execsQuery.data?.execs ?? [];
  const totalExecs = execsQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalExecs / PAGE_SIZE));
  const dataLoaded = search !== null && execsQuery.data !== undefined;

  const onUserInput = (text: string) => {
    setUserText(text);
    setPickedUser(null);
    setUserError(null);
    setDropdownOpen(true);
  };

  const pickUser = (user: S['User']) => {
    setPickedUser(user);
    setUserText(userFormatter(user));
    setUserError(null);
    setDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let ok = true;
    if (moduleId.trim() === '') {
      setModuleTouched(true);
      ok = false;
    }
    const userId = resolveUserId(pickedUser ?? userText, users);
    if (userId === null) {
      setUserError(userText.trim() === '' ? 'required' : 'notSelected');
      return;
    }
    setUserError(null);
    if (!ok) {
      return;
    }
    setSearch({ userId, moduleId: Number(moduleId) });
    setPage(1);
    setSelectedExec(-1);
  };

  const pageNumbers = useMemo(() => {
    const start = Math.max(1, Math.min(page - 3, totalPages - 6));
    const end = Math.min(totalPages, start + 6);
    const nums: number[] = [];
    for (let p = Math.max(1, end - 6); p <= end; p++) {
      nums.push(p);
    }
    return nums;
  }, [page, totalPages]);

  return (
    <div className="content-container">
      <div className="content">
        <h2>{t('admin.exec.title')}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="typeahead-module">{t('admin.exec.moduleId')}</label>
            <input
              id="typeahead-module"
              type="number"
              className="form-control"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              onBlur={() => setModuleTouched(true)}
            />
            {moduleTouched && moduleId.trim() === '' && (
              <div className="text-danger">{t('admin.exec.moduleId.required')}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="typeahead-user">{t('admin.exec.userId')}</label>
            <div className="typeahead-wrap">
              <input
                id="typeahead-user"
                type="text"
                className="form-control"
                value={userText}
                onChange={(e) => onUserInput(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                autoComplete="off"
              />
              {dropdownOpen && suggestions.length > 0 && (
                <div className="list-group typeahead-dropdown">
                  {suggestions.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="list-group-item list-group-item-action"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickUser(user)}
                    >
                      {userFormatter(user)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {userError && (
              <div className="text-danger">
                {t(userError === 'notSelected' ? 'admin.exec.user.notSelected' : 'admin.exec.user.required')}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary">{t('admin.exec.search')}</button>
        </form>

        {dataLoaded && executions.length === 0 && (
          <div style={{ marginTop: '20px' }} className="alert alert-danger">
            {t('admin.exec.noResults')}
          </div>
        )}

        {dataLoaded && executions.length !== 0 && (
          <div style={{ marginTop: '20px' }}>
            <div className="toright">
              <button
                type="button"
                className="btn btn-outline-primary settings"
                title={t('admin.exec.showInfo')}
                onClick={() => setInfoOpen(true)}
              >
                ?
              </button>
            </div>

            <table className="table table-striped table-hover table-responsive-md threads">
              <thead>
                <tr style={{ height: '45px' }}>
                  <th></th>
                  <th>{t('admin.exec.head.id')}</th>
                  <th>{t('admin.exec.head.time')}</th>
                  <th>{t('admin.exec.head.result')}</th>
                  <th>{t('admin.exec.head.module')}</th>
                  <th>{t('admin.exec.head.user')}</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((exec) => (
                  <React.Fragment key={exec.id}>
                    <tr>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => setSelectedExec(selectedExec === exec.id ? -1 : exec.id)}
                        >
                          {selectedExec === exec.id ? 'V' : '>'}
                        </button>
                      </td>
                      <td>{exec.id}</td>
                      <td>{new Date(exec.time).toLocaleString('cs-CZ', { dateStyle: 'medium', timeStyle: 'medium' })}</td>
                      <td>{exec.result}</td>
                      <td>{exec.module}</td>
                      <td><ClickableUserName userId={exec.user} /></td>
                    </tr>
                    {selectedExec === exec.id && (
                      <tr>
                        <td colSpan={7}>
                          <div className="info">
                            <ExecReport code={exec.code} report={exec.report} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="toright">
                <nav aria-label="Default pagination">
                  <ul className="pagination">
                    <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                      <button type="button" className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>
                        &laquo;
                      </button>
                    </li>
                    {pageNumbers.map((p) => (
                      <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
                        <button type="button" className="page-link" onClick={() => setPage(p)}>
                          {p}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
                      <button type="button" className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                        &raquo;
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal show={infoOpen} title="Info" onClose={() => setInfoOpen(false)}>
        <p>
          Stav <i>error</i> značí, že při spouštění kódu došlo k&nbsp;chybě v&nbsp;některém z&nbsp;organizátorksých
          skriptů. Stav <i>ok</i> značí, že k&nbsp;chybě nedošlo. Při spouštění se nespouští <i>eval</i> skript,
          takže se nekontroluje, zda-li byl řešitelův program správně. Výsledek by tedy měl být v&nbsp;hotovém
          modulu vždy <i>ok</i>.
        </p>
      </Modal>
    </div>
  );
}
