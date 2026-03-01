import AdminNavbar from '@/components/navigation/AdminNavbar';
import { BookOpen, Shield, UserCog, Users } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AdminTabLayoutProps {
  children: ReactNode;
  userEmail?: string;
}

export default function AdminTabLayout({ children, userEmail }: AdminTabLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <AdminNavbar 
        title="Admin Dashboard" 
        subtitle="Manage your educational content" 
        userEmail={userEmail}
        icon={<Shield className="h-8 w-8 text-white" />} 
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-emerald-100/50">
            <nav className="flex space-x-2">
              <Link
                href="/admin/case-studies"
                className="flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 text-center text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <div className="flex items-center justify-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Case Studies</span>
                </div>
              </Link>
              <Link
                href="/admin/enrollments"
                className="flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 text-center text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Enrollments</span>
                </div>
              </Link>
              <Link
                href="/admin/users"
                className="flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 text-center text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
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