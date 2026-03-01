'use client';

import AdminNavbar from '@/components/navigation/AdminNavbar';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { BookOpen, Shield, UserCog, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  activeTab?: 'case-studies' | 'enrollments' | 'users';
}

export default function AdminLayout({ children, title, subtitle, activeTab }: AdminLayoutProps) {
  const pathname = usePathname();
  
  const { session, renderAuthGuard } = useAuthGuard({
    allowedRoles: 'Admin',
    loadingType: 'admin',
    loadingText: 'Loading admin dashboard...',
    loadingSubtitle: 'Preparing your workspace...',
  });

  const loadingGuard = renderAuthGuard();
  if (loadingGuard) return loadingGuard;

  // Determine active tab based on pathname if not explicitly provided
  const currentActiveTab = activeTab || (() => {
    if (pathname?.includes('/case-studies')) return 'case-studies';
    if (pathname?.includes('/enrollments')) return 'enrollments';
    if (pathname?.includes('/users')) return 'users';
    return 'case-studies'; // default
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <AdminNavbar title={title} subtitle={subtitle} userEmail={session?.email} icon={<Shield className="h-8 w-8 text-white" />} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-emerald-100/50">
            <nav className="flex space-x-2">
              <Link
                href="/admin/case-studies"
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 text-center ${
                  currentActiveTab === 'case-studies'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transform scale-105'
                    : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Case Studies</span>
                </div>
              </Link>
              <Link
                href="/admin/enrollments"
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 text-center ${
                  currentActiveTab === 'enrollments'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transform scale-105'
                    : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Enrollments</span>
                </div>
              </Link>
              <Link
                href="/admin/users"
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 text-center ${
                  currentActiveTab === 'users'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transform scale-105'
                    : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <UserCog className="h-4 w-4" />
                  <span>Users</span>
                </div>
              </Link>
            </nav>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}