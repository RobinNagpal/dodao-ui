'use client';

import UsersTab from '@/components/admin/UsersTab';
import AdminTabLayout from '../AdminTabLayout';
import AdminLoading from '@/components/admin/AdminLoading';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function AdminUsersPage() {
  const { session, renderAuthGuard } = useAuthGuard({
    allowedRoles: 'Admin',
    loadingType: 'admin',
    loadingText: 'Loading users...',
  });

  const loadingGuard = renderAuthGuard();
  if (loadingGuard) return <AdminLoading />;

  return (
    <AdminTabLayout>
      <UsersTab />
    </AdminTabLayout>
  );
}