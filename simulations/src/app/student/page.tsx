'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import type { CaseStudyWithRelations } from '@/types/api';
import type { BusinessSubject } from '@/types';
import { BookOpen, LogOut, ArrowRight, Brain, Sparkles, Target, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function StudentDashboard() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<BusinessSubject | 'ALL'>('ALL');
  const [filteredCaseStudies, setFilteredCaseStudies] = useState<CaseStudyWithRelations[]>([]);
  const router = useRouter();

  // API hook to fetch enrolled case studies
  const { data: enrolledCaseStudies, loading: loadingCaseStudies } = useFetchData<CaseStudyWithRelations[]>(
    `/api/student/case-studies?studentEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !userEmail },
    'Failed to load enrolled case studies'
  );

  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    const email = localStorage.getItem('user_email');

    if (!userType || userType !== 'student' || !email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    // Filter enrolled case studies based on selected subject
    if (enrolledCaseStudies) {
      if (selectedSubject === 'ALL') {
        setFilteredCaseStudies(enrolledCaseStudies);
      } else {
        setFilteredCaseStudies(enrolledCaseStudies.filter((cs) => cs.subject === selectedSubject));
      }
    }
  }, [selectedSubject, enrolledCaseStudies]);

  const handleLogout = () => {
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_email');
    router.push('/login');
  };

  const handleStartCaseStudy = (caseStudy: CaseStudyWithRelations) => {
    router.push(`/student/case-study/${caseStudy.id}`);
  };

  const getSubjectDisplayName = (subject: BusinessSubject) => {
    const displayNames: Record<BusinessSubject, string> = {
      HR: 'Human Resources',
      ECONOMICS: 'Economics',
      MARKETING: 'Marketing',
      FINANCE: 'Finance',
      OPERATIONS: 'Operations',
    };
    return displayNames[subject];
  };

  const getSubjectIcon = (subject: BusinessSubject) => {
    const icons = {
      HR: '👥',
      ECONOMICS: '📊',
      MARKETING: '📈',
      FINANCE: '💰',
      OPERATIONS: '⚙️',
    };
    return icons[subject];
  };

  const getSubjectColor = (subject: BusinessSubject) => {
    const colors = {
      HR: 'from-green-500 to-emerald-600',
      ECONOMICS: 'from-blue-500 to-cyan-600',
      MARKETING: 'from-pink-500 to-rose-600',
      FINANCE: 'from-yellow-500 to-orange-600',
      OPERATIONS: 'from-purple-500 to-indigo-600',
    };
    return colors[subject];
  };

  // Get subjects with counts from enrolled case studies only
  const getEnrolledSubjectsWithCounts = () => {
    if (!enrolledCaseStudies) return [];

    const subjects: BusinessSubject[] = ['MARKETING', 'FINANCE', 'HR', 'OPERATIONS', 'ECONOMICS'];
    return subjects
      .map((subject) => ({
        subject,
        count: enrolledCaseStudies.filter((cs) => cs.subject === subject).length,
      }))
      .filter((item) => item.count > 0); // Only show subjects with enrolled case studies
  };

  const enrolledSubjectsWithCounts = getEnrolledSubjectsWithCounts();

  if (isLoading || loadingCaseStudies) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading your dashboard...</h3>
            <p className="text-gray-600">Preparing your personalized learning experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <header className="backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-2xl shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-cyan-400 to-blue-500 p-1 rounded-full">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">Student Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back, <span className="font-medium text-blue-600">{userEmail}</span>
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {enrolledCaseStudies && enrolledCaseStudies.length > 0 && (
            <div className="w-80 flex-shrink-0">
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span>Your Subjects</span>
                  </CardTitle>
                  <CardDescription>Filter by subject area</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setSelectedSubject('ALL')}
                    variant={selectedSubject === 'ALL' ? 'default' : 'ghost'}
                    className={`w-full justify-between h-12 ${
                      selectedSubject === 'ALL' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-current rounded-full"></div>
                      <span>All Subjects</span>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-current">
                      {enrolledCaseStudies?.length || 0}
                    </Badge>
                  </Button>

                  {enrolledSubjectsWithCounts.map(({ subject, count }) => (
                    <Button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      variant={selectedSubject === subject ? 'default' : 'ghost'}
                      className={`w-full justify-between h-12 ${
                        selectedSubject === subject ? `bg-gradient-to-r ${getSubjectColor(subject)} text-white shadow-lg` : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getSubjectIcon(subject)}</span>
                        <span className="font-medium">{getSubjectDisplayName(subject)}</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-current">
                        {count}
                      </Badge>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex-1">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedSubject === 'ALL' ? 'Your Learning Journey' : `${getSubjectDisplayName(selectedSubject as BusinessSubject)} Studies`}
              </h2>
              <p className="text-gray-600 text-lg">
                {!enrolledCaseStudies || enrolledCaseStudies.length === 0
                  ? 'Ready to start your AI-powered learning adventure? Contact your instructor to get enrolled.'
                  : 'Continue mastering business concepts through intelligent simulations.'}
              </p>
            </div>

            {!enrolledCaseStudies || enrolledCaseStudies.length === 0 ? (
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="relative mb-6">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                      <BookOpen className="h-12 w-12 text-blue-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-full">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Begin Your Journey?</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    You haven’t been enrolled in any case studies yet. Contact your instructor to unlock your personalized learning experience.
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Brain className="h-4 w-4" />
                      <span>AI-Powered</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>Interactive</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Progressive</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCaseStudies.map((caseStudy) => (
                  <Card
                    key={caseStudy.id}
                    className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={`bg-gradient-to-r ${getSubjectColor(caseStudy.subject)} text-white border-0`}>
                            <span className="mr-1">{getSubjectIcon(caseStudy.subject)}</span>
                            {getSubjectDisplayName(caseStudy.subject)}
                          </Badge>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Enrolled
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{caseStudy.title}</CardTitle>
                      <CardDescription className="text-gray-600 line-clamp-2">{caseStudy.shortDescription}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <BookOpen className="h-4 w-4" />
                            <span>{caseStudy.modules?.length || 0} modules</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>Self-paced</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartCaseStudy(caseStudy)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Brain className="h-4 w-4" />
                          <span>Start Learning</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No filtered results */}
            {enrolledCaseStudies && enrolledCaseStudies.length > 0 && filteredCaseStudies.length === 0 && selectedSubject !== 'ALL' && (
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">{getSubjectIcon(selectedSubject as BusinessSubject)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No {getSubjectDisplayName(selectedSubject as BusinessSubject)} Studies</h3>
                  <p className="text-gray-600">You are not enrolled in any {getSubjectDisplayName(selectedSubject as BusinessSubject)} case studies yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
