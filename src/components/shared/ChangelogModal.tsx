import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import { storageGet, storageSet } from '../../utils/storage';
import { Modal } from './Modal';
import { Spinner } from './Spinner';

interface ChangelogItem {
  subject: string;
  author: { date: string };
}

interface ChangeEntry {
  date: Date;
  caption: string;
  type: 'feat' | 'fix' | 'patch';
}

const COMMIT_RE = /^(feat|fix|patch)(?:\((.*?)\))?:\s+(.*)$/;

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface ChangelogModalProps {
  open: boolean;
  onClose: () => void;
  /** Enable the automatic "new changes since last visit" popup for testers. */
  autoNotify?: boolean;
}

/**
 * Changelog dialog listing feat/fix/patch commits since a chosen date.
 * With autoNotify it pops up by itself for organisers/testers when new
 * entries arrived, and remembers the last seen commit time.
 */
export function ChangelogModal({ open, onClose, autoNotify = false }: ChangelogModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [visible, setVisible] = useState(false);
  const [since, setSince] = useState<string>(() => {
    const lastCommit = storageGet<number>('changelog', 'last-commit');
    return toDateInputValue(new Date(lastCommit ?? Date.now() - 7 * 24 * 3600 * 1000));
  });

  useEffect(() => {
    if (open) setVisible(true);
  }, [open ]);

  const changelogQuery = useQuery({
    queryKey: ['changelog'],
    queryFn: async (): Promise<ChangelogItem[] | null> => {
      try {
        const resp = await fetch('/assets/changelog/changelog.json');
        if (!resp.ok) return null;
        return (await resp.json()) as ChangelogItem[];
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60_000
  });

  const changes = useMemo(() => {
    const grouped: Record<string, ChangeEntry[]> = {};
    const sinceDate = new Date(since);
    (changelogQuery.data ?? []).forEach((change) => {
      const match = COMMIT_RE.exec(change.subject);
      if (!match) return;
      const date = new Date(change.author.date);
      if (date < sinceDate) return;
      const type = match[1] as 'feat' | 'fix' | 'patch';
      const category = match[2] || '';
      const caption = match[3];
      (grouped[category] ??= []).push({ date, type, caption });
    });
    return grouped;
  }, [changelogQuery.data, since]);

  const categories = useMemo(() => Object.keys(changes).sort(), [changes]);

  useEffect(() => {
    if (!autoNotify || !categories.length) return;
    const role = user?.role;
    if (role === 'admin' || role === 'org' || role === 'tester') {
      setVisible(true);
    }
  }, [autoNotify, categories.length, user?.role]);

  const close = () => {
    storageSet('changelog', 'last-commit', Date.now());
    setVisible(false);
    onClose();
  };

  return (
    <Modal open={visible} title="root.changelog.title" onClose={close} size="lg">
      <div className="mb-2">
        <input
          type="date"
          className="form-control d-inline-block w-auto"
          value={since}
          onChange={(e) => setSince(e.target.value)}
        />
      </div>
      <Spinner show={changelogQuery.isLoading} />
      {categories.map((category) => (
        <div key={category}>
          <h4>{category}</h4>
          <ul>
            {changes[category].map((item, i) => (
              <li key={i}>
                {item.type}: {item.caption} ({item.date.toLocaleDateString('cs-CZ')})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Modal>
  );
}
