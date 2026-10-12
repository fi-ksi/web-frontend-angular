import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import type { components } from '../../api/schema';
import { modulesSubmitSingle } from '../../api/client';
import { postJsonWithProgress } from '../../api/progressUpload';

type S = components['schemas'];

/**
 * POSTs a module submission as a JSON body to /modules/{id}/submit,
 * reporting upload progress through XHR (0..1 fractions).
 */
export async function submitModule(
  moduleId: number,
  content: S['ModuleSubmissionData'],
  onProgress?: (fraction: number) => void
): Promise<S['ModuleSubmitResponse']> {
  if (onProgress) {
    return postJsonWithProgress<S['ModuleSubmitResponse']>(`/modules/${moduleId}/submit`, { content }, onProgress);
  }
  return modulesSubmitSingle(moduleId, { content });
}

export interface ModuleStatusEvent {
  moduleId: number;
  /** null clears the last shown status */
  result: S['ModuleSubmitResponse'] | null;
}

type StatusListener = (event: ModuleStatusEvent) => void;

const listeners = new Set<StatusListener>();

/**
 * Tiny event bus replacing the Angular ModuleService's moduleResultSubject.
 * Fires whenever a module gets a new submit status (or it is hidden).
 */
export function publishModuleStatus(event: ModuleStatusEvent): void {
  listeners.forEach((listener) => listener(event));
}

export function subscribeModuleStatus(listener: StatusListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export interface ModuleSubmit {
  status: S['ModuleSubmitResponse'] | null;
  submitting: boolean;
  /** fraction of the submission already uploaded (0..1), null when idle */
  progress: number | null;
  submit: (content: S['ModuleSubmissionData']) => Promise<void>;
  /** hides the last submit result, port of ModuleService.hideSubmit */
  clearStatus: () => void;
}

/**
 * Submits module answers and tracks the resulting status for one module.
 * Port of `ModuleService.submit` + `statusChanges`.
 */
export function useModuleSubmit(moduleId: number): ModuleSubmit {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<S['ModuleSubmitResponse'] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const submittingRef = useRef(false);

  useEffect(
    () =>
      subscribeModuleStatus((event) => {
        if (event.moduleId === moduleId) {
          setStatus(event.result);
        }
      }),
    [moduleId]
  );

  const applyResult = useCallback(
    (result: S['ModuleSubmitResponse']) => {
      const withMessage = result.message
        ? result
        : { ...result, message: t(`tasks.module.result.${result.result}`) };
      setStatus(withMessage);
      publishModuleStatus({ moduleId, result: withMessage });
      if (withMessage.result === 'ok') {
        // task state (icon, solved banner) may have changed
        void queryClient.invalidateQueries({ queryKey: ['tasks'] });
        void queryClient.invalidateQueries({ queryKey: ['taskDetails'] });
      }
    },
    [moduleId, t, queryClient]
  );

  const submit = useCallback(
    async (content: S['ModuleSubmissionData']) => {
      if (submittingRef.current) {
        return;
      }
      submittingRef.current = true;
      setSubmitting(true);
      setProgress(0);
      try {
        applyResult(await submitModule(moduleId, content, (fraction) => setProgress(fraction)));
      } catch {
        applyResult({ result: 'error', error: t('tasks.module.server-error') });
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
        setProgress(null);
      }
    },
    [moduleId, applyResult, t]
  );

  const clearStatus = useCallback(() => {
    setStatus(null);
    publishModuleStatus({ moduleId, result: null });
  }, [moduleId]);

  return { status, submitting, progress, submit, clearStatus };
}
