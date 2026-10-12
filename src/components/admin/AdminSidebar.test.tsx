import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminSidebar } from './AdminSidebar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/ulohy'
}));

describe('AdminSidebar', () => {
  it('renders all nav links with the expected hrefs', () => {
    render(<AdminSidebar />);

    const expected: Array<[string, string]> = [
      ['admin.navbar.title', '/admin'],
      ['admin.navbar.tasks', '/admin/ulohy'],
      ['admin.navbar.monitor', '/admin/monitor'],
      ['admin.navbar.email', '/admin/email'],
      ['admin.navbar.discussion', '/admin/forum'],
      ['admin.navbar.waves', '/admin/waves'],
      ['admin.navbar.years', '/admin/years'],
      ['admin.navbar.achievement', '/admin/trofeje'],
      ['admin.navbar.articles', '/admin/articles'],
      ['admin.navbar.exec', '/admin/exec'],
      ['admin.navbar.users', '/admin/users'],
      ['admin.navbar.grading', '/admin/opravovani']
    ];

    for (const [label, href] of expected) {
      const link = screen.getByText(label);
      expect(link.closest('a')).toHaveAttribute('href', href);
    }
  });

  it('marks the link matching the current pathname as active', () => {
    render(<AdminSidebar />);

    const active = screen.getByText('admin.navbar.tasks');
    expect(active.className).toContain('active');

    const inactive = screen.getByText('admin.navbar.monitor');
    expect(inactive.className).not.toContain('active');
  });
});
