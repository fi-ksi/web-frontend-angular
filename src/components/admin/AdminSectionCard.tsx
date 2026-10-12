import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../routes';

interface AdminSectionCardProps {
  /** Kebab-case section name, e.g. "tasks", "monitor", "instance-config". */
  name: string;
}

function toCamelCase(str: string): string {
  return str.replace(/-./g, (match) => match.charAt(1).toUpperCase());
}

/**
 * Card on the admin landing page linking to one admin section.
 */
export function AdminSectionCard({ name }: AdminSectionCardProps): React.ReactElement {
  const { t } = useTranslation();
  const relativeUrl = (ROUTES.admin as unknown as Record<string, string>)[toCamelCase(name)];
  const href = `/${ROUTES.admin._}/${relativeUrl}`;

  return (
    <Link className="card admin-section-card" href={href}>
      <img className="icon" src="/assets/img/karlik_color.png" alt="" />
      <span className="name">{t(`admin.root.${name}.title`)}</span>
      <span className="description">{t(`admin.root.${name}.description`)}</span>
    </Link>
  );
}
