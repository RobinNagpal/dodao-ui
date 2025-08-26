'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import {
  Brain,
  BookOpen,
  User,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  MessageSquare,
  FileText,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Mail,
  Hash,
  Activity,
  Layers,
} from 'lucide-react';
import { parseMarkdown } from '@/utils/parse-markdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import InstructorNavbar from '@/components/navigation/InstructorNavbar';
import BackButton from '@/components/shared/BackButton';

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
  shortDescription: string;
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
  finalSubmission: {
    id: string;
    finalContent: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  statistics: {
    totalExercises: number;
    attemptedExercises: number;
    totalAttempts: number;
    completionPercentage: number;
  };
}

export default function StudentDetailsClient({ caseStudyId, studentId }: StudentDetailsClientProps) {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const router = useRouter();

  // API hook to fetch student details
  const { data: studentDetails, loading: loadingDetails } = useFetchData<StudentDetailResponse>(
    `/api/instructor/students/${studentId}/details?instructorEmail=${encodeURIComponent(userEmail)}&caseStudyId=${caseStudyId}`,
    { skipInitialFetch: !studentId || !userEmail || !caseStudyId },
    'Failed to load student details'
  );

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

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

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

  if (isLoading || loadingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Student Details</h3>
          <p className="text-gray-600">Preparing detailed analysis...</p>
        </div>
      </div>
    );
  }

  if (!studentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-12 border border-white/30 shadow-xl max-w-md mx-auto">
            <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <User className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Student Details Not Found</h3>
            <p className="text-gray-600 mb-6">The student details you’re looking for don’t exist or you don’t have access.</p>
            <button
              onClick={() => router.push(`/instructor/case-study/${caseStudyId}`)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Back to Case Study
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <InstructorNavbar
        title={`${studentDetails.student.assignedStudentId} - Student Details`}
        subtitle={studentDetails.caseStudy.title}
        userEmail={userEmail}
        onLogout={handleLogout}
        icon={<User className="h-8 w-8 text-white" />}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        {/* Back Button */}
        <BackButton userType="instructor" text="Back to Case Study" href={`/instructor/case-study/${caseStudyId}`} />

        {/* Student Overview */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{studentDetails.student.assignedStudentId.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center">
                  <Mail className="h-4 w-4 text-purple-600 mr-2" />
                  {studentDetails.student.assignedStudentId}
                </h1>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Enrolled: {new Date(studentDetails.student.createdAt).toLocaleDateString()}
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
                    strokeDasharray={`${studentDetails.statistics.completionPercentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">{studentDetails.statistics.completionPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Completed Exercises</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mb-1">{studentDetails.statistics.attemptedExercises}</p>
              <p className="text-xs text-green-600">out of {studentDetails.statistics.totalExercises} total</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Total Attempts</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mb-1">{studentDetails.statistics.totalAttempts}</p>
              <p className="text-xs text-blue-600">across all exercises</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">Progress Rate</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mb-1">{studentDetails.statistics.completionPercentage}%</p>
              <p className="text-xs text-purple-600">completion</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-800">Final Submission</span>
              </div>
              <p className="text-lg font-bold text-yellow-900 mb-1">{studentDetails.finalSubmission ? 'Submitted' : 'Pending'}</p>
              <p className="text-xs text-yellow-600">
                {studentDetails.finalSubmission ? new Date(studentDetails.finalSubmission.createdAt).toLocaleDateString() : 'Not submitted yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Final Submission */}
        {studentDetails.finalSubmission && (
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-2 rounded-xl mr-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              Final Submission
              <Sparkles className="h-5 w-5 text-yellow-500 ml-2 animate-pulse" />
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-4 border border-indigo-200">
                <p className="text-sm font-medium text-gray-700 mb-1">Submitted Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(studentDetails.finalSubmission.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-sm font-medium text-gray-700 mb-1">Last Updated</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(studentDetails.finalSubmission.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {studentDetails.finalSubmission.finalContent ? (
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-4">Submission Content</h3>
                <div
                  className="markdown-body prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(studentDetails.finalSubmission.finalContent) }}
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 text-center">
                <p className="text-gray-600">No content provided in the final submission.</p>
              </div>
            )}
          </div>
        )}

        {/* Modules and Exercises */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-xl mr-3">
              <Layers className="h-6 w-6 text-white" />
            </div>
            Modules & Exercise Attempts
          </h2>

          <div className="space-y-6">
            {studentDetails.modules.map((module) => (
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
                                <p className="text-sm text-gray-600">{exercise.shortDescription}</p>
                              </div>
                            </div>
                            <div className="text-center bg-gradient-to-br from-orange-50 to-yellow-50 px-3 py-2 rounded-lg border border-orange-200 min-w-[80px]">
                              <p className="text-xs text-orange-600 font-medium">Attempts</p>
                              <p className="text-lg font-bold text-orange-900">{exercise.attempts.length}</p>
                            </div>
                          </div>

                          {exercise.attempts.length > 0 ? (
                            <Accordion type="single" collapsible className="space-y-3">
                              {exercise.attempts.map((attempt) => (
                                <AccordionItem key={attempt.id} value={attempt.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center space-x-3">
                                        {getStatusIcon(attempt.status)}
                                        <span className="font-medium">Attempt #{attempt.attemptNumber}</span>
                                        {attempt.status && (
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(attempt.status)}`}>
                                            {attempt.status}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-4 pb-4">
                                    <div className="space-y-4">
                                      {attempt.model && (
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                          <h6 className="font-semibold text-blue-900 mb-2 flex items-center">
                                            <Brain className="h-4 w-4 text-blue-600 mr-2" />
                                            AI Model Used
                                          </h6>
                                          <p className="text-blue-800">{attempt.model}</p>
                                        </div>
                                      )}

                                      {attempt.prompt && (
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                                          <h6 className="font-semibold text-purple-900 mb-2 flex items-center">
                                            <MessageSquare className="h-4 w-4 text-purple-600 mr-2" />
                                            Student Prompt
                                          </h6>
                                          <div className="bg-white rounded-lg p-3 border border-purple-200">
                                            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">{attempt.prompt}</pre>
                                          </div>
                                        </div>
                                      )}

                                      {attempt.promptResponse && (
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                          <h6 className="font-semibold text-green-900 mb-2 flex items-center">
                                            <Brain className="h-4 w-4 text-green-600 mr-2" />
                                            AI Response
                                          </h6>
                                          <div className="bg-white rounded-lg p-3 border border-green-200">
                                            <div
                                              className="markdown-body prose max-w-none"
                                              dangerouslySetInnerHTML={{ __html: parseMarkdown(attempt.promptResponse) }}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {attempt.error && (
                                        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
                                          <h6 className="font-semibold text-red-900 mb-2 flex items-center">
                                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                                            Error Details
                                          </h6>
                                          <div className="bg-white rounded-lg p-3 border border-red-200">
                                            <pre className="whitespace-pre-wrap text-sm text-red-800 font-mono">{attempt.error}</pre>
                                          </div>
                                        </div>
                                      )}

                                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                                        <h6 className="font-semibold text-gray-900 mb-2 flex items-center">
                                          <Clock className="h-4 w-4 text-gray-600 mr-2" />
                                          Attempt Timeline
                                        </h6>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <p className="text-gray-600">Created:</p>
                                            <p className="font-medium text-gray-900">{new Date(attempt.createdAt).toLocaleString()}</p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">Last Updated:</p>
                                            <p className="font-medium text-gray-900">{new Date(attempt.updatedAt).toLocaleString()}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
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
    </div>
  );
}
