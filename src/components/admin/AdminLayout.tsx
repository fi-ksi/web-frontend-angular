import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../auth/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import './AdminLayout.scss';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin area layout: sidebar navigation plus the page content.
 * Redirects away users that are not signed in as admins.
 */
export function AdminLayout({ children }: AdminLayoutProps): React.ReactElement | null {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace('/');
    } else if (user && user.role !== 'admin') {
      router.replace('/403');
    }
  }, [user, router]);

  if (user === undefined || user === null || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="content-container">{children}</div>
    </div>
  );
}
