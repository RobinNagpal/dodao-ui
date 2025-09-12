'use client';

import AdminLoading from '@/components/admin/AdminLoading';
import CaseStudiesTab from '@/components/admin/CaseStudiesTab';
import CreateEnrollmentModal from '@/components/admin/CreateEnrollmentModal';
import EnrollmentsTab from '@/components/admin/EnrollmentsTab';
import UsersTab from '@/components/admin/UsersTab';
import AdminNavbar from '@/components/navigation/AdminNavbar';
import type { BusinessSubject } from '@/types';
import { SimulationSession } from '@/types/user';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { BookOpen, Shield, Users, UserCog } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CaseStudyListItem {
  id: string;
  title: string;
  shortDescription: string;
  subject: BusinessSubject;
  createdBy: string | null;
  createdAt: string;
  modules: Array<{
    id: string;
  }>;
}

interface EnrollmentListItem {
  id: string;
  caseStudyId: string;
  assignedInstructorId: string;
  createdAt: string;
  caseStudy: {
    id: string;
    title: string;
    shortDescription: string;
    subject: string;
  };
  students: Array<{
    id: string;
    assignedStudentId: string;
    createdBy: string | null;
  }>;
  assignedInstructor?: {
    id: string;
    email: string | null;
    username: string;
  };
}

export default function AdminDashboard() {
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  const [activeTab, setActiveTab] = useState<'case-studies' | 'enrollments' | 'users'>('case-studies');
  const [selectedSubject, setSelectedSubject] = useState<BusinessSubject | 'ALL'>('ALL');
  const [filteredCaseStudies, setFilteredCaseStudies] = useState<CaseStudyListItem[]>([]);
  const router = useRouter();

  const [showCreateEnrollment, setShowCreateEnrollment] = useState<boolean>(false);

  const {
    data: caseStudies,
    loading: loadingCaseStudies,
    reFetchData: refetchCaseStudies,
  } = useFetchData<CaseStudyListItem[]>(`${getBaseUrl()}/api/case-studies`, {}, 'Failed to load case studies');

  const {
    data: enrollments,
    loading: loadingEnrollments,
    reFetchData: refetchEnrollments,
  } = useFetchData<EnrollmentListItem[]>(`${getBaseUrl()}/api/enrollments`, {}, 'Failed to load enrollments');

  // Filter case studies based on selected subject
  useEffect(() => {
    if (caseStudies) {
      if (selectedSubject === 'ALL') {
        setFilteredCaseStudies(caseStudies);
      } else {
        setFilteredCaseStudies(caseStudies.filter((cs) => cs.subject === selectedSubject));
      }
    }
  }, [selectedSubject, caseStudies]);

  const handleLogout = (): void => {
    router.push('/login');
  };

  const handleEnrollmentSuccess = async (): Promise<void> => {
    await refetchEnrollments();
  };

  if (!session || session.role !== 'Admin') {
    return <div>You are not authorized to access this page</div>;
  }
  if (loadingCaseStudies || loadingEnrollments || caseStudies === undefined || enrollments === undefined) {
    return <AdminLoading text="Loading admin dashboard..." subtitle="Preparing your workspace..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <AdminNavbar
        title="Admin Dashboard"
        subtitle="Welcome Back"
        userEmail={session?.email}
        onLogout={handleLogout}
        icon={<Shield className="h-8 w-8 text-white" />}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-emerald-100/50">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('case-studies')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'case-studies'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transform scale-105'
                    : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Case Studies ({caseStudies?.length || 0})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('enrollments')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'enrollments'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transform scale-105'
                    : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Enrollments ({enrollments?.length || 0})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transform scale-105'
                    : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <UserCog className="h-4 w-4" />
                  <span>Users</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Case Studies Tab */}
        {activeTab === 'case-studies' && (
          <CaseStudiesTab
            caseStudies={caseStudies || []}
            filteredCaseStudies={filteredCaseStudies}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            loadingCaseStudies={loadingCaseStudies}
            onCreateCaseStudy={() => router.push('/admin/create')}
            refetchCaseStudies={refetchCaseStudies}
          />
        )}

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <EnrollmentsTab
            enrollments={enrollments || []}
            loadingEnrollments={loadingEnrollments}
            onCreateEnrollment={() => setShowCreateEnrollment(true)}
            refetchEnrollments={refetchEnrollments}
          />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && <UsersTab />}

        <CreateEnrollmentModal isOpen={showCreateEnrollment} onClose={() => setShowCreateEnrollment(false)} onSuccess={handleEnrollmentSuccess} />
      </div>
    </div>
  );
}
