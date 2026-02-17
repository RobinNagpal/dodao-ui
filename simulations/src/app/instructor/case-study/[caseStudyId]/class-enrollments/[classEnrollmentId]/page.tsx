'use client';

import StudentTable from '@/components/instructor/StudentTable';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import InstructorNavbar from '@/components/navigation/InstructorNavbar';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import type { AttemptDetail, ExerciseProgress, ModuleTableData, StudentTableData } from '@/types';
import type { CaseStudyWithRelationsForInstructor, ClassEnrollmentResponse, DeleteResponse } from '@/types/api';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ManageStudentsTab from '@/components/instructor/case-study-tabs/ManageStudentsTab';
import InstructorActivityLogs from '@/components/instructor/InstructorActivityLogs';
import { GraduationCap, Users, ClipboardList, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { FC, useState } from 'react';

export type TabType = 'manage-students' | 'student-attempts' | 'activity-logs';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation: FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-white/20">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => onTabChange('student-attempts')}
          className={`py-4 px-2 pb-2 relative font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
            activeTab === 'student-attempts'
              ? 'text-purple-600 bg-purple-50/50 rounded-t-lg after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500'
              : 'text-gray-600 hover:text-purple-600 hover:after:absolute hover:after:bottom-1 hover:after:left-0 hover:after:right-0 hover:after:h-0.5 hover:after:bg-purple-300'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Student Attempts</span>
        </button>
        <button
          onClick={() => onTabChange('manage-students')}
          className={`py-4 px-2 pb-2 relative font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
            activeTab === 'manage-students'
              ? 'text-purple-600 bg-purple-50/50 rounded-t-lg after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500'
              : 'text-gray-600 hover:text-purple-600 hover:after:absolute hover:after:bottom-1 hover:after:left-0 hover:after:right-0 hover:after:h-0.5 hover:after:bg-purple-300'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Manage Students</span>
        </button>
        <button
          onClick={() => onTabChange('activity-logs')}
          className={`py-4 px-2 pb-2 relative font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
            activeTab === 'activity-logs'
              ? 'text-purple-600 bg-purple-50/50 rounded-t-lg after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500'
              : 'text-gray-600 hover:text-purple-600 hover:after:absolute hover:after:bottom-1 hover:after:left-0 hover:after:right-0 hover:after:h-0.5 hover:after:bg-purple-300'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Activity Logs</span>
        </button>
      </nav>
    </div>
  );
};

interface EnrollmentStudentProgressPageProps {
  params: Promise<{
    caseStudyId: string;
    classEnrollmentId: string;
  }>;
}

export default function EnrollmentStudentProgressPage({ params }: EnrollmentStudentProgressPageProps) {
  const resolvedParams = React.use(params);
  const { caseStudyId, classEnrollmentId } = resolvedParams;

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('student-attempts');
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
  const [evaluatingAttempts, setEvaluatingAttempts] = useState<Set<string>>(new Set());
  const [showBulkEvaluateConfirm, setShowBulkEvaluateConfirm] = useState(false);
  const [selectedStudentForEvaluation, setSelectedStudentForEvaluation] = useState<{
    id: string;
    email: string;
  } | null>(null);

  // Fetch case study structure (modules, exercises)
  const { data: caseStudyData, loading: loadingCaseStudy } = useFetchData<CaseStudyWithRelationsForInstructor>(
    `${getBaseUrl()}/api/case-studies/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId },
    'Failed to load case study details'
  );

  // Fetch student data (attempts, final summaries)
  const {
    data: studentsData,
    loading: loadingStudentsData,
    reFetchData: refetchStudentsData,
  } = useFetchData<ClassEnrollmentResponse>(
    `${getBaseUrl()}/api/case-studies/${caseStudyId}/class-enrollments/${classEnrollmentId}/student-enrollments?student-details=true`,
    { skipInitialFetch: !caseStudyId || !classEnrollmentId },
    'Failed to load students data'
  );

  const { renderAuthGuard } = useAuthGuard({
    allowedRoles: ['Instructor', 'Admin'],
    loadingType: 'instructor',
    loadingText: 'Loading Student Progress',
    loadingSubtitle: 'Preparing enrollment progress table...',
    additionalLoadingConditions: [loadingCaseStudy || loadingStudentsData],
  });

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
    { evaluatedScore: number; evaluationReasoning: string; finalScore: number },
    { studentId: string; attemptId: string }
  >({
    successMessage: 'Exercise attempt evaluated successfully!',
    errorMessage: 'Failed to evaluate exercise attempt',
  });

  // Transform data on UI side - combine case study structure with student data
  const studentsTableData = (() => {
    if (!caseStudyData || !studentsData) {
      return null;
    }

    // Build modules data for table headers
    const modules: ModuleTableData[] =
      caseStudyData.modules?.map((module) => ({
        id: module.id,
        orderNumber: module.orderNumber,
        title: module.title,
        exercises: (module.exercises || []).map((exercise) => ({
          id: exercise.id,
          orderNumber: exercise.orderNumber,
          title: exercise.title,
        })),
      })) || [];

    // Transform student data to match StudentTableData interface
    const students: StudentTableData[] = studentsData.students.map((student) => {
      // Group attempts by exercise ID
      const attemptsByExercise = student.attempts.reduce((acc, attempt) => {
        if (!acc[attempt.exerciseId]) {
          acc[attempt.exerciseId] = [];
        }
        acc[attempt.exerciseId].push({
          id: attempt.id,
          attemptNumber: attempt.attemptNumber,
          status: attempt.status,
          evaluatedScore: attempt.evaluatedScore,
          evaluationReasoning: attempt.evaluationReasoning,
          createdAt: attempt.createdAt instanceof Date ? attempt.createdAt.toISOString() : attempt.createdAt,
        });
        return acc;
      }, {} as Record<string, AttemptDetail[]>);

      // Build exercise progress data
      const exercises: ExerciseProgress[] = (caseStudyData.modules || []).flatMap((module) =>
        (module.exercises || []).map((exercise) => ({
          exerciseId: exercise.id,
          moduleId: module.id,
          moduleOrderNumber: module.orderNumber,
          exerciseOrderNumber: exercise.orderNumber,
          hasAttempts: !!attemptsByExercise[exercise.id]?.length,
          attempts: attemptsByExercise[exercise.id] || [],
        }))
      );

      return {
        id: student.id,
        assignedStudentId: student.assignedStudentId,
        name: student.assignedStudent.name || student.assignedStudent.email || 'Unknown',
        email: student.assignedStudent.email || 'Unknown',
        enrollmentId: student.enrollmentId,
        exercises,
        finalSummary: student.finalSummary
          ? {
              id: student.finalSummary.id,
              status: student.finalSummary.status,
              hasContent: !!student.finalSummary.response,
              response: student.finalSummary.response,
              createdAt: student.finalSummary.createdAt instanceof Date ? student.finalSummary.createdAt.toISOString() : student.finalSummary.createdAt,
            }
          : undefined,
        createdAt: student.createdAt instanceof Date ? student.createdAt.toISOString() : student.createdAt,
      };
    });

    return {
      students: students.sort((a, b) => a.assignedStudentId.localeCompare(b.assignedStudentId)),
      modules,
    };
  })();

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
      setEvaluatingAttempts((prev) => new Set([...prev, attemptId]));

      const url = `/api/instructor/exercises/${exerciseId}/evaluate`;
      await evaluateAttempt(url, { studentId, attemptId });

      // Refresh students data to show updated scores
      await refetchStudentsData();
    } catch (error) {
      console.error('Error evaluating attempt:', error);
    } finally {
      setEvaluatingAttempts((prev) => {
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

    const student = studentsTableData.students.find((s) => s.id === selectedStudentForEvaluation.id);
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
              await new Promise((resolve) => setTimeout(resolve, 500));
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
      await refetchStudentsData();
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
      await refetchStudentsData();
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
      await refetchStudentsData();
      setShowDeleteFinalSummaryConfirm(false);
      setFinalSummaryToDelete(null);
    } catch (error: unknown) {
      console.error('Error deleting final summary:', error);
    }
  };

  const loadingGuard = renderAuthGuard();
  if (loadingGuard) return loadingGuard;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: caseStudyData?.title || 'Case Study', href: `/instructor/case-study/${caseStudyId}`, current: false },
    {
      name: studentsData?.className || 'Class Enrollment',
      href: `/instructor/case-study/${caseStudyId}/class-enrollments/${classEnrollmentId}`,
      current: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <InstructorNavbar
        title={studentsData?.className || 'Class Enrollment'}
        subtitle="Students Details"
        icon={<GraduationCap className="h-8 w-8 text-white" />}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <Breadcrumbs breadcrumbs={breadcrumbs} />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-4">
        {activeTab === 'manage-students' && <ManageStudentsTab caseStudyId={caseStudyId} classEnrollmentId={classEnrollmentId} />}

        {activeTab === 'student-attempts' && studentsTableData && (
          <StudentTable
            students={studentsTableData.students}
            modules={studentsTableData.modules}
            classEnrollmentId={classEnrollmentId}
            caseStudyId={caseStudyId}
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

        {activeTab === 'activity-logs' && studentsTableData && (
          <InstructorActivityLogs classEnrollmentId={classEnrollmentId} modules={studentsTableData.modules} />
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
    </div>
  );
}
