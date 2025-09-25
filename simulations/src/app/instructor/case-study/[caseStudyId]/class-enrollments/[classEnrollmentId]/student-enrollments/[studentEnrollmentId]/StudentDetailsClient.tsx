'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import {
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Mail,
  Activity,
  Layers,
  Award,
  Target,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

import InstructorNavbar from '@/components/navigation/InstructorNavbar';
import BackButton from '@/components/navigation/BackButton';
import InstructorLoading from '@/components/instructor/InstructorLoading';
import AttemptDetailModal from '@/components/shared/AttemptDetailModal';
import { SimulationSession } from '@/types/user';
import { CaseStudyWithRelationsForInstructor, StudentDetailResponse } from '@/types/api';

interface StudentDetailsClientProps {
  caseStudyId: string;
  classEnrollmentId: string;
  studentEnrollmentId: string;
}

// Case study structure from case study API
type CaseStudyResponse = CaseStudyWithRelationsForInstructor;

export default function StudentDetailsClient({ caseStudyId, classEnrollmentId, studentEnrollmentId }: StudentDetailsClientProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);

  const router = useRouter();
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  // API hook to fetch case study structure (modules, exercises)
  const { data: caseStudyData, loading: loadingCaseStudy } = useFetchData<CaseStudyResponse>(
    `/api/case-studies/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId || !session },
    'Failed to load case study details'
  );

  // API hook to fetch student-specific data (attempts, enrollment info)
  const { data: studentDetails, loading: loadingStudentDetails } = useFetchData<StudentDetailResponse>(
    `/api/case-studies/${caseStudyId}/class-enrollments/${classEnrollmentId}/student-enrollments/${studentEnrollmentId}`,
    { skipInitialFetch: !studentEnrollmentId || !session || !caseStudyId || !classEnrollmentId },
    'Failed to load student details'
  );

  // Get attempt details from the main response (no need for separate API call)
  const attemptDetails = selectedAttemptId ? studentDetails?.attempts.find((attempt) => attempt.id === selectedAttemptId) || null : null;

  // Calculate statistics on UI side using useMemo
  const statistics = useMemo(() => {
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
  }, [studentDetails, caseStudyData]);

  const handleLogout = () => {
    router.push('/login');
  };

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
        return <Activity className="h-4 w-4 text-gray-500" />;
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

  if (!session || loadingCaseStudy || loadingStudentDetails) {
    return <InstructorLoading text="Loading Student Details" subtitle="Preparing detailed analysis..." variant="enhanced" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <InstructorNavbar
        title={studentDetails ? `${studentDetails.assignedStudent.email} - ${studentDetails.enrollment.className}` : 'Student Not Found'}
        userEmail={session?.email || ''}
        onLogout={handleLogout}
        icon={<GraduationCap className="h-8 w-8 text-white" />}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <BackButton userType="instructor" text="Back to Case Study" href={`/instructor/case-study/${caseStudyId}/class-enrollments/${classEnrollmentId}`} />

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/40 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full w-20 h-20 flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-2xl">
                    {(studentDetails?.assignedStudent.name || studentDetails?.assignedStudentId)?.charAt(0).toUpperCase()}
                  </span>
                </div>
                {studentDetails?.finalScore && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    {studentDetails.finalScore}%
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {studentDetails?.assignedStudent.email && (
                  <p className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {studentDetails.assignedStudent.email}
                  </p>
                )}
                <p className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Enrolled: {new Date(studentDetails?.createdAt ?? '').toLocaleDateString()}
                </p>
                <p className="flex items-center text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Class: <span className="font-semibold text-purple-600 ml-1">{studentDetails?.enrollment.className}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-600"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray={`${statistics.completionPercentage}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">{statistics.completionPercentage}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Progress</p>
              </div>
              {studentDetails?.finalScore && (
                <div className="text-center">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-xl">
                    <div>
                      <div className="text-lg font-bold">{studentDetails.finalScore}</div>
                      <div className="text-xs">Final Score</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Attempted</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mb-1">{statistics.attemptedExercises}</p>
              <p className="text-xs text-green-600">out of {statistics.totalExercises} exercises</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Total Attempts</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mb-1">{statistics.totalAttempts}</p>
              <p className="text-xs text-blue-600">across all exercises</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">Progress Rate</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mb-1">{statistics.completionPercentage}%</p>
              <p className="text-xs text-purple-600">completion</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-800">Completed</span>
              </div>
              <p className="text-2xl font-bold text-indigo-900 mb-1">{statistics.completedExercises}</p>
              <p className="text-xs text-indigo-600">successful attempts</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/40 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-xl mr-3">
              <Layers className="h-6 w-6 text-white" />
            </div>
            Modules & Exercise Attempts
          </h2>

          <div className="space-y-6">
            {caseStudyData?.modules?.map((module) => (
              <div key={module.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full bg-gradient-to-br from-gray-50 to-purple-50 p-6 text-left hover:from-purple-50 hover:to-indigo-50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-medium min-w-[90px] text-center shadow-lg">
                        Module
                        <span className="block text-xs font-semibold">{module.orderNumber}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                        <p className="text-gray-600 mt-1">{module.shortDescription}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                        <p className="text-xs text-blue-600 font-medium">Attempted</p>
                        <p className="text-lg font-bold text-blue-900">
                          {(module.exercises || []).filter((exercise) => studentDetails?.attempts.some((attempt) => attempt.exerciseId === exercise.id)).length}{' '}
                          / {(module.exercises || []).length}
                        </p>
                      </div>
                      {expandedModules.has(module.id) ? <ChevronDown className="h-6 w-6 text-gray-600" /> : <ChevronRight className="h-6 w-6 text-gray-600" />}
                    </div>
                  </div>
                </button>

                {expandedModules.has(module.id) && (
                  <div className="p-6 bg-gradient-to-br from-white to-gray-50/50 border-t border-gray-200">
                    <div className="space-y-6">
                      {(module.exercises || []).map((exercise) => (
                        <div key={exercise.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-medium min-w-[100px] text-center shadow-lg">
                                Exercise
                                <span className="block text-xs font-semibold">{exercise.orderNumber}</span>
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-900 text-lg">{exercise.title}</h5>
                                <p className="text-sm text-gray-600 mt-1">{exercise.details.substring(0, 100)}...</p>
                              </div>
                            </div>
                            <div className="text-center bg-gradient-to-br from-orange-50 to-yellow-50 px-4 py-2 rounded-lg border border-orange-200 min-w-[90px] shadow-sm">
                              <p className="text-xs text-orange-600 font-medium">Attempts</p>
                              <p className="text-lg font-bold text-orange-900">
                                {studentDetails?.attempts.filter((attempt) => attempt.exerciseId === exercise.id).length || 0}
                              </p>
                            </div>
                          </div>

                          {(() => {
                            const exerciseAttempts = studentDetails?.attempts.filter((attempt) => attempt.exerciseId === exercise.id) || [];
                            return exerciseAttempts.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {exerciseAttempts.map((attempt) => (
                                  <div key={attempt.id} className="relative">
                                    <button
                                      onClick={() => handleAttemptClick(attempt.id)}
                                      disabled={false}
                                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                                        attempt.status === 'completed' || attempt.status === 'success'
                                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100'
                                          : attempt.status === 'failed' || attempt.status === 'error'
                                          ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:from-red-100 hover:to-pink-100'
                                          : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:from-yellow-100 hover:to-orange-100'
                                      }`}
                                    >
                                      <div className="flex items-center justify-center space-x-2 mb-2">
                                        {getStatusIcon(attempt.status)}
                                        <span className="font-medium text-sm">Attempt {attempt.attemptNumber}</span>
                                      </div>

                                      {attempt.evaluatedScore !== null && (
                                        <div className="mb-2">
                                          <div className="flex items-center justify-center space-x-1">
                                            <Target className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-bold text-blue-900">Score: {attempt.evaluatedScore}/10</span>
                                          </div>
                                        </div>
                                      )}

                                      {attempt.status && (
                                        <div className="mb-2">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(attempt.status)}`}>
                                            {attempt.status}
                                          </span>
                                        </div>
                                      )}

                                      <div className="text-xs text-gray-600 text-center">
                                        <div>{new Date(attempt.createdAt).toLocaleDateString()}</div>
                                        <div>{new Date(attempt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                      </div>
                                    </button>

                                    {attempt.evaluationReasoning && (
                                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-xs text-blue-800 font-medium mb-1">Evaluation:</p>
                                        <p className="text-xs text-blue-700">{attempt.evaluationReasoning.substring(0, 100)}...</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 border border-gray-200 text-center shadow-inner">
                                <div className="text-gray-400 mb-3">
                                  <Clock className="h-10 w-10 mx-auto mb-2" />
                                </div>
                                <h6 className="font-semibold text-gray-700 mb-1">No Attempts Yet</h6>
                                <p className="text-sm text-gray-600">Student hasn’t attempted this exercise</p>
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
