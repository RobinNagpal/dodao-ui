'use client';

import UsersTab from '@/components/admin/UsersTab';
import AdminLayout from '../layout';

export default function AdminUsersPage() {
  return (
    <AdminLayout 
      title="Admin Dashboard - Users"
      subtitle="Manage user accounts and permissions"
      activeTab="users"
    >
      <UsersTab />
    </AdminLayout>
  );
}