import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from '../../hooks/useWindowSize';
import { useWaveDetails, type WaveDetails } from '../../hooks/useTasks';
import { storageDelete, storageGet, storageSet } from '../../utils/storage';
import { Modal } from '../shared/Modal';
import { Spinner } from '../shared/Spinner';
import { TasksGraph } from './TasksGraph';
import { Wave, type WaveView } from './Wave';
import { usePageTitle } from './usePageTitle';
import './PageTasks.scss';

const WAVE_OPENED_DEFAULT = true;
const WAVE_GRAPH_SPLIT_DEFAULT = false;

function useIsMobile(): boolean {
  return useWindowSize().width <= 900;
}

interface WaveWithOpened extends WaveDetails {
  opened: boolean;
}

/**
 * Tasks overview page: waves as accordions (linear or per-wave graph view)
 * or one graph with all tasks. Port of the Angular PageTasksComponent.
 */
export function PageTasks(): React.ReactElement {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { waves, isLoading } = useWaveDetails();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [splitWaves, setSplitWaves] = useState<boolean>(
    () => storageGet<boolean>('tasks/waves', 'split-waves', WAVE_GRAPH_SPLIT_DEFAULT) ?? WAVE_GRAPH_SPLIT_DEFAULT
  );
  const [openedWaves, setOpenedWaves] = useState<Record<number, boolean>>({});

  usePageTitle(t('tasks.title'));

  const viewMode: WaveView = isMobile ? 'linear' : splitWaves ? 'wave-graph' : 'graph';

  const nonEmptyWaves: WaveWithOpened[] = waves
    .filter((wave) => wave.tasks.length > 0)
    .map((wave) => ({
      ...wave,
      opened:
        openedWaves[wave.id] ??
        storageGet<boolean>(`tasks/waves/${wave.id}`, 'opened', WAVE_OPENED_DEFAULT) ??
        WAVE_OPENED_DEFAULT
    }));

  const allTasks = waves.flatMap((wave) => wave.tasks);

  const waveOpenChanged = (wave: WaveDetails, opened: boolean): void => {
    setOpenedWaves((prev) => ({ ...prev, [wave.id]: opened }));
    if (opened === WAVE_OPENED_DEFAULT) {
      storageDelete(`tasks/waves/${wave.id}`, 'opened');
    } else {
      storageSet(`tasks/waves/${wave.id}`, 'opened', opened);
    }
  };

  const splitWavesChanged = (value: boolean): void => {
    setSplitWaves(value);
    if (value === WAVE_GRAPH_SPLIT_DEFAULT) {
      storageDelete('tasks/waves', 'split-waves');
    } else {
      storageSet('tasks/waves', 'split-waves', value);
    }
  };

  return (
    <div className="page-tasks">
      {isLoading && <Spinner />}

      {viewMode !== 'graph' ? (
        <div className="waves accordion">
          {nonEmptyWaves.map((wave) => (
            <div className="card" key={wave.id}>
              <div className="card-header">
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => waveOpenChanged(wave, !wave.opened)}
                  aria-expanded={wave.opened}
                >
                  {wave.caption}
                </button>
              </div>
              {wave.opened && (
                <div className="card-body">
                  <Wave wave={wave} viewMode={viewMode} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="graph">
          <TasksGraph tasks={allTasks} />
        </div>
      )}

      <div className="settings-container">
        {!isMobile && (
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="btn btn-outline-primary settings"
            aria-label={t('tasks.settings.open-button')}
            title={t('tasks.settings.open-button')}
          >
            ?
          </button>
        )}
      </div>

      <Modal open={settingsOpen} title="tasks.settings.title" onClose={() => setSettingsOpen(false)}>
        <div className="settings-explanation">
          <h4>{t('tasks.settings.title')}</h4>
          <div className="custom-control custom-switch">
            <input
              type="checkbox"
              className="custom-control-input"
              id="tasks-settings-switch-view"
              checked={splitWaves}
              onChange={(event) => splitWavesChanged(event.target.checked)}
            />
            <label className="custom-control-label" htmlFor="tasks-settings-switch-view">
              {t('tasks.settings.split-waves')}
            </label>
          </div>
          <h4 className="head-explanation">{t('tasks.settings.explanation.title')}</h4>
          <h5>{t('tasks.settings.explanation.nodes')}</h5>

          <div className="nodes">
            {(
              [
                ['node-green.svg', 'tasks.settings.explanation.task.algo'],
                ['node-blue.svg', 'tasks.settings.explanation.task.programming'],
                ['node-red.svg', 'tasks.settings.explanation.task.special'],
                ['node-orange.svg', 'tasks.settings.explanation.task.theoretical'],
                ['node-bronze-unknown.svg', 'tasks.settings.explanation.task.surprise'],
                ['node-orange-blue.svg', 'tasks.settings.explanation.task.mixed'],
                ['node-big.svg', 'tasks.settings.explanation.task.large'],
                ['node-locked.svg', 'tasks.settings.explanation.task.locked'],
                ['node-done-icon.svg', 'tasks.settings.explanation.task.finished'],
                ['node-correcting-icon.svg', 'tasks.settings.explanation.task.correcting']
              ] as [string, string][]
            ).map(([img, label]) => (
              <div className="node" key={img}>
                <img alt="" src={`/assets/img/node-base/${img}`} className={`node-info${img === 'node-big.svg' ? ' big' : ''}`} />
                {t(label)}
              </div>
            ))}
          </div>

          <h5>{t('tasks.settings.explanation.edges.title')}</h5>
          <p>{t('tasks.settings.explanation.edges.text')}</p>
        </div>
      </Modal>
    </div>
  );
}
