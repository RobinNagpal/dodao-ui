'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import type { CaseStudyModule, ModuleExercise } from '@/types';
import type { DeleteResponse, CaseStudyWithRelations } from '@/types/api';
import type { StudentTableData, ModuleTableData } from '@/types';
import { getSubjectDisplayName, getSubjectIcon, getSubjectColor } from '@/utils/subject-utils';
import { BookOpen, Users, BarChart3, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import InstructorNavbar from '@/components/navigation/InstructorNavbar';
import BackButton from '@/components/navigation/BackButton';
import CaseStudyStepper from '@/components/shared/CaseStudyStepper';
import ViewCaseStudyModal from '@/components/shared/ViewCaseStudyModal';
import ViewModuleModal from '@/components/shared/ViewModuleModal';
import ViewExerciseModal from '@/components/shared/ViewExerciseModal';
import InstructorLoading from '@/components/instructor/InstructorLoading';
import StudentTable from '@/components/instructor/StudentTable';

interface CaseStudyManagementClientProps {
  caseStudyId: string;
}

export default function CaseStudyManagementClient({ caseStudyId }: CaseStudyManagementClientProps) {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'analytics'>('overview');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [studentToClear, setStudentToClear] = useState<{ id: string; email: string } | null>(null);
  const [showDeleteAttemptConfirm, setShowDeleteAttemptConfirm] = useState<boolean>(false);
  const [attemptToDelete, setAttemptToDelete] = useState<{
    attemptId: string;
    studentId: string;
    studentEmail: string;
    exerciseTitle: string;
  } | null>(null);
  const [showCaseStudyModal, setShowCaseStudyModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CaseStudyModule | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ModuleExercise | null>(null);

  const router = useRouter();

  const { data: caseStudy, loading: loadingCaseStudy } = useFetchData<CaseStudyWithRelations>(
    `/api/case-studies/${caseStudyId}?userType=instructor&userEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !caseStudyId || !userEmail },
    'Failed to load case study'
  );

  // Fetch detailed student data for the table view
  const {
    data: studentsTableData,
    loading: loadingStudentsTable,
    reFetchData: refetchStudentsTable,
  } = useFetchData<{
    students: StudentTableData[];
    modules: ModuleTableData[];
  }>(
    `/api/instructor/case-studies/${caseStudyId}/students-table?instructorEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !caseStudyId || !userEmail },
    'Failed to load students table data'
  );

  const { deleteData: clearAttempts, loading: clearingAttempts } = useDeleteData<DeleteResponse, never>({
    successMessage: 'Student attempts cleared successfully!',
    errorMessage: 'Failed to clear student attempts',
  });

  const { deleteData: deleteAttempt, loading: deletingAttempt } = useDeleteData<DeleteResponse, never>({
    successMessage: 'Exercise attempt deleted successfully!',
    errorMessage: 'Failed to delete exercise attempt',
  });

  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    const email = localStorage.getItem('user_email');

    if (!userType || userType !== 'instructor' || !email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_email');
    router.push('/login');
  };

  const handleClearStudentAttempts = (studentId: string, studentEmail: string) => {
    setStudentToClear({ id: studentId, email: studentEmail });
    setShowDeleteConfirm(true);
  };

  const handleDeleteAttempt = (attemptId: string, studentId: string, studentEmail: string, exerciseTitle: string) => {
    setAttemptToDelete({ attemptId, studentId, studentEmail, exerciseTitle });
    setShowDeleteAttemptConfirm(true);
  };

  const handleConfirmClearAttempts = async (): Promise<void> => {
    if (!studentToClear) return;

    try {
      const url = `/api/instructor/students/${studentToClear.id}/clear-attempts?instructorEmail=${encodeURIComponent(userEmail)}&caseStudyId=${caseStudyId}`;
      await clearAttempts(url);

      // Refresh students data
      await refetchStudentsTable();
      setShowDeleteConfirm(false);
      setStudentToClear(null);
    } catch (error: unknown) {
      console.error('Error clearing student attempts:', error);
    }
  };

  const handleConfirmDeleteAttempt = async (): Promise<void> => {
    if (!attemptToDelete) return;

    try {
      const url = `/api/instructor/students/${attemptToDelete.studentId}/attempts/${attemptToDelete.attemptId}?instructorEmail=${encodeURIComponent(
        userEmail
      )}&caseStudyId=${caseStudyId}`;
      await deleteAttempt(url);

      // Refresh students data
      await refetchStudentsTable();
      setShowDeleteAttemptConfirm(false);
      setAttemptToDelete(null);
    } catch (error: unknown) {
      console.error('Error deleting exercise attempt:', error);
    }
  };

  const viewStudentDetails = (studentId: string) => {
    router.push(`/instructor/case-study/${caseStudyId}/student/${studentId}`);
  };

  const handleModuleClick = (module: CaseStudyModule) => {
    setSelectedModule(module as any);
    setShowModuleModal(true);
  };

  const handleExerciseClick = (exerciseId: string, moduleId: string) => {
    const caseStudyModule = caseStudy?.modules?.find((m) => m.id === moduleId);
    const exercise = caseStudyModule?.exercises?.find((e) => e.id === exerciseId);
    if (exercise && caseStudyModule) {
      setSelectedModule(caseStudyModule as any);
      setSelectedExercise(exercise as any);
      setShowExerciseModal(true);
    }
  };

  if (isLoading || loadingCaseStudy || (activeTab === 'students' && loadingStudentsTable)) {
    return <InstructorLoading text="Loading Case Study" subtitle="Preparing management console..." variant="enhanced" />;
  }

  const modules = caseStudy?.modules || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"> </div>
      </div>

      <InstructorNavbar
        title={caseStudy?.title || 'Case Study Not Found'}
        subtitle="Instructor Management Console"
        onLogout={handleLogout}
        icon={<GraduationCap className="h-8 w-8 text-white" />}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <BackButton userType="instructor" text="Back to Dashboard" href="/instructor" />

        {/* Enhanced Tab Navigation */}
        <div className="border-b border-white/20">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 pb-2 relative font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'text-purple-600 bg-purple-50/50 rounded-t-lg after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500'
                  : 'text-gray-600 hover:text-purple-600 hover:after:absolute hover:after:bottom-1 hover:after:left-0 hover:after:right-0 hover:after:h-0.5 hover:after:bg-purple-300'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-2 pb-2 relative font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
                activeTab === 'students'
                  ? 'text-purple-600 bg-purple-50/50 rounded-t-lg after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500'
                  : 'text-gray-600 hover:text-purple-600 hover:after:absolute hover:after:bottom-1 hover:after:left-0 hover:after:right-0 hover:after:h-0.5 hover:after:bg-purple-300'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Students</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 pb-2 relative font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
                activeTab === 'analytics'
                  ? 'text-purple-600 bg-purple-50/50 rounded-t-lg after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500'
                  : 'text-gray-600 hover:text-purple-600 hover:after:absolute hover:after:bottom-1 hover:after:left-0 hover:after:right-0 hover:after:h-0.5 hover:after:bg-purple-300'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </nav>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {modules.length > 0 && (
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge className={`bg-gradient-to-r ${getSubjectColor(caseStudy?.subject || 'MARKETING')} text-white border-0 text-sm px-3 py-1`}>
                        <span className="mr-2">{getSubjectIcon(caseStudy?.subject || 'MARKETING')}</span>
                        {getSubjectDisplayName(caseStudy?.subject || 'MARKETING')}
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Instructor View
                      </Badge>
                    </div>

                    <Button
                      onClick={() => setShowCaseStudyModal(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Case Study Details
                    </Button>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Case Study Overview</CardTitle>
                  <CardDescription className="text-base text-gray-700 leading-relaxed mb-4">
                    {caseStudy?.shortDescription || 'No description available.'}
                  </CardDescription>

                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Learning Path</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">Click on modules and exercises to view details</CardDescription>
                </CardHeader>
                <CardContent>
                  <CaseStudyStepper modules={modules as any} userType="instructor" onModuleClick={handleModuleClick} onExerciseClick={handleExerciseClick} />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-8">
            {studentsTableData && (
              <StudentTable
                students={studentsTableData.students}
                modules={studentsTableData.modules}
                onViewStudentDetails={viewStudentDetails}
                onClearStudentAttempts={handleClearStudentAttempts}
                onDeleteAttempt={handleDeleteAttempt}
                clearingAttempts={clearingAttempts}
                deletingAttempt={deletingAttempt}
              />
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-12">
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-10 w-10 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Analytics & Insights Dashboard</h2>
              <div className="text-gray-600 max-w-lg mx-auto">
                <p className="mb-6 text-lg">Comprehensive analytics dashboard is in development!</p>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-left border border-purple-200">
                  <p className="font-semibold mb-4 text-gray-900">Coming features:</p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Module completion rates and trends</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Common student challenges identification</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>AI prompt effectiveness analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Time spent on exercises breakdown</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Learning outcome assessments</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        open={showDeleteConfirm}
        showSemiTransparentBg={true}
        onClose={() => {
          setShowDeleteConfirm(false);
          setStudentToClear(null);
        }}
        onConfirm={handleConfirmClearAttempts}
        confirming={clearingAttempts}
        title="Clear Student Attempts"
        confirmationText={`Are you sure you want to clear all attempts and final submission for ${studentToClear?.email}? This action cannot be undone.`}
        askForTextInput={false}
      />

      <ConfirmationModal
        open={showDeleteAttemptConfirm}
        showSemiTransparentBg={true}
        onClose={() => {
          setShowDeleteAttemptConfirm(false);
          setAttemptToDelete(null);
        }}
        onConfirm={handleConfirmDeleteAttempt}
        confirming={deletingAttempt}
        title="Delete Exercise Attempt"
        confirmationText={`Are you sure you want to delete this attempt for ${attemptToDelete?.studentEmail} in exercise "${attemptToDelete?.exerciseTitle}"? This action cannot be undone.`}
        askForTextInput={false}
      />

      <ViewCaseStudyModal
        open={showCaseStudyModal}
        onClose={() => setShowCaseStudyModal(false)}
        caseStudy={caseStudy}
        hasCaseStudyInstructionsRead={() => true} // Instructor always has read instructions
        handleMarkInstructionAsRead={async () => {}} // No-op for instructor
        updatingStatus={false}
        onCaseStudyUpdate={(updatedCaseStudy) => {
          // Instructors don't edit, so this should not be called
          console.log('Instructor tried to update case study - this should not happen');
        }}
      />

      <ViewModuleModal
        open={showModuleModal}
        onClose={() => setShowModuleModal(false)}
        selectedModule={selectedModule}
        hasModuleInstructionsRead={() => true} // Instructor always has read instructions
        handleMarkInstructionAsRead={async () => {}} // No-op for instructor
        updatingStatus={false}
        caseStudy={caseStudy}
        onModuleUpdate={(updatedModule) => {
          // Instructors don't edit, so this should not be called
          console.log('Instructor tried to update module - this should not happen');
        }}
      />

      <ViewExerciseModal
        open={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        exercise={selectedExercise}
        moduleTitle={selectedModule?.title}
        moduleNumber={selectedModule?.orderNumber}
        caseStudy={caseStudy}
        moduleId={selectedModule?.id}
        onExerciseUpdate={(updatedExercise) => {
          // Instructors don't edit, so this should not be called
          console.log('Instructor tried to update exercise - this should not happen');
        }}
      />
    </div>
  );
}
