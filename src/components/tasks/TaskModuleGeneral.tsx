import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  modulesGetSingle,
  modulesSubmitFilesForm,
  subFilesDeleteSingle,
  submFilesGetSingle
} from '../../api/client';
import type { components } from '../../api/schema';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import './TaskModuleGeneral.scss';

type S = components['schemas'];
type SubmittedFile = S['ModuleGeneral']['submitted_files'][number];

const MAX_UPLOAD_SIZE_MB = 20;
const MAX_UPLOAD_FILES = 20;

/**
 * General module: file upload/download/delete.
 * Port of the Angular TaskModuleGeneralComponent.
 *
 * Note: the fetch-based API client reports no upload progress events,
 * so the progress bar from the Angular version is replaced by a simple
 * "uploading" indicator.
 */
export function TaskModuleGeneral({ module }: { module: S['ModuleGeneral'] }): React.ReactElement {
  const { t } = useTranslation();
  const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>([...module.submitted_files]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<File | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<SubmittedFile | null>(null);
  const fileSelectorRef = useRef<HTMLInputElement>(null);
  const uploadQueueRef = useRef<File[]>([]);

  const refreshSubmittedFiles = useCallback(async () => {
    const refreshed = (await modulesGetSingle(module.id)).module as S['ModuleGeneral'];
    setSubmittedFiles(refreshed.submitted_files);
  }, [module.id]);

  useEffect(() => {
    checkUploadAllowed(submittedFiles, filesToUpload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submittedFiles, filesToUpload]);

  function checkUploadAllowed(submitted: SubmittedFile[], toUpload: File[]): void {
    if (submitted.length + toUpload.length > MAX_UPLOAD_FILES) {
      setError(t('tasks.module.general.too-many-files', { count: MAX_UPLOAD_FILES }));
      return;
    }
    for (const file of toUpload) {
      if (file.size >= MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
        setError(t('tasks.module.general.size-to-large', { size: MAX_UPLOAD_SIZE_MB }));
        return;
      }
    }
    setError(null);
  }

  const uploadNext = useCallback(async (): Promise<void> => {
    const file = uploadQueueRef.current.pop();
    if (!file) {
      return;
    }
    setUploading(file);
    try {
      const response = await modulesSubmitFilesForm(file, module.id);
      if (response.result === 'ok') {
        await refreshSubmittedFiles();
      }
    } finally {
      setUploading(null);
      setFilesToUpload((prev) => prev.filter((f) => f !== file));
      void uploadNext();
    }
  }, [module.id, refreshSubmittedFiles]);

  const upload = useCallback(() => {
    if (uploading || filesToUpload.length === 0) {
      return;
    }
    uploadQueueRef.current = [...filesToUpload].reverse();
    void uploadNext();
  }, [uploading, filesToUpload, uploadNext]);

  const filesSelected = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }
    setFilesToUpload((prev) => [...prev, ...Array.from(files)]);
    event.target.value = '';
  };

  const cancelUpload = (file: File): void => {
    setFilesToUpload((prev) => prev.filter((x) => x !== file));
  };

  const deleteFile = async (file: SubmittedFile): Promise<void> => {
    await subFilesDeleteSingle(file.id);
    await refreshSubmittedFiles();
  };

  const downloadFile = async (file: SubmittedFile): Promise<void> => {
    const blob = await submFilesGetSingle(file.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  return (
    <div className="task-module-general">
      {submittedFiles.length > 0 && (
        <>
          <h6>{t('tasks.module.general.submitted-files')}</h6>
          <ul>
            {submittedFiles.map((file) => (
              <li key={file.id}>
                <code>{file.filename}</code>
                {' - '}
                <a className="clickable" onClick={() => void downloadFile(file)}>
                  {t('tasks.module.general.download')}
                </a>
                {', '}
                <a className="clickable" onClick={() => setDeleteCandidate(file)}>
                  {t('tasks.module.general.delete')}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {filesToUpload.length > 0 && (
        <>
          <h6>{t('tasks.module.general.to-upload')}</h6>
          <ul>
            {filesToUpload.map((file, index) => (
              <li key={`${file.name}-${index}`}>
                <code>{file.name}</code>
                {' - '}
                <a className="clickable" onClick={() => cancelUpload(file)}>
                  {t('tasks.module.general.delete')}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {uploading && (
        <>
          <h6>{t('tasks.module.general.uploading')}</h6>
          <ul>
            <li>
              <code>{uploading.name}</code>
            </li>
          </ul>
        </>
      )}

      <input
        ref={fileSelectorRef}
        style={{ display: 'none' }}
        type="file"
        multiple
        onChange={filesSelected}
      />

      <div className="buttons">
        <button type="button" className="btn btn-ksi" disabled={!!error} onClick={() => fileSelectorRef.current?.click()}>
          {t('tasks.module.general.select-file')}
        </button>
        <button
          type="button"
          className="btn btn-ksi"
          disabled={!!uploading || !!error || filesToUpload.length === 0}
          onClick={upload}
        >
          {t('tasks.module.general.upload')}
        </button>
      </div>

      <ConfirmDialog
        open={deleteCandidate !== null}
        onClose={() => setDeleteCandidate(null)}
        onAnswer={(answer) => {
          if (answer && deleteCandidate) {
            void deleteFile(deleteCandidate);
          }
        }}
        question="tasks.module.general.delete-confirm"
      />
    </div>
  );
}
