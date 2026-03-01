'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Trash2, Check, Minus, X, Star, Loader2, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import AttemptDetailModal from '@/components/shared/AttemptDetailModal';
import ViewAiResponseModal from '@/components/student/ViewAiResponseModal';
import FinalReportDownloadModal from '@/components/shared/FinalReportDownloadModal';
import { buildFinalReportMarkdown } from '@/utils/final-report-utils';
import type { FinalReportData } from '@/utils/final-report-utils';
import type { ExerciseAttempt } from '@prisma/client';
import type { StudentTableData, ModuleTableData } from '@/types';

interface StudentTableProps {
  students: StudentTableData[];
  modules: ModuleTableData[];
  classEnrollmentId: string;
  caseStudyId: string;
  userType?: 'admin' | 'instructor';
  onClearStudentAttempts: (studentId: string, studentEmail: string) => void;
  onDeleteAttempt: (attemptId: string, studentId: string, studentEmail: string, exerciseTitle: string) => void;
  onEvaluateAttempt?: (attemptId: string, exerciseId: string, studentId: string) => void;
  onStartBulkEvaluation?: (studentId: string, studentEmail: string) => void;
  clearingAttempts: boolean;
  deletingAttempt: boolean;
  evaluatingAttempts?: Set<string>;
}

const basePathFromUserType = (userType: 'admin' | 'instructor') => (userType === 'admin' ? '/admin' : '/instructor');

export default function StudentTable({
  students,
  modules,
  classEnrollmentId,
  caseStudyId,
  userType = 'instructor',
  onClearStudentAttempts,
  onDeleteAttempt,
  onEvaluateAttempt,
  onStartBulkEvaluation,
  clearingAttempts,
  deletingAttempt,
  evaluatingAttempts,
}: StudentTableProps) {
  const basePath = basePathFromUserType(userType);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);
  const [selectedFinalSummary, setSelectedFinalSummary] = useState<{
    id: string;
    response: string;
  } | null>(null);
  const [showFinalSummaryModal, setShowFinalSummaryModal] = useState(false);
  const [selectedEvaluationReasoning, setSelectedEvaluationReasoning] = useState<string | null>(null);
  const [showEvaluationReasoningModal, setShowEvaluationReasoningModal] = useState(false);

  // State for student report modals
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // API hook to fetch attempt details
  const { data: attemptDetails, loading: loadingAttemptDetails } = useFetchData<ExerciseAttempt>(
    selectedAttemptId ? `/api/student/attempts/${selectedAttemptId}` : '',
    { skipInitialFetch: !selectedAttemptId },
    'Failed to load attempt details'
  );

  // API hook to fetch report data for view
  const {
    data: viewReportData,
    loading: loadingViewReport,
    reFetchData: refetchViewReport,
  } = useFetchData<FinalReportData>(
    selectedStudentForReport && !showDownloadModal ? `/api/instructor/students/${selectedStudentForReport}/final-report/${caseStudyId}` : '',
    { skipInitialFetch: true },
    'Failed to load report data'
  );

  const handleAttemptClick = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
  };

  const handleEvaluationReasoningClick = (evaluationReasoning: string) => {
    setSelectedEvaluationReasoning(evaluationReasoning);
    setShowEvaluationReasoningModal(true);
  };

  const handleViewReport = (studentId: string) => {
    setSelectedStudentForReport(studentId);
  };

  const handleDownloadReport = (studentId: string) => {
    setSelectedStudentForReport(studentId);
    setShowDownloadModal(true);
  };

  // Effect to trigger view report fetch when student is selected (not for download)
  useEffect(() => {
    if (selectedStudentForReport && !showDownloadModal) {
      refetchViewReport();
    }
  }, [selectedStudentForReport, showDownloadModal]);

  // Effect to show view modal when report data is loaded
  useEffect(() => {
    if (viewReportData && selectedStudentForReport && !showDownloadModal) {
      const markdown = buildFinalReportMarkdown(viewReportData);
      setSelectedFinalSummary({ id: selectedStudentForReport, response: markdown });
      setShowFinalSummaryModal(true);
    }
  }, [viewReportData, selectedStudentForReport, showDownloadModal]);

  // Effect to show modal when attempt details are loaded
  useEffect(() => {
    if (attemptDetails && selectedAttemptId) {
      setShowAttemptModal(true);
    }
  }, [attemptDetails, selectedAttemptId]);

  if (students.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-12">
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-gray-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Eye className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Students Enrolled</h3>
          <p className="text-gray-600">This case study doesn’t have any enrolled students yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 overflow-hidden">
      {/* Table Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Progress Overview</h3>
        <p className="text-gray-600">Click on attempt numbers and final report to view details</p>
      </div>

      {/* Table Container with horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
            <tr>
              {/* Student Name Column */}
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gradient-to-r from-purple-50 to-indigo-50 z-10 border-r border-gray-200 min-w-[150px]">
                Student Name
              </th>

              {/* Module and Exercise Columns */}
              {modules.map((module) => (
                <th
                  key={module.id}
                  className="px-2 py-4 text-center text-sm font-semibold text-gray-900 border-l border-gray-200"
                  colSpan={module.exercises.length}
                >
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg px-3 py-1">Module {module.orderNumber}</div>
                </th>
              ))}

              {/* Final Summary Column */}
              <th className="px-2 py-4 text-center text-sm font-semibold text-gray-900 border-l border-gray-200 min-w-[100px]">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg px-3 py-1">Report</div>
              </th>

              {/* Actions Column */}
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 border-l border-gray-200 min-w-[160px]">Actions</th>
            </tr>

            {/* Sub-header for exercises */}
            <tr className="bg-gradient-to-r from-purple-25 to-indigo-25">
              <th className="px-4 py-2 sticky left-0 bg-gradient-to-r from-purple-25 to-indigo-25 z-10 border-r border-gray-200"></th>

              {modules.map((module) =>
                module.exercises.map((exercise) => (
                  <th key={exercise.id} className="px-1 py-2 text-center text-xs font-medium text-gray-700 border-l border-gray-100 min-w-[80px]">
                    <div className="truncate" title={`Exercise ${exercise.orderNumber}: ${exercise.title}`}>
                      Ex {exercise.orderNumber}
                    </div>
                  </th>
                ))
              )}

              {/* Final Summary Sub-header */}
              <th className="px-1 py-2 text-center text-xs font-medium text-gray-700 border-l border-gray-100 min-w-[100px]">
                <div className="truncate" title="Final Summary">
                  Final Report
                </div>
              </th>

              <th className="px-4 py-2 border-l border-gray-200"></th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-purple-50/50 transition-colors duration-200">
                {/* Student Name */}
                <td className="px-4 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white/80 backdrop-blur-sm z-10 border-r border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Link
                        href={`${basePath}/case-study/${caseStudyId}/class-enrollments/${classEnrollmentId}/student-enrollments/${student.id}`}
                        className="group flex items-center space-x-2 w-full text-left transition-all duration-200 hover:text-purple-600 cursor-pointer"
                        title={`View details for ${student.name || student.email}`}
                      >
                        <div
                          className="font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors duration-200"
                          title={student.name || student.email}
                        >
                          {student.name || student.email}
                        </div>
                        <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-purple-600 transition-all duration-200 group-hover:scale-110" />
                      </Link>
                    </div>
                  </div>
                </td>

                {/* Exercise Columns */}
                {modules.map((module) =>
                  module.exercises.map((exercise) => {
                    const exerciseProgress = student.exercises.find((ex) => ex.exerciseId === exercise.id);

                    return (
                      <td key={exercise.id} className="px-1 py-2 text-center border-l border-gray-100">
                        <div className="flex flex-col items-center space-y-1">
                          {/* Completion Status Icon */}
                          <div className="mb-1">
                            {exerciseProgress?.hasAttempts ? <Check className="h-4 w-4 text-green-600" /> : <Minus className="h-4 w-4 text-gray-400" />}
                          </div>

                          {/* Attempt Numbers and Delete Icons */}
                          {exerciseProgress?.attempts && exerciseProgress.attempts.length > 0 && (
                            <div className="flex flex-col items-center space-y-1">
                              {/* Attempt Numbers */}
                              <div className="flex flex-wrap gap-1 justify-center">
                                {exerciseProgress.attempts.map((attempt) => (
                                  <button
                                    key={attempt.id}
                                    onClick={() => handleAttemptClick(attempt.id)}
                                    disabled={loadingAttemptDetails && selectedAttemptId === attempt.id}
                                    className={`w-6 h-6 rounded-full text-xs font-bold transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                                      attempt.status === 'completed'
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : attempt.status === 'failed'
                                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                    }`}
                                    title={`Attempt ${attempt.attemptNumber} - ${attempt.status || 'pending'}`}
                                  >
                                    {attempt.attemptNumber}
                                  </button>
                                ))}
                              </div>

                              {/* Delete Icons */}
                              <div className="flex flex-wrap gap-1 justify-center">
                                {exerciseProgress.attempts.map((attempt) => (
                                  <button
                                    key={`delete-${attempt.id}`}
                                    onClick={() => onDeleteAttempt(attempt.id, student.id, student.email, exercise.title)}
                                    disabled={deletingAttempt}
                                    className="w-6 h-6 text-red-600 hover:text-red-800 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    title={`Delete attempt ${attempt.attemptNumber}`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                ))}
                              </div>

                              {/* Evaluation Scores and Buttons */}
                              <div className="flex flex-wrap gap-1 justify-center">
                                {exerciseProgress.attempts.map((attempt) => (
                                  <div key={`eval-${attempt.id}`} className="flex flex-col items-center space-y-1">
                                    {/* Evaluation Score Display */}
                                    {attempt.evaluatedScore !== null ? (
                                      <button
                                        onClick={() => handleEvaluationReasoningClick(attempt.evaluationReasoning || 'No evaluation reasoning available.')}
                                        className="w-8 h-4 rounded text-xs font-bold flex items-center justify-center bg-purple-100 text-purple-800 hover:bg-purple-200 transition-all duration-200 cursor-pointer"
                                        title={`AI Score: ${attempt.evaluatedScore}/10 - Click to see reasoning`}
                                      >
                                        {attempt.evaluatedScore}/10
                                      </button>
                                    ) : attempt.status === 'completed' && onEvaluateAttempt ? (
                                      <button
                                        onClick={() => onEvaluateAttempt(attempt.id, exercise.id, student.id)}
                                        disabled={evaluatingAttempts?.has(attempt.id)}
                                        className="w-6 h-4 rounded text-xs flex items-center justify-center bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={evaluatingAttempts?.has(attempt.id) ? 'Evaluating...' : 'Click to evaluate'}
                                      >
                                        {evaluatingAttempts?.has(attempt.id) ? <Loader2 className="h-2 w-2 animate-spin" /> : 'AI'}
                                      </button>
                                    ) : (
                                      <div className="w-6 h-4 rounded text-xs flex items-center justify-center bg-gray-100 text-gray-400">-</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })
                )}

                {/* Final Summary Column */}
                <td className="px-1 py-2 text-center border-l border-gray-100">
                  <div className="flex flex-col items-center space-y-2">
                    {/* View and Download Icons - Always show */}
                    <div className="flex items-center space-x-2">
                      {/* View Report Button */}
                      <button
                        onClick={() => handleViewReport(student.id)}
                        disabled={loadingViewReport && selectedStudentForReport === student.id && !showDownloadModal}
                        className="w-6 h-6 rounded-full text-xs font-bold transition-all duration-200 hover:scale-110 bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center justify-center disabled:opacity-50"
                        title="View Final Report"
                      >
                        {loadingViewReport && selectedStudentForReport === student.id && !showDownloadModal ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </button>

                      {/* Download Report Button */}
                      <button
                        onClick={() => handleDownloadReport(student.id)}
                        className="w-6 h-6 rounded-full text-xs font-bold transition-all duration-200 hover:scale-110 bg-green-100 text-green-800 hover:bg-green-200 flex items-center justify-center"
                        title="Download Final Report"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center space-x-2">
                    {onStartBulkEvaluation && (
                      <Button
                        size="sm"
                        onClick={() => onStartBulkEvaluation(student.id, student.email)}
                        disabled={evaluatingAttempts?.size ? evaluatingAttempts.size > 0 : false}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Evaluate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => onClearStudentAttempts(student.id, student.email)}
                      disabled={clearingAttempts}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attempt Detail Modal */}
      <AttemptDetailModal
        isOpen={showAttemptModal}
        onClose={() => {
          setShowAttemptModal(false);
          setSelectedAttemptId(null);
        }}
        attempt={attemptDetails || null}
      />

      {/* Final Summary Modal */}
      {selectedFinalSummary && (
        <ViewAiResponseModal
          open={showFinalSummaryModal}
          onClose={() => {
            setShowFinalSummaryModal(false);
            setSelectedFinalSummary(null);
          }}
          aiResponse={selectedFinalSummary.response || 'No summary content available.'}
        />
      )}

      {/* Evaluation Reasoning Modal */}
      <ViewAiResponseModal
        open={showEvaluationReasoningModal}
        onClose={() => {
          setShowEvaluationReasoningModal(false);
          setSelectedEvaluationReasoning(null);
        }}
        aiResponse={selectedEvaluationReasoning || 'No evaluation reasoning available.'}
      />

      {/* Final Report Download Modal */}
      <FinalReportDownloadModal
        open={showDownloadModal}
        onClose={() => {
          setShowDownloadModal(false);
          setSelectedStudentForReport(null);
        }}
        studentId={selectedStudentForReport}
        caseStudyId={caseStudyId}
      />
    </div>
  );
}
