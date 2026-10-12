import React from 'react';
import './Spinner.scss';

/**
 * Loading spinner shown while data is being fetched. The parent decides
 * visibility from the react-query loading state (replaces the Angular
 * `source` observable input).
 */
export function Spinner({ show = true }: { show?: boolean }): React.ReactElement | null {
  if (!show) return null;
  return (
    <div className="ksi-spinner">
      <img src="/assets/img/karlik_color.png" alt="" />
    </div>
  );
}
