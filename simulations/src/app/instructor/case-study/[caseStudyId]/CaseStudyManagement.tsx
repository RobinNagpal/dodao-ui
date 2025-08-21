'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import type { CaseStudyModule, CaseStudy, ModuleExercise } from '@/types';
import { BookOpen, Users, BarChart3, Target, Brain, Sparkles, GraduationCap, Zap, ArrowLeft } from 'lucide-react';
import { parseMarkdown } from '@/utils/parse-markdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import InstructorNavbar from '@/components/navigation/InstructorNavbar';

interface CaseStudyManagementClientProps {
  caseStudyId: string;
}

export default function CaseStudyManagementClient({ caseStudyId }: CaseStudyManagementClientProps) {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'analytics'>('overview');

  const router = useRouter();

  // API hook to fetch case study data
  const { data: caseStudy, loading: loadingCaseStudy } = useFetchData<CaseStudy>(
    `/api/instructor/case-studies/${caseStudyId}?instructorEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !caseStudyId || !userEmail },
    'Failed to load case study'
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

  if (isLoading || loadingCaseStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Case Study</h3>
          <p className="text-gray-600">Preparing management console...</p>
        </div>
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-12 border border-white/30 shadow-xl max-w-md mx-auto">
            <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Case Study Not Found</h3>
            <p className="text-gray-600 mb-6">The case study you’re looking for doesn’t exist or has been removed.</p>
            <button
              onClick={() => router.push('/instructor')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const enrolledStudents = caseStudy?.enrollments?.reduce((total, enrollment) => total + (enrollment.students?.length || 0), 0) || 0;
  const modules = caseStudy?.modules || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"> </div>
      </div>

      <InstructorNavbar
        title={caseStudy.title}
        subtitle="Instructor Management Console"
        userEmail={userEmail}
        onLogout={handleLogout}
        icon={<GraduationCap className="h-8 w-8 text-white" />}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => router.push('/instructor')}
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-2">
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl p-6 border border-blue-200/50 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Enrolled Students</p>
                <p className="text-3xl font-bold text-gray-900">{enrolledStudents}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-200/50 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Modules</p>
                <p className="text-3xl font-bold text-gray-900">{modules.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-200/50 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Exercises</p>
                <p className="text-3xl font-bold text-gray-900">
                  {modules.reduce((total: number, module: CaseStudyModule) => total + (module.exercises?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="border-b border-white/20">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600 bg-purple-50/50 rounded-t-lg'
                  : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-purple-300'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-2 border-b-2 font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
                activeTab === 'students'
                  ? 'border-purple-500 text-purple-600 bg-purple-50/50 rounded-t-lg'
                  : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-purple-300'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Students</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 border-b-2 font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
                activeTab === 'analytics'
                  ? 'border-purple-500 text-purple-600 bg-purple-50/50 rounded-t-lg'
                  : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-purple-300'
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
            {/* Case Study Details */}
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-xl mr-3">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                Case Study Details
                <Sparkles className="h-5 w-5 text-yellow-500 ml-2 animate-pulse" />
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">{caseStudy.shortDescription}</p>
              <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-8 border border-purple-200/50">
                <div className="markdown-body prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(caseStudy.details) }} />
              </div>
            </div>

            {/* Modules Management */}
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl mr-3">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  Learning Modules
                </h2>
                <p className="text-gray-600 text-lg">View case study modules and exercises</p>
              </div>

              <div className="space-y-6">
                {modules.map((module: CaseStudyModule, index: number) => (
                  <div key={module.id} className="bg-gradient-to-br from-white/80 to-purple-50/50 rounded-2xl p-8 border border-purple-200/50 shadow-lg">
                    <div className="mb-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                          Module {module.orderNumber}
                        </div>
                        <div className="h-2 w-2 rounded-full bg-purple-300"></div>
                        <span className="text-sm text-gray-600 flex items-center bg-purple-100 px-3 py-1 rounded-full">
                          <Target className="h-4 w-4 mr-1 text-purple-600" />
                          {module.exercises?.length || 0} exercises
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{module.title}</h3>
                      <p className="text-gray-600 mb-6 text-lg leading-relaxed">{module.shortDescription}</p>

                      <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-6 border border-indigo-200/50">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                          Module Details
                        </h4>
                        <div className="markdown-body prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(module.details) }} />
                      </div>
                    </div>

                    {module.exercises && module.exercises.length > 0 && (
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                          <Target className="h-5 w-5 text-green-600 mr-2" />
                          Exercises
                        </h4>
                        <Accordion type="single" collapsible className="space-y-4">
                          {module.exercises.map((exercise: ModuleExercise, exerciseIndex: number) => (
                            <AccordionItem
                              key={exercise.id}
                              value={exercise.id}
                              className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm"
                            >
                              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                <div className="flex items-center space-x-3 text-left">
                                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    Exercise {exercise.orderNumber}
                                  </div>
                                  <span className="font-semibold text-gray-900">{exercise.title}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 pb-6">
                                <div className="space-y-4">
                                  <p className="text-gray-600 leading-relaxed">{exercise.shortDescription}</p>
                                  <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-6 border border-green-200/50">
                                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                      <Brain className="h-4 w-4 text-green-600 mr-2" />
                                      Exercise Details
                                    </h5>
                                    <div className="markdown-body prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(exercise.details) }} />
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {modules.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-br from-gray-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-10 w-10 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Modules Available</h3>
                  <p className="text-gray-600">This case study doesn’t have any modules yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-12">
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Student Progress Monitoring</h2>
              <div className="text-gray-600 max-w-lg mx-auto">
                <p className="mb-6 text-lg">Advanced student monitoring features are coming soon!</p>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-left border border-blue-200">
                  <p className="font-semibold mb-4 text-gray-900">This section will include:</p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Individual student progress tracking</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Exercise completion analytics</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>AI prompt and response analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Performance insights and recommendations</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Real-time activity monitoring</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
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
    </div>
  );
}
