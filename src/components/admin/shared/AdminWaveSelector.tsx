import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { wavesGetAll } from '../../../api/client';

interface AdminWaveSelectorProps {
  /** Currently selected wave id, or null when none is selected. */
  value: number | null;
  onChange: (waveId: number | null) => void;
  /** When true, an "all waves" option (value -1, reported as null) is offered. */
  allowAll?: boolean;
}

/**
 * Wave picker for admin pages. Controlled component: the parent owns the
 * selected wave id and receives changes through onChange.
 */
export function AdminWaveSelector({ value, onChange, allowAll = true }: AdminWaveSelectorProps): React.ReactElement {
  const { t } = useTranslation();
  const { data: waves } = useQuery({
    queryKey: ['waves'],
    queryFn: () => wavesGetAll().then((r) => r.waves)
  });

  useEffect(() => {
    if (!allowAll && value === null && waves && waves.length > 0) {
      onChange(waves[0].id);
    }
  }, [allowAll, value, waves, onChange]);

  return (
    <div className="wave-selection">
      <span className="form-label">{t('admin.tasks.wave-selection.caption')}</span>
      <select
        className="form-control"
        value={value === null ? -1 : value}
        onChange={(e) => {
          const waveId = Number(e.target.value);
          onChange(waveId === -1 ? null : waveId);
        }}
      >
        {(waves ?? []).map((wave) => (
          <option key={wave.id} value={wave.id}>
            {wave.caption}
          </option>
        ))}
        {allowAll && <option value={-1}>{t('admin.tasks.wave-selection.all')}</option>}
      </select>
    </div>
  );
}
