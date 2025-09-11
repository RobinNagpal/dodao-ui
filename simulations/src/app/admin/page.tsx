'use client';

import AdminLoading from '@/components/admin/AdminLoading';
import CaseStudiesTab from '@/components/admin/CaseStudiesTab';
import CreateEnrollmentModal from '@/components/admin/CreateEnrollmentModal';
import EnrollmentsTab from '@/components/admin/EnrollmentsTab';
import ManageStudentsModal from '@/components/admin/ManageStudentsModal';
import AdminNavbar from '@/components/navigation/AdminNavbar';
import type { BusinessSubject } from '@/types';
import type { DeleteResponse } from '@/types/api';
import { SimulationSession } from '@/types/user';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { BookOpen, Shield, Users } from 'lucide-react';
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
}

type DeleteType = 'case-study' | 'enrollment';

export default function AdminDashboard() {
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  const [activeTab, setActiveTab] = useState<'case-studies' | 'enrollments'>('case-studies');
  const [selectedSubject, setSelectedSubject] = useState<BusinessSubject | 'ALL'>('ALL');
  const [filteredCaseStudies, setFilteredCaseStudies] = useState<CaseStudyListItem[]>([]);
  const router = useRouter();

  const [showCreateEnrollment, setShowCreateEnrollment] = useState<boolean>(false);
  const [showManageStudents, setShowManageStudents] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>('');
  const [selectedEnrollmentTitle, setSelectedEnrollmentTitle] = useState<string>('');
  const [deleteType, setDeleteType] = useState<DeleteType>('case-study');
  const [deleteId, setDeleteId] = useState<string>('');

  const {
    data: caseStudies,
    loading: loadingCaseStudies,
    reFetchData: refetchCaseStudies,
  } = useFetchData<CaseStudyListItem[]>(`${getBaseUrl()}/api/case-studies`, {}, 'Failed to load case studies');

  const {
    data: enrollments,
    loading: loadingEnrollments,
    reFetchData: refetchEnrollments,
  } = useFetchData<EnrollmentListItem[]>('/api/enrollments', {}, 'Failed to load enrollments');

  const { deleteData: deleteCaseStudy, loading: deletingCaseStudy } = useDeleteData<DeleteResponse, never>({
    successMessage: 'Case study deleted successfully!',
    errorMessage: 'Failed to delete case study',
  });

  const { deleteData: deleteEnrollment, loading: deletingEnrollment } = useDeleteData<DeleteResponse, never>({
    successMessage: 'Enrollment deleted successfully!',
    errorMessage: 'Failed to delete enrollment',
  });

  useEffect((): void => {
    if (!session || session.role !== 'Admin') {
      router.push('/login');
      return;
    }
  }, [router]);

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

  const handleEditCaseStudy = (caseStudyId: string): void => {
    router.push(`/admin/edit/${caseStudyId}`);
  };

  const handleViewCaseStudy = (caseStudyId: string): void => {
    router.push(`/admin/case-study/${caseStudyId}`);
  };

  const handleDeleteCaseStudy = (caseStudyId: string): void => {
    setDeleteType('case-study');
    setDeleteId(caseStudyId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteEnrollment = (enrollmentId: string): void => {
    setDeleteType('enrollment');
    setDeleteId(enrollmentId);
    setShowDeleteConfirm(true);
  };

  const handleManageStudents = (enrollment: EnrollmentListItem): void => {
    setSelectedEnrollmentId(enrollment.id);
    setSelectedEnrollmentTitle(enrollment.caseStudy.title);
    setShowManageStudents(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    try {
      if (deleteType === 'case-study') {
        await deleteCaseStudy(`/api/case-studies/${deleteId}`);
        await refetchCaseStudies();
      } else {
        await deleteEnrollment(`/api/enrollments/${deleteId}`);
        await refetchEnrollments();
      }
      setShowDeleteConfirm(false);
      setDeleteId('');
    } catch (error: unknown) {
      console.error(`Error deleting ${deleteType}:`, error);
    }
  };

  const handleEnrollmentSuccess = async (): Promise<void> => {
    await refetchEnrollments();
  };

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
            onViewCaseStudy={handleViewCaseStudy}
            onEditCaseStudy={handleEditCaseStudy}
            onDeleteCaseStudy={handleDeleteCaseStudy}
          />
        )}

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <EnrollmentsTab
            enrollments={enrollments || []}
            loadingEnrollments={loadingEnrollments}
            onCreateEnrollment={() => setShowCreateEnrollment(true)}
            onManageStudents={handleManageStudents}
            onDeleteEnrollment={handleDeleteEnrollment}
          />
        )}

        <CreateEnrollmentModal isOpen={showCreateEnrollment} onClose={() => setShowCreateEnrollment(false)} onSuccess={handleEnrollmentSuccess} />

        {showManageStudents && selectedEnrollmentId && (
          <ManageStudentsModal
            isOpen={showManageStudents}
            onClose={() => {
              setShowManageStudents(false);
              setSelectedEnrollmentId('');
              setSelectedEnrollmentTitle('');
            }}
            enrollmentId={selectedEnrollmentId}
            enrollmentTitle={selectedEnrollmentTitle}
          />
        )}
        <ConfirmationModal
          open={showDeleteConfirm}
          showSemiTransparentBg={true}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          confirming={deletingCaseStudy || deletingEnrollment}
          title={`Delete ${deleteType === 'case-study' ? 'Case Study' : 'Enrollment'}`}
          confirmationText={`Are you sure you want to delete this ${deleteType === 'case-study' ? 'case study' : 'enrollment'}? This action cannot be undone.`}
          askForTextInput={false}
        />
      </div>
    </div>
  );
}
