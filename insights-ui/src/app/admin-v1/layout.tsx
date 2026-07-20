import AdminNav from '@/app/admin-v1/AdminNav';
import React from 'react';

/**
 * Shared chrome for every `/admin-v1/*` screen: the admin navigation plus a
 * full-width, edge-to-edge content container. Individual admin pages therefore
 * render only their own content — they neither import `AdminNav` nor wrap
 * themselves in `PageWrapper` (which would constrain them to `max-w-7xl`).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="w-full px-4 py-6 sm:px-6 text-color">
      <AdminNav />
      {children}
    </div>
  );
}
