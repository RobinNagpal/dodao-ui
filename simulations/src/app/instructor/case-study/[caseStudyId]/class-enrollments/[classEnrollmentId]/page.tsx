'use client';

import React from 'react';
import { SimulationSession } from '@/types/user';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import type { ModuleTableData, StudentTableData } from '@/types';
import type { DeleteResponse } from '@/types/api';
import { GraduationCap } from 'lucide-react';
import InstructorNavbar from '@/components/navigation/InstructorNavbar';
import BackButton from '@/components/navigation/BackButton';
import InstructorLoading from '@/components/instructor/InstructorLoading';
import StudentTable from '@/components/instructor/StudentTable';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

interface EnrollmentStudentProgressPageProps {
  params: Promise<{
    caseStudyId: string;
    classEnrollmentId: string;
  }>;
}

export default function EnrollmentStudentProgressPage({ params }: EnrollmentStudentProgressPageProps) {
  const resolvedParams = React.use(params);
  const { caseStudyId, classEnrollmentId } = resolvedParams;

  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;
  const router = useRouter();

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

  // Fetch student table data for this specific enrollment
  const {
    data: studentsTableData,
    loading: loadingStudentsTable,
    reFetchData: refetchStudentsTable,
  } = useFetchData<{
    students: StudentTableData[];
    modules: ModuleTableData[];
  }>(
    `${getBaseUrl()}/api/case-studies/${caseStudyId}/class-enrollments/${classEnrollmentId}/students`,
    { skipInitialFetch: !caseStudyId || !classEnrollmentId || !session },
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
    { evaluatedScore: number; evaluationReasoning: string; finalScore: number },
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
      setEvaluatingAttempts((prev) => new Set([...prev, attemptId]));

      const url = `/api/instructor/exercises/${exerciseId}/evaluate`;
      await evaluateAttempt(url, { studentId, attemptId });

      // Refresh students data to show updated scores
      await refetchStudentsTable();
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

  if (!session || (session.role !== 'Instructor' && session.role !== 'Admin')) {
    return <div>You are not authorized to access this page</div>;
  }

  if (loadingStudentsTable) {
    return <InstructorLoading text="Loading Student Progress" subtitle="Preparing enrollment progress table..." variant="enhanced" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <InstructorNavbar
        title="Class Enrollment Progress"
        subtitle="Student Progress Management"
        onLogout={handleLogout}
        icon={<GraduationCap className="h-8 w-8 text-white" />}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <BackButton userType="instructor" text="Back to Case Study" href={`/instructor/case-study/${caseStudyId}`} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {studentsTableData && (
          <StudentTable
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
