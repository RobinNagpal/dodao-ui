'use client';

import EnrollmentsTab from '@/components/admin/EnrollmentsTab';
import AdminLayout from '../layout';

export default function AdminEnrollmentsPage() {
  return (
    <AdminLayout 
      title="Admin Dashboard - Enrollments"
      subtitle="Manage class and student enrollments"
      activeTab="enrollments"
    >
      <EnrollmentsTab />
    </AdminLayout>
  );
}