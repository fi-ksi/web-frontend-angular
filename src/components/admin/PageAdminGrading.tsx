import React from 'react';

const OLD_FRONTEND_URL = process.env.NEXT_PUBLIC_OLD_FRONTEND_URL || 'https://kyzikos.fi.muni.cz/';

/**
 * Grading page placeholder. The real grading UI still lives in the old
 * frontend, so this page just links there (mirrors the Angular placeholder).
 */
export function PageAdminGrading(): React.ReactElement {
  return (
    <div className="content-container">
      <div className="content">
        <h2>Opravování (🛠🐧)</h2>

        <div className="alert alert-warning">
          <p>🛠🐧 Work in progress...</p>
          <p>
            Please use{' '}
            <a
              className="nav-btn"
              href={`${OLD_FRONTEND_URL}/admin/opravovani`}
              target="_blank"
              rel="noreferrer"
            >
              old frontend
            </a>{' '}
            for grading.
          </p>
        </div>
      </div>
    </div>
  );
}
