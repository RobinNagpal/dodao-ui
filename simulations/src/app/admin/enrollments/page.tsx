'use client';

import EnrollmentsTab from '@/components/admin/EnrollmentsTab';
import AdminTabLayout from '../AdminTabLayout';
import AdminLoading from '@/components/admin/AdminLoading';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function AdminEnrollmentsPage() {
  const { session, renderAuthGuard } = useAuthGuard({
    allowedRoles: 'Admin',
    loadingType: 'admin',
    loadingText: 'Loading enrollments...',
  });

  const loadingGuard = renderAuthGuard();
  if (loadingGuard) return <AdminLoading />;

  return (
    <AdminTabLayout userEmail={session?.email || session?.username}>
      <EnrollmentsTab />
    </AdminTabLayout>
  );
}