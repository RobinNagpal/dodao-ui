'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut, Users, Plus, Edit, Trash2, Shield, Sparkles } from 'lucide-react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import CreateEnrollmentModal from '@/components/admin/CreateEnrollmentModal';
import ManageStudentsModal from '@/components/admin/ManageStudentsModal';
import type { BusinessSubject } from '@/types';
import type { DeleteResponse } from '@/types/api';

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
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'case-studies' | 'enrollments'>('case-studies');
  const router = useRouter();

  // Modal states
  const [showCreateEnrollment, setShowCreateEnrollment] = useState<boolean>(false);
  const [showManageStudents, setShowManageStudents] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Selected items
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>('');
  const [selectedEnrollmentTitle, setSelectedEnrollmentTitle] = useState<string>('');
  const [deleteType, setDeleteType] = useState<DeleteType>('case-study');
  const [deleteId, setDeleteId] = useState<string>('');

  // Fetch data
  const {
    data: caseStudies,
    loading: loadingCaseStudies,
    reFetchData: refetchCaseStudies,
  } = useFetchData<CaseStudyListItem[]>('/api/case-studies', {}, 'Failed to load case studies');

  const {
    data: enrollments,
    loading: loadingEnrollments,
    reFetchData: refetchEnrollments,
  } = useFetchData<EnrollmentListItem[]>('/api/enrollments', {}, 'Failed to load enrollments');

  // Delete hooks
  const { deleteData: deleteCaseStudy, loading: deletingCaseStudy } = useDeleteData<DeleteResponse, never>({
    successMessage: 'Case study deleted successfully!',
    errorMessage: 'Failed to delete case study',
  });

  const { deleteData: deleteEnrollment, loading: deletingEnrollment } = useDeleteData<DeleteResponse, never>({
    successMessage: 'Enrollment deleted successfully!',
    errorMessage: 'Failed to delete enrollment',
  });

  // Check authentication on page load
  useEffect((): void => {
    const userType: string | null = localStorage.getItem('user_type');
    const email: string | null = localStorage.getItem('user_email');

    if (!userType || userType !== 'admin' || !email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);
    setIsLoading(false);
  }, [router]);

  // Refetch data when page comes into focus (returning from create/edit pages)
  useEffect(() => {
    const handleFocus = () => {
      refetchCaseStudies();
      refetchEnrollments();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchCaseStudies, refetchEnrollments]);

  const handleLogout = (): void => {
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_email');
    router.push('/login');
  };

  const handleEditCaseStudy = (caseStudyId: string): void => {
    router.push(`/admin/edit/${caseStudyId}`);
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

  const getSubjectDisplayName = (subject: string): string => {
    const displayNames: Record<string, string> = {
      HR: 'Human Resources',
      ECONOMICS: 'Economics',
      MARKETING: 'Marketing',
      FINANCE: 'Finance',
      OPERATIONS: 'Operations',
    };
    return displayNames[subject] || subject;
  };

  const handleEnrollmentSuccess = async (): Promise<void> => {
    await refetchEnrollments();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-xl border border-emerald-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="text-lg font-medium bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100/50 shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-2xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Admin Dashboard</h1>
                <p className="text-emerald-600/80 font-medium">Welcome back, {userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

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
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Case Studies Management</h2>
                <p className="text-emerald-600/70 mt-1">Manage all case studies in the system</p>
              </div>
              <button
                onClick={() => router.push('/admin/create')}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Add Case Study</span>
              </button>
            </div>

            {loadingCaseStudies ? (
              <div className="flex justify-center items-center h-40">
                <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  <span className="text-lg font-medium text-emerald-600">Loading case studies...</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {caseStudies?.map((caseStudy) => (
                  <div
                    key={caseStudy.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/50 p-6 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                            {getSubjectDisplayName(caseStudy.subject)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">{caseStudy.title}</h3>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditCaseStudy(caseStudy.id)}
                          className="text-emerald-600 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Edit case study"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCaseStudy(caseStudy.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete case study"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{caseStudy.shortDescription}</p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center space-x-1">
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                        <span className="text-gray-600">{caseStudy.modules?.length || 0} modules</span>
                      </div>
                      <span className="text-gray-500">by {caseStudy.createdBy}</span>
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">Created: {new Date(caseStudy.createdAt).toLocaleDateString()}</div>
                  </div>
                )) || []}

                {caseStudies?.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/50 p-12">
                      <BookOpen className="mx-auto h-16 w-16 text-emerald-400 mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No case studies</h3>
                      <p className="text-gray-600 mb-6">Get started by creating a new case study.</p>
                      <button
                        onClick={() => router.push('/admin/create')}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="font-medium">Create Case Study</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Enrollment Management</h2>
                <p className="text-emerald-600/70 mt-1">Manage case study enrollments and student assignments</p>
              </div>
              <button
                onClick={() => setShowCreateEnrollment(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Create Enrollment</span>
              </button>
            </div>

            {loadingEnrollments ? (
              <div className="flex justify-center items-center h-40">
                <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  <span className="text-lg font-medium text-emerald-600">Loading enrollments...</span>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/50 overflow-hidden">
                {enrollments?.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="mx-auto h-16 w-16 text-emerald-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No enrollments</h3>
                    <p className="text-gray-600 mb-6">Get started by creating a new enrollment.</p>
                    <button
                      onClick={() => setShowCreateEnrollment(true)}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="font-medium">Create Enrollment</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-emerald-100">
                      <thead className="bg-gradient-to-r from-emerald-50 to-green-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Case Study</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Assigned Instructor</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Students Enrolled</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {enrollments?.map((enrollment) => (
                          <tr key={enrollment.id} className="hover:bg-emerald-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-gray-900">{enrollment.caseStudy.title}</div>
                              <div className="text-sm text-emerald-600 font-medium">{enrollment.caseStudy.subject}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 font-medium">{enrollment.assignedInstructorId}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <div className="bg-emerald-100 p-1 rounded-full">
                                  <Users className="h-4 w-4 text-emerald-600" />
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{enrollment.students?.length || 0}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{new Date(enrollment.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm font-medium space-x-3">
                              <button
                                onClick={() => handleManageStudents(enrollment)}
                                className="text-emerald-600 hover:text-emerald-800 font-medium hover:underline transition-colors"
                              >
                                Manage Students
                              </button>
                              <button
                                onClick={() => handleDeleteEnrollment(enrollment.id)}
                                className="text-red-600 hover:text-red-800 font-medium hover:underline transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
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
