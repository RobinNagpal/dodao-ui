'use client';

import Breadcrumbs from '@/components/ui/Breadcrumbs';
import InstructorNavbar from '@/components/navigation/InstructorNavbar';
import AttemptDetailModal from '@/components/shared/AttemptDetailModal';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { CaseStudyWithRelationsForInstructor, StudentDetailResponse } from '@/types/api';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { AlertCircle, BookOpen, Calendar, CheckCircle, ChevronDown, ChevronRight, Clock, GraduationCap, Layers, Mail, Target, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

interface StudentDetailsClientProps {
  caseStudyId: string;
  classEnrollmentId: string;
  studentEnrollmentId: string;
}

// Case study structure from case study API
type CaseStudyResponse = CaseStudyWithRelationsForInstructor;

export default function StudentDetailsClient({ caseStudyId, classEnrollmentId, studentEnrollmentId }: StudentDetailsClientProps): ReactElement | null {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);

  const router = useRouter();

  // API hook to fetch case study structure (modules, exercises)
  const { data: caseStudyData, loading: loadingCaseStudy } = useFetchData<CaseStudyResponse>(
    `/api/case-studies/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId },
    'Failed to load case study details'
  );

  // API hook to fetch student-specific data (attempts, enrollment info)
  const { data: studentDetails, loading: loadingStudentDetails } = useFetchData<StudentDetailResponse>(
    `/api/case-studies/${caseStudyId}/class-enrollments/${classEnrollmentId}/student-enrollments/${studentEnrollmentId}`,
    { skipInitialFetch: !studentEnrollmentId || !caseStudyId || !classEnrollmentId },
    'Failed to load student details'
  );

  const { session, renderAuthGuard } = useAuthGuard({
    allowedRoles: ['Instructor', 'Admin'],
    loadingType: 'instructor',
    loadingText: 'Loading Student Details',
    loadingSubtitle: 'Preparing detailed analysis...',
    additionalLoadingConditions: [loadingCaseStudy || loadingStudentDetails],
  });

  // Get attempt details from the main response (no need for separate API call)
  const attemptDetails = selectedAttemptId ? studentDetails?.attempts.find((attempt) => attempt.id === selectedAttemptId) || null : null;

  // Calculate statistics on UI side
  const statistics = (() => {
    if (!studentDetails || !caseStudyData) {
      return {
        totalExercises: 0,
        attemptedExercises: 0,
        totalAttempts: 0,
        completionPercentage: 0,
        averageScore: 0,
        completedExercises: 0,
      };
    }

    // Get all exercises from case study structure
    const allExercises = caseStudyData.modules?.flatMap((module) => module.exercises || []) || [];
    const totalExercises = allExercises.length;

    // Get attempted exercise IDs from student attempts
    const attemptedExerciseIds = [...new Set(studentDetails.attempts.map((attempt) => attempt.exerciseId))];
    const attemptedExercises = attemptedExerciseIds.length;

    const totalAttempts = studentDetails.attempts.length;

    const completedAttempts = studentDetails.attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'success');
    const completedExercises = completedAttempts.length;

    const completionPercentage = totalExercises > 0 ? Math.round((attemptedExercises / totalExercises) * 100) : 0;

    const attemptsWithScores = studentDetails.attempts.filter((attempt) => attempt.evaluatedScore !== null);
    const averageScore =
      attemptsWithScores.length > 0
        ? Math.round(attemptsWithScores.reduce((sum, attempt) => sum + (attempt.evaluatedScore || 0), 0) / attemptsWithScores.length)
        : 0;

    return {
      totalExercises,
      attemptedExercises,
      totalAttempts,
      completionPercentage,
      averageScore,
      completedExercises,
    };
  })();

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleAttemptClick = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
  };

  // Effect to show modal when attempt details are loaded
  useEffect(() => {
    if (attemptDetails && selectedAttemptId) {
      setShowAttemptModal(true);
    }
  }, [attemptDetails, selectedAttemptId]);

  const getStatusIcon = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const loadingGuard = renderAuthGuard();
  if (loadingGuard) return loadingGuard as ReactElement;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: caseStudyData?.title || 'Case Study', href: `/instructor/case-study/${caseStudyId}`, current: false },
    {
      name: studentDetails?.enrollment.className || 'Class Enrollment',
      href: `/instructor/case-study/${caseStudyId}/class-enrollments/${classEnrollmentId}`,
      current: false,
    },
    {
      name: studentDetails?.assignedStudent.name || studentDetails?.assignedStudent.email || 'Student',
      href: `/instructor/case-study/${caseStudyId}/class-enrollments/${classEnrollmentId}/student-enrollments/${studentEnrollmentId}`,
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
        title={studentDetails?.assignedStudent.name || studentDetails?.assignedStudent.email || 'Student Not Found'}
        subtitle={studentDetails ? studentDetails.enrollment.className : undefined}
        icon={<GraduationCap className="h-8 w-8 text-white" />}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <Breadcrumbs breadcrumbs={breadcrumbs} />

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6 mb-6 mt-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {(studentDetails?.assignedStudent.name || studentDetails?.assignedStudent.email || 'S')?.charAt(0).toUpperCase()}
                  </span>
                </div>
                {studentDetails?.finalScore != null && studentDetails.finalScore > 0 && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                    {studentDetails.finalScore}%
                  </div>
                )}
              </div>
              <div>
                {studentDetails?.assignedStudent.name && (
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <User className="h-4 w-4 mr-1.5 text-purple-600" />
                    {studentDetails.assignedStudent.name}
                  </h3>
                )}
                <p className="flex items-center text-sm text-gray-600">
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  {studentDetails?.assignedStudent.email}
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Enrolled: {new Date(studentDetails?.createdAt ?? '').toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {studentDetails?.enrollment.className}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl px-4 py-2 border border-purple-200">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-600"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray={`${statistics.completionPercentage}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900">{statistics.completionPercentage}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-700">Progress</p>
                  <p className="text-xs text-gray-600">
                    {statistics.attemptedExercises}/{statistics.totalExercises} exercises
                  </p>
                </div>
              </div>

              {studentDetails?.finalScore != null && studentDetails.finalScore > 0 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-xl shadow-lg">
                  <p className="text-xs font-medium">Final Score</p>
                  <p className="text-lg font-bold">{studentDetails.finalScore}%</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-1.5 rounded-lg mr-2">
              <Layers className="h-5 w-5 text-white" />
            </div>
            Modules & Exercise Attempts
          </h2>

          <div className="space-y-4">
            {caseStudyData?.modules?.map((module) => (
              <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full bg-gradient-to-br from-gray-50 to-purple-50 p-4 text-left hover:from-purple-50 hover:to-indigo-50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium text-center shadow whitespace-nowrap">
                        Module {module.orderNumber}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm whitespace-nowrap">
                        <span className="text-xs text-blue-600 font-medium">Attempted</span>
                        <span className="text-sm font-bold text-blue-900">
                          {(module.exercises || []).filter((exercise) => studentDetails?.attempts.some((attempt) => attempt.exerciseId === exercise.id)).length}
                          {' / '}
                          {(module.exercises || []).length}
                        </span>
                      </div>
                      {expandedModules.has(module.id) ? <ChevronDown className="h-6 w-6 text-gray-600" /> : <ChevronRight className="h-6 w-6 text-gray-600" />}
                    </div>
                  </div>
                </button>

                {expandedModules.has(module.id) && (
                  <div className="p-4 bg-gradient-to-br from-white to-gray-50/50 border-t border-gray-200">
                    <div className="space-y-4">
                      {(module.exercises || []).map((exercise) => (
                        <div key={exercise.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium text-center shadow whitespace-nowrap">
                                Exercise {exercise.orderNumber}
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-900">{exercise.title}</h5>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 bg-gradient-to-br from-orange-50 to-yellow-50 px-3 py-1.5 rounded-lg border border-orange-200 shadow-sm whitespace-nowrap">
                              <span className="text-xs text-orange-600 font-medium">Attempts</span>
                              <span className="text-sm font-bold text-orange-900">
                                {studentDetails?.attempts.filter((attempt) => attempt.exerciseId === exercise.id).length || 0}
                              </span>
                            </div>
                          </div>

                          {(() => {
                            const exerciseAttempts = studentDetails?.attempts.filter((attempt) => attempt.exerciseId === exercise.id) || [];
                            return exerciseAttempts.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {exerciseAttempts.map((attempt) => (
                                  <div key={attempt.id}>
                                    <button
                                      onClick={() => handleAttemptClick(attempt.id)}
                                      disabled={false}
                                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                                        attempt.status === 'completed' || attempt.status === 'success'
                                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100'
                                          : attempt.status === 'failed' || attempt.status === 'error'
                                          ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:from-red-100 hover:to-pink-100'
                                          : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:from-yellow-100 hover:to-orange-100'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center space-x-1.5">
                                          {getStatusIcon(attempt.status)}
                                          <span className="font-medium text-sm">Attempt {attempt.attemptNumber}</span>
                                        </div>
                                        {attempt.evaluatedScore !== null && (
                                          <div className="flex items-center space-x-1">
                                            <Target className="h-3.5 w-3.5 text-blue-600" />
                                            <span className="text-xs font-bold text-blue-900">{attempt.evaluatedScore}/10</span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex items-center justify-between">
                                        {attempt.status && (
                                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(attempt.status)}`}>
                                            {attempt.status}
                                          </span>
                                        )}
                                        <span className="text-[10px] text-gray-500">
                                          {new Date(attempt.createdAt).toLocaleDateString()},{' '}
                                          {new Date(attempt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    </button>

                                    {attempt.evaluationReasoning && (
                                      <details className="mt-1.5 group">
                                        <summary className="text-[11px] text-blue-600 font-medium cursor-pointer hover:text-blue-800 select-none px-1">
                                          View Evaluation
                                        </summary>
                                        <div className="mt-1 p-2 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-800 leading-relaxed max-h-32 overflow-y-auto">
                                          {attempt.evaluationReasoning}
                                        </div>
                                      </details>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 text-center shadow-inner">
                                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <h6 className="font-semibold text-gray-700 text-sm">No Attempts Yet</h6>
                                <p className="text-xs text-gray-600">Student hasn’t attempted this exercise</p>
                              </div>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
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
    </div>
  );
}
