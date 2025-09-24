'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import {
  Brain,
  User,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Mail,
  Activity,
  Layers,
} from 'lucide-react';

import InstructorNavbar from '@/components/navigation/InstructorNavbar';
import BackButton from '@/components/navigation/BackButton';
import InstructorLoading from '@/components/instructor/InstructorLoading';
import AttemptDetailModal from '@/components/shared/AttemptDetailModal';
import type { ExerciseAttempt } from '@prisma/client';
import { SimulationSession } from '@/types/user';

interface StudentDetailsClientProps {
  caseStudyId: string;
  studentId: string;
}

interface ExerciseAttemptDetail {
  id: string;
  attemptNumber: number;
  model: string | null;
  prompt: string | null;
  promptResponse: string | null;
  status: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ExerciseDetail {
  id: string;
  title: string;
  details: string;
  orderNumber: number;
  attempts: ExerciseAttemptDetail[];
}

interface ModuleDetail {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  orderNumber: number;
  exercises: ExerciseDetail[];
}

interface StudentDetailResponse {
  student: {
    id: string;
    assignedStudentId: string;
    enrollmentId: string;
    createdAt: string;
  };
  caseStudy: {
    id: string;
    title: string;
    shortDescription: string;
  };
  modules: ModuleDetail[];
  statistics: {
    totalExercises: number;
    attemptedExercises: number;
    totalAttempts: number;
    completionPercentage: number;
  };
}

export default function StudentDetailsClient({ caseStudyId, studentId }: StudentDetailsClientProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);

  const router = useRouter();
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  // API hook to fetch student details
  const { data: studentDetails, loading: loadingDetails } = useFetchData<StudentDetailResponse>(
    `/api/instructor/students/${studentId}/details?caseStudyId=${caseStudyId}`,
    { skipInitialFetch: !studentId || !session || !caseStudyId },
    'Failed to load student details'
  );

  // API hook to fetch attempt details
  const { data: attemptDetails, loading: loadingAttemptDetails } = useFetchData<ExerciseAttempt>(
    selectedAttemptId ? `/api/student/attempts/${selectedAttemptId}` : '',
    { skipInitialFetch: !selectedAttemptId },
    'Failed to load attempt details'
  );

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

  if (!session || loadingDetails) {
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
        title={studentDetails ? `${studentDetails.student.assignedStudentId} - Student Details` : 'Student Not Found'}
        subtitle={studentDetails?.caseStudy.title}
        userEmail={session?.email || ''}
        onLogout={handleLogout}
        icon={<User className="h-8 w-8 text-white" />}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <BackButton userType="instructor" text="Back to Case Study" href={`/instructor/case-study/${caseStudyId}`} />

        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{studentDetails?.student.assignedStudentId.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center">
                  <Mail className="h-4 w-4 text-purple-600 mr-2" />
                  {studentDetails?.student.assignedStudentId}
                </h1>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Enrolled: {new Date(studentDetails?.student.createdAt ?? '').toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
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
                    strokeDasharray={`${studentDetails?.statistics.completionPercentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">{studentDetails?.statistics.completionPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Completed Exercises</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mb-1">{studentDetails?.statistics.attemptedExercises}</p>
              <p className="text-xs text-green-600">out of {studentDetails?.statistics.totalExercises} total</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Total Attempts</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mb-1">{studentDetails?.statistics.totalAttempts}</p>
              <p className="text-xs text-blue-600">across all exercises</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">Progress Rate</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mb-1">{studentDetails?.statistics.completionPercentage}%</p>
              <p className="text-xs text-purple-600">completion</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-xl mr-3">
              <Layers className="h-6 w-6 text-white" />
            </div>
            Modules & Exercise Attempts
          </h2>

          <div className="space-y-6">
            {studentDetails?.modules.map((module) => (
              <div key={module.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full bg-gradient-to-br from-gray-50 to-purple-50 p-6 text-left hover:from-purple-50 hover:to-indigo-50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-medium min-w-[80px] text-center">
                        Module
                        <span className="block text-xs font-semibold">{module.orderNumber}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                        <p className="text-gray-600 mt-1">{module.shortDescription}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-600 font-medium">Attempted</p>
                        <p className="text-lg font-bold text-blue-900">
                          {module.exercises.filter((ex) => ex.attempts.length > 0).length} / {module.exercises.length}
                        </p>
                      </div>
                      {expandedModules.has(module.id) ? <ChevronDown className="h-6 w-6 text-gray-600" /> : <ChevronRight className="h-6 w-6 text-gray-600" />}
                    </div>
                  </div>
                </button>

                {expandedModules.has(module.id) && (
                  <div className="p-6 bg-white border-t border-gray-200">
                    <div className="space-y-6">
                      {module.exercises.map((exercise) => (
                        <div key={exercise.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-xl text-sm font-medium min-w-[90px] text-center">
                                Exercise
                                <span className="block text-xs font-semibold">{exercise.orderNumber}</span>
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-900">{exercise.title}</h5>
                              </div>
                            </div>
                            <div className="text-center bg-gradient-to-br from-orange-50 to-yellow-50 px-3 py-2 rounded-lg border border-orange-200 min-w-[80px]">
                              <p className="text-xs text-orange-600 font-medium">Attempts</p>
                              <p className="text-lg font-bold text-orange-900">{exercise.attempts.length}</p>
                            </div>
                          </div>

                          {exercise.attempts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {exercise.attempts.map((attempt) => (
                                <button
                                  key={attempt.id}
                                  onClick={() => handleAttemptClick(attempt.id)}
                                  disabled={loadingAttemptDetails && selectedAttemptId === attempt.id}
                                  className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    attempt.status === 'completed'
                                      ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                      : attempt.status === 'failed'
                                      ? 'bg-red-50 border-red-200 hover:bg-red-100'
                                      : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                                  }`}
                                >
                                  <div className="flex items-center justify-center space-x-2">
                                    {getStatusIcon(attempt.status)}
                                    <span className="font-medium text-sm">Attempt {attempt.attemptNumber}</span>
                                  </div>
                                  {attempt.status && (
                                    <div className="mt-1">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(attempt.status)}`}>
                                        {attempt.status}
                                      </span>
                                    </div>
                                  )}
                                  <div className="mt-2 text-xs text-gray-600 text-center">
                                    <div>{new Date(attempt.createdAt).toLocaleDateString()}</div>
                                    <div>{new Date(attempt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 text-center">
                              <div className="text-gray-500 mb-2">
                                <Clock className="h-8 w-8 mx-auto mb-2" />
                              </div>
                              <h6 className="font-semibold text-gray-700 mb-1">No Attempts Yet</h6>
                              <p className="text-sm text-gray-600">Student hasn’t attempted this exercise</p>
                            </div>
                          )}
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
