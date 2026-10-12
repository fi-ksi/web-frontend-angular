import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../routes';
import './AdminSidebar.scss';

interface NavLink {
  href: string;
  labelKey: string;
  exact: boolean;
}

/**
 * Left navigation bar of the admin area.
 * On small screens the menu starts collapsed and opens with the toggle button.
 */
export function AdminSidebar(): React.ReactElement {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const admin = `/${ROUTES.admin._}`;
  const links: NavLink[] = [
    { href: admin, labelKey: 'admin.navbar.title', exact: true },
    { href: `${admin}/${ROUTES.admin.tasks}`, labelKey: 'admin.navbar.tasks', exact: false },
    { href: `${admin}/${ROUTES.admin.monitor}`, labelKey: 'admin.navbar.monitor', exact: false },
    { href: `${admin}/${ROUTES.admin.email}`, labelKey: 'admin.navbar.email', exact: false },
    { href: `${admin}/${ROUTES.admin.discussion}`, labelKey: 'admin.navbar.discussion', exact: false },
    { href: `${admin}/${ROUTES.admin.waves._}`, labelKey: 'admin.navbar.waves', exact: false },
    { href: `${admin}/${ROUTES.admin.years._}`, labelKey: 'admin.navbar.years', exact: false },
    { href: `${admin}/${ROUTES.admin.achievements._}`, labelKey: 'admin.navbar.achievement', exact: false },
    { href: `${admin}/${ROUTES.admin.articles._}`, labelKey: 'admin.navbar.articles', exact: false },
    { href: `${admin}/${ROUTES.admin.exec}`, labelKey: 'admin.navbar.exec', exact: false },
    { href: `${admin}/${ROUTES.admin.users}`, labelKey: 'admin.navbar.users', exact: false },
    { href: `${admin}/${ROUTES.admin.grading}`, labelKey: 'admin.navbar.grading', exact: false }
  ];

  const isActive = (link: NavLink): boolean =>
    link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);

  return (
    <div className="admin-sidebar">
      <button
        type="button"
        className="sidebar-toggle"
        aria-expanded={open}
        aria-label={t('admin.navbar.title')}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '«' : '»'}
      </button>
      <div className={`content${open ? ' open' : ''}`}>
        <nav className="navigation-bar">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${link.exact ? 'title' : 'nav-btn'}${isActive(link) ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
