'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import type { CaseStudyModule, CaseStudy, ModuleExercise } from '@/types';
import { BookOpen, Target, Sparkles, Zap, Brain, ArrowLeft } from 'lucide-react';
import { parseMarkdown } from '@/utils/parse-markdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import AdminNavbar from '@/components/navigation/AdminNavbar';
import { Button } from '@/components/ui/button';

interface CaseStudyViewClientProps {
  caseStudyId: string;
}

export default function CaseStudyViewClient({ caseStudyId }: CaseStudyViewClientProps) {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    const email = localStorage.getItem('user_email');

    if (!userType || userType !== 'admin' || !email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);
    setIsLoading(false);
  }, [router]);

  // API hook to fetch case study data
  const { data: caseStudy, loading: loadingCaseStudy } = useFetchData<CaseStudy>(
    `/api/case-studies/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId },
    'Failed to load case study'
  );

  const handleLogout = () => {
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_email');
    router.push('/login');
  };

  const handleBack = () => {
    router.push('/admin');
  };

  if (isLoading || loadingCaseStudy || !caseStudyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-xl border border-emerald-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="text-lg font-medium bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Loading case study...</span>
        </div>
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="text-center bg-white/80 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-xl border border-emerald-100 max-w-md">
          <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Case Study Not Found</h3>
          <p className="text-gray-600 mb-6">The case study you're looking for doesn't exist or has been removed.</p>
          <Button
            onClick={handleBack}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const modules = caseStudy?.modules || [];

  const getSubjectDisplayName = (subject: string): string => {
    const displayNames: Record<string, string> = {
      HR: 'Human Resources',
      ECONOMICS: 'Economics',
      MARKETING: 'Marketing',
      FINANCE: 'Finance',
      OPERATIONS: 'Operations',
    };
    return displayNames[subject] || subject;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-green-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <AdminNavbar
        title={caseStudy.title}
        subtitle="Case Study Details"
        userEmail={userEmail}
        onLogout={handleLogout}
        icon={<BookOpen className="h-8 w-8 text-white" />}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl p-6 border border-emerald-200/50 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Modules</p>
                <p className="text-3xl font-bold text-gray-900">{modules.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-200/50 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
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

        {/* Case Study Details */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-xl mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Case Study Details</h2>
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                {getSubjectDisplayName(caseStudy.subject)}
              </span>
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-8 leading-relaxed">{caseStudy.shortDescription}</p>
          <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-8 border border-emerald-200/50">
            <div className="markdown-body prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(caseStudy.details) }} />
          </div>
        </div>

        {/* Modules Management */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Learning Modules</h2>
            </div>
            <p className="text-gray-600 text-lg">View case study modules and exercises</p>
          </div>

          <div className="space-y-6">
            {modules.map((module: CaseStudyModule, index: number) => (
              <div key={module.id} className="bg-gradient-to-br from-white/80 to-emerald-50/50 rounded-2xl p-8 border border-emerald-200/50 shadow-lg">
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Module {module.orderNumber}
                    </div>
                    <div className="h-2 w-2 rounded-full bg-emerald-300"></div>
                    <span className="text-sm text-gray-600 flex items-center bg-emerald-100 px-3 py-1 rounded-full">
                      <Target className="h-4 w-4 mr-1 text-emerald-600" />
                      {module.exercises?.length || 0} exercises
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{module.title}</h3>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">{module.shortDescription}</p>

                  <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-6 border border-green-200/50">
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
              <div className="bg-gradient-to-br from-gray-100 to-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Modules Available</h3>
              <p className="text-gray-600">This case study doesn't have any modules yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
