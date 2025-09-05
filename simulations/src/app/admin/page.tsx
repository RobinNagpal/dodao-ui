'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Plus, Edit, Trash2, Shield, Sparkles, Eye } from 'lucide-react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import CreateEnrollmentModal from '@/components/admin/CreateEnrollmentModal';
import ManageStudentsModal from '@/components/admin/ManageStudentsModal';
import type { BusinessSubject } from '@/types';
import type { DeleteResponse } from '@/types/api';
import { getSubjectDisplayName, getSubjectIcon, getSubjectColor } from '@/utils/subject-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminNavbar from '@/components/navigation/AdminNavbar';
import AdminLoading from '@/components/admin/AdminLoading';

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
  } = useFetchData<CaseStudyListItem[]>(
    `/api/case-studies?userEmail=${encodeURIComponent(userEmail)}&userType=admin`,
    { skipInitialFetch: !userEmail },
    'Failed to load case studies'
  );

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
    const userType: string | null = localStorage.getItem('user_type');
    const email: string | null = localStorage.getItem('user_email');

    if (!userType || userType !== 'admin' || !email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);
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
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_email');
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

  const getCaseStudySubjectsWithCounts = () => {
    if (!caseStudies) return [];

    const subjects: BusinessSubject[] = ['MARKETING', 'FINANCE', 'HR', 'OPERATIONS', 'ECONOMICS'];
    return subjects
      .map((subject) => ({
        subject,
        count: caseStudies.filter((cs) => cs.subject === subject).length,
      }))
      .filter((item) => item.count > 0);
  };

  const caseStudySubjectsWithCounts = getCaseStudySubjectsWithCounts();

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
        userEmail={userEmail}
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
          <div className="flex gap-8">
            {caseStudies && caseStudies.length > 0 && (
              <div className="w-80 flex-shrink-0">
                <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-emerald-600" />
                      <span>Subject Areas</span>
                    </CardTitle>
                    <CardDescription>Filter by Subject</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => setSelectedSubject('ALL')}
                      variant={selectedSubject === 'ALL' ? 'default' : 'ghost'}
                      className={`w-full justify-between h-12 ${
                        selectedSubject === 'ALL' ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg' : 'hover:bg-emerald-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-current rounded-full"></div>
                        <span>All Subjects</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-current">
                        {caseStudies?.length || 0}
                      </Badge>
                    </Button>

                    {caseStudySubjectsWithCounts.map(({ subject, count }) => (
                      <Button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        variant={selectedSubject === subject ? 'default' : 'ghost'}
                        className={`w-full justify-between h-12 ${
                          selectedSubject === subject ? `bg-gradient-to-r ${getSubjectColor(subject)} text-white shadow-lg` : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getSubjectIcon(subject)}</span>
                          <span className="font-medium">{getSubjectDisplayName(subject)}</span>
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-current">
                          {count}
                        </Badge>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex-1">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {selectedSubject === 'ALL' ? 'Case Studies Management' : `${getSubjectDisplayName(selectedSubject as BusinessSubject)} Studies`}
                  </h2>
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
              ) : caseStudies?.length === 0 ? (
                <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                  <CardContent className="text-center py-16">
                    <div className="relative mb-6">
                      <div className="bg-gradient-to-br from-emerald-100 to-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="h-12 w-12 text-emerald-600" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-400 to-emerald-500 p-2 rounded-full">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Case Studies</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">Get started by creating a new case study for your educational platform.</p>
                    <button
                      onClick={() => router.push('/admin/create')}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="font-medium">Create Case Study</span>
                    </button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCaseStudies?.map((caseStudy) => (
                    <Card
                      key={caseStudy.id}
                      className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge className={`bg-gradient-to-r ${getSubjectColor(caseStudy.subject)} text-white border-0`}>
                              <span className="mr-1">{getSubjectIcon(caseStudy.subject)}</span>
                              {getSubjectDisplayName(caseStudy.subject)}
                            </Badge>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleViewCaseStudy(caseStudy.id)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="View case study details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
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
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{caseStudy.title}</CardTitle>
                        <CardDescription className="text-gray-600 line-clamp-2">{caseStudy.shortDescription}</CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl p-3">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4 text-emerald-500" />
                            <span className="text-gray-600 font-medium">{caseStudy.modules?.length || 0} modules</span>
                          </div>
                          <span className="text-gray-500">by {caseStudy.createdBy}</span>
                        </div>

                        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                          Created: {new Date(caseStudy.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  )) || []}
                </div>
              )}

              {caseStudies && caseStudies.length > 0 && filteredCaseStudies.length === 0 && selectedSubject !== 'ALL' && (
                <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                  <CardContent className="text-center py-16">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">{getSubjectIcon(selectedSubject as BusinessSubject)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No {getSubjectDisplayName(selectedSubject as BusinessSubject)} Studies</h3>
                    <p className="text-gray-600">
                      There are no case studies in the {getSubjectDisplayName(selectedSubject as BusinessSubject)} subject area yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
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
