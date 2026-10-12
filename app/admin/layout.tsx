'use client';

import { AdminLayout } from '../../src/components/admin/AdminLayout';

export default function AdminChrome({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
