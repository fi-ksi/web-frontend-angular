import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { instanceConfigGetAll, instanceConfigSetSingle } from '../../api/client';
import type { components } from '../../api/schema';
import { Modal } from './shared/Modal';

type S = components['schemas'];

const CONFIG_QUERY_KEY = ['instanceConfig'];

/**
 * Admin page listing server instance config entries.
 * Each entry can be edited in a modal dialog.
 */
export function PageAdminInstanceConfig(): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editedConfig, setEditedConfig] = useState<S['AdminInstanceConfig'] | null>(null);
  const [editedValue, setEditedValue] = useState('');

  const { data: config } = useQuery({
    queryKey: CONFIG_QUERY_KEY,
    queryFn: () => instanceConfigGetAll().then((r) => r.config)
  });

  const saveMutation = useMutation({
    mutationFn: (entry: S['AdminInstanceConfig']) => instanceConfigSetSingle(entry),
    onSuccess: () => {
      setEditedConfig(null);
      void queryClient.invalidateQueries({ queryKey: CONFIG_QUERY_KEY });
    }
  });

  const openEdit = (entry: S['AdminInstanceConfig']): void => {
    setEditedConfig(entry);
    setEditedValue(entry.value ?? '');
  };

  return (
    <div className="content">
      <h2 className="title">{t('admin.instance-config.title')}</h2>

      <table className="table table-striped table-responsive-md tasks-table">
        <thead>
          <tr className="table-head-row">
            <th scope="col">{t('admin.instance-config.key')}</th>
            <th scope="col">{t('admin.instance-config.value')}</th>
            <th scope="col">{t('admin.instance-config.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {(config ?? []).map((entry) => (
            <tr key={entry.key}>
              <td>{entry.key}</td>
              <td>{entry.value ? <span>{entry.value}</span> : <i>{t('admin.instance-config.null-value')}</i>}</td>
              <td>
                <button className="btn btn-outline-primary" onClick={() => openEdit(entry)}>
                  {t('admin.instance-config.edit')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        show={editedConfig !== null}
        title={t('admin.instance-config.edit')}
        onClose={() => setEditedConfig(null)}
        footer={
          <button
            type="button"
            className="btn btn-primary"
            disabled={editedConfig === null || saveMutation.isPending}
            onClick={() => {
              if (editedConfig) {
                saveMutation.mutate({ key: editedConfig.key, value: editedValue });
              }
            }}
          >
            {t('admin.instance-config.save')}
          </button>
        }
      >
        {editedConfig && (
          <form className="form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="config-key">{t('admin.instance-config.key')}</label>
              <input type="text" className="form-control" id="config-key" name="key" value={editedConfig.key} disabled />
            </div>
            <div className="form-group">
              <label htmlFor="config-value">{t('admin.instance-config.value')}</label>
              <input
                type="text"
                className="form-control"
                id="config-value"
                name="value"
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
