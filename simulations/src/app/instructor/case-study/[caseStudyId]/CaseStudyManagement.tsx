'use client';

import AnalyticsTab from '@/components/instructor/case-study-tabs/AnalyticsTab';
import OverviewTab from '@/components/instructor/case-study-tabs/OverviewTab';
import StudentsTab from '@/components/instructor/case-study-tabs/StudentsTab';
import TabNavigation, { TabType } from '@/components/instructor/case-study-tabs/TabNavigation';
import InstructorLoading from '@/components/instructor/InstructorLoading';
import BackButton from '@/components/navigation/BackButton';
import InstructorNavbar from '@/components/navigation/InstructorNavbar';
import ViewCaseStudyInstructionsModal from '@/components/shared/ViewCaseStudyInstructionsModal';
import ViewExerciseModal from '@/components/shared/ViewExerciseModal';
import ViewModuleModal from '@/components/shared/ViewModuleModal';
import type { CaseStudyModule, ModuleExercise, ModuleTableData, StudentTableData } from '@/types';
import type { CaseStudyWithRelationsForStudents, DeleteResponse } from '@/types/api';
import { SimulationSession } from '@/types/user';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { GraduationCap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CaseStudyManagementClientProps {
  caseStudyId: string;
}

export default function CaseStudyManagementClient({ caseStudyId }: CaseStudyManagementClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const router = useRouter();
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [studentToClear, setStudentToClear] = useState<{ id: string; email: string } | null>(null);
  const [showDeleteAttemptConfirm, setShowDeleteAttemptConfirm] = useState<boolean>(false);
  const [attemptToDelete, setAttemptToDelete] = useState<{
    attemptId: string;
    studentId: string;
    studentEmail: string;
    exerciseTitle: string;
  } | null>(null);
  const [showDeleteFinalSummaryConfirm, setShowDeleteFinalSummaryConfirm] = useState<boolean>(false);
  const [finalSummaryToDelete, setFinalSummaryToDelete] = useState<{
    finalSummaryId: string;
    studentId: string;
    studentEmail: string;
  } | null>(null);
  const [showCaseStudyModal, setShowCaseStudyModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CaseStudyModule | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ModuleExercise | null>(null);
  const [evaluatingAttempts, setEvaluatingAttempts] = useState<Set<string>>(new Set());
  const [showBulkEvaluateConfirm, setShowBulkEvaluateConfirm] = useState(false);
  const [selectedStudentForEvaluation, setSelectedStudentForEvaluation] = useState<{
    id: string;
    email: string;
  } | null>(null);

  // API hook to fetch case study data
  const {
    data: caseStudy,
    loading: loadingCaseStudy,
    reFetchData,
  } = useFetchData<CaseStudyWithRelationsForStudents>(
    `/api/case-studies/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId || !session },
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
    `${getBaseUrl()}/api/instructor/case-studies/${caseStudyId}/students-table`,
    { skipInitialFetch: !caseStudyId || !session },
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

  const { deleteData: deleteFinalSummary, loading: deletingFinalSummary } = useDeleteData<DeleteResponse, never>({
    successMessage: 'Final summary deleted successfully!',
    errorMessage: 'Failed to delete final summary',
  });

  const { postData: evaluateAttempt } = usePostData<
    { evaluatedScore: number; evaluationLogic: string; finalScore: number },
    { studentId: string; attemptId: string }
  >({
    successMessage: 'Exercise attempt evaluated successfully!',
    errorMessage: 'Failed to evaluate exercise attempt',
  });

  const handleLogout = () => {
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

  const handleDeleteFinalSummary = (finalSummaryId: string, studentId: string, studentEmail: string) => {
    setFinalSummaryToDelete({ finalSummaryId, studentId, studentEmail });
    setShowDeleteFinalSummaryConfirm(true);
  };

  const handleEvaluateAttempt = async (attemptId: string, exerciseId: string, studentId: string) => {
    try {
      setEvaluatingAttempts(prev => new Set([...prev, attemptId]));
      
      const url = `/api/instructor/exercises/${exerciseId}/evaluate`;
      await evaluateAttempt(url, { studentId, attemptId });

      // Refresh students data to show updated scores
      await refetchStudentsTable();
    } catch (error) {
      console.error('Error evaluating attempt:', error);
    } finally {
      setEvaluatingAttempts(prev => {
        const newSet = new Set(prev);
        newSet.delete(attemptId);
        return newSet;
      });
    }
  };

  const handleStartBulkEvaluation = (studentId: string, studentEmail: string) => {
    setSelectedStudentForEvaluation({ id: studentId, email: studentEmail });
    setShowBulkEvaluateConfirm(true);
  };

  const handleConfirmBulkEvaluation = async () => {
    if (!selectedStudentForEvaluation || !studentsTableData) return;

    const student = studentsTableData.students.find(s => s.id === selectedStudentForEvaluation.id);
    if (!student) return;

    setShowBulkEvaluateConfirm(false);
    
    // Evaluate all unevaluated attempts for this student
    for (const exercise of student.exercises) {
      if (exercise.hasAttempts) {
        for (const attempt of exercise.attempts) {
          // Only evaluate if not already evaluated
          if (attempt.evaluatedScore === null && attempt.status === 'completed') {
            try {
              await handleEvaluateAttempt(attempt.id, exercise.exerciseId, selectedStudentForEvaluation.id);
              // Add small delay to avoid overwhelming the API
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.error(`Error evaluating attempt ${attempt.id}:`, error);
              // Continue with other attempts even if one fails
            }
          }
        }
      }
    }

    setSelectedStudentForEvaluation(null);
  };

  const handleConfirmClearAttempts = async (): Promise<void> => {
    if (!studentToClear) return;

    try {
      const url = `/api/instructor/students/${studentToClear.id}/clear-attempts?caseStudyId=${caseStudyId}`;
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
      const url = `/api/instructor/students/${attemptToDelete.studentId}/attempts/${attemptToDelete.attemptId}?caseStudyId=${caseStudyId}`;
      await deleteAttempt(url);

      // Refresh students data
      await refetchStudentsTable();
      setShowDeleteAttemptConfirm(false);
      setAttemptToDelete(null);
    } catch (error: unknown) {
      console.error('Error deleting exercise attempt:', error);
    }
  };

  const handleConfirmDeleteFinalSummary = async (): Promise<void> => {
    if (!finalSummaryToDelete) return;

    try {
      const url = `/api/instructor/students/${finalSummaryToDelete.studentId}/final-summary/${finalSummaryToDelete.finalSummaryId}?caseStudyId=${caseStudyId}`;
      await deleteFinalSummary(url);

      // Refresh students data
      await refetchStudentsTable();
      setShowDeleteFinalSummaryConfirm(false);
      setFinalSummaryToDelete(null);
    } catch (error: unknown) {
      console.error('Error deleting final summary:', error);
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

  if (!session || (session.role !== 'Instructor' && session.role !== 'Admin')) {
    return null;
  }

  if (loadingCaseStudy || (activeTab === 'students' && loadingStudentsTable)) {
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

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            caseStudy={caseStudy}
            modules={modules}
            onShowCaseStudyModal={() => setShowCaseStudyModal(true)}
            onModuleClick={handleModuleClick}
            onExerciseClick={handleExerciseClick}
          />
        )}

        {activeTab === 'students' && studentsTableData && (
          <StudentsTab
            students={studentsTableData.students}
            modules={studentsTableData.modules}
            onViewStudentDetails={viewStudentDetails}
            onClearStudentAttempts={handleClearStudentAttempts}
            onDeleteAttempt={handleDeleteAttempt}
            onDeleteFinalSummary={handleDeleteFinalSummary}
            onEvaluateAttempt={handleEvaluateAttempt}
            onStartBulkEvaluation={handleStartBulkEvaluation}
            clearingAttempts={clearingAttempts}
            deletingAttempt={deletingAttempt}
            evaluatingAttempts={evaluatingAttempts}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsTab />}
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

      <ConfirmationModal
        open={showDeleteFinalSummaryConfirm}
        showSemiTransparentBg={true}
        onClose={() => {
          setShowDeleteFinalSummaryConfirm(false);
          setFinalSummaryToDelete(null);
        }}
        onConfirm={handleConfirmDeleteFinalSummary}
        confirming={deletingFinalSummary}
        title="Delete Final Summary"
        confirmationText={`Are you sure you want to delete the final summary for ${finalSummaryToDelete?.studentEmail}? This action cannot be undone.`}
        askForTextInput={false}
      />

      <ConfirmationModal
        open={showBulkEvaluateConfirm}
        showSemiTransparentBg={true}
        onClose={() => {
          setShowBulkEvaluateConfirm(false);
          setSelectedStudentForEvaluation(null);
        }}
        onConfirm={handleConfirmBulkEvaluation}
        confirming={evaluatingAttempts.size > 0}
        title="Start AI Evaluation"
        confirmationText={`Are you sure you want to start AI evaluation for all completed attempts by ${selectedStudentForEvaluation?.email}? This will evaluate all unevaluated exercise attempts.`}
        askForTextInput={false}
      />

      {caseStudy && (
        <ViewCaseStudyInstructionsModal
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
      )}

      {selectedModule && (
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
      )}

      {selectedExercise && (
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
      )}
    </div>
  );
}
