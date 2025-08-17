'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut, Users, Plus, Settings, Edit, Trash2, Shield } from 'lucide-react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import CreateEnrollmentModal from '@/components/admin/CreateEnrollmentModal';
import ManageStudentsModal from '@/components/admin/ManageStudentsModal';
import { BusinessSubject } from '@/types';
import { DeleteResponse } from '@/types/api';

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

export default function AdminDashboard(): JSX.Element {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-900">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('case-studies')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'case-studies' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Case Studies ({caseStudies?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('enrollments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'enrollments' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Enrollments ({enrollments?.length || 0})
              </button>
            </nav>
          </div>
        </div>

        {/* Case Studies Tab */}
        {activeTab === 'case-studies' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Case Studies Management</h2>
                <p className="text-gray-600">Manage all case studies in the system</p>
              </div>
              <button
                onClick={() => router.push('/admin/create')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Case Study</span>
              </button>
            </div>

            {loadingCaseStudies ? (
              <div className="flex justify-center items-center h-40">
                <div className="text-lg">Loading case studies...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {caseStudies?.map((caseStudy) => (
                  <div key={caseStudy.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {getSubjectDisplayName(caseStudy.subject)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{caseStudy.title}</h3>
                      </div>
                      <div className="flex space-x-1">
                        <button onClick={() => handleEditCaseStudy(caseStudy.id)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit case study">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteCaseStudy(caseStudy.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete case study">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{caseStudy.shortDescription}</p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-500">{caseStudy.modules?.length || 0} modules</span>
                      <span className="text-gray-500">Created by {caseStudy.createdBy}</span>
                    </div>

                    <div className="text-xs text-gray-500 mb-4">Created: {new Date(caseStudy.createdAt).toLocaleDateString()}</div>

                    <button
                      onClick={() => handleEditCaseStudy(caseStudy.id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Manage</span>
                    </button>
                  </div>
                )) || []}

                {caseStudies?.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No case studies</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new case study.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => router.push('/admin/create')}
                        className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                      >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                        Create Case Study
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
                <h2 className="text-xl font-semibold text-gray-900">Enrollment Management</h2>
                <p className="text-gray-600">Manage case study enrollments and student assignments</p>
              </div>
              <button
                onClick={() => setShowCreateEnrollment(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Enrollment</span>
              </button>
            </div>

            {loadingEnrollments ? (
              <div className="flex justify-center items-center h-40">
                <div className="text-lg">Loading enrollments...</div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {enrollments?.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No enrollments</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new enrollment.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowCreateEnrollment(true)}
                        className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                      >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                        Create Enrollment
                      </button>
                    </div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Study</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Instructor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students Enrolled</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {enrollments?.map((enrollment) => (
                        <tr key={enrollment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{enrollment.caseStudy.title}</div>
                            <div className="text-sm text-gray-500">{enrollment.caseStudy.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{enrollment.assignedInstructorId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{enrollment.students?.length || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(enrollment.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button onClick={() => handleManageStudents(enrollment)} className="text-blue-600 hover:text-blue-900">
                              Manage Students
                            </button>
                            <button onClick={() => handleDeleteEnrollment(enrollment.id)} className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
