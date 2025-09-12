'use client';

import StudentNavbar from '@/components/navigation/StudentNavbar';
import StudentLoading from '@/components/student/StudentLoading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { BusinessSubject } from '@/types';
import type { CaseStudyWithRelations } from '@/types/api';
import { SimulationSession } from '@/types/user';
import { getSubjectColor, getSubjectDisplayName, getSubjectIcon } from '@/utils/subject-utils';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowRight, BookOpen, BotIcon, Brain, CheckCircle2, GraduationCap, Sparkles, Target, TrendingUp, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState<BusinessSubject | 'ALL'>('ALL');
  const [filteredCaseStudies, setFilteredCaseStudies] = useState<CaseStudyWithRelations[]>([]);
  const router = useRouter();
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  console.log(`session:`, session);

  const { data: enrolledCaseStudies, loading: loadingCaseStudies } = useFetchData<CaseStudyWithRelations[]>(
    `${getBaseUrl()}/api/case-studies`,
    { skipInitialFetch: false },
    'Failed to load enrolled case studies'
  );

  useEffect(() => {
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

  const getEnrolledSubjectsWithCounts = () => {
    if (!enrolledCaseStudies) return [];

    const subjects: BusinessSubject[] = ['MARKETING', 'FINANCE', 'HR', 'OPERATIONS', 'ECONOMICS'];
    return subjects
      .map((subject) => ({
        subject,
        count: enrolledCaseStudies.filter((cs) => cs.subject === subject).length,
      }))
      .filter((item) => item.count > 0);
  };

  const enrolledSubjectsWithCounts = getEnrolledSubjectsWithCounts();

  if (!session) {
    return <div>You do not have access to this page.</div>;
  }

  if (loadingCaseStudies) {
    return <StudentLoading text="Loading your dashboard..." subtitle="Preparing your personalized learning experience" variant="enhanced" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <StudentNavbar
        title="Student Dashboard"
        subtitle={`Welcome back, ${session?.user?.email}`}
        userEmail={session?.email || session?.username}
        onLogout={handleLogout}
        showLogout={true}
        icon={<GraduationCap className="h-8 w-8 text-white" />}
        iconColor="from-blue-600 to-indigo-700"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {enrolledCaseStudies && enrolledCaseStudies.length > 0 && (
            <div className="w-80 flex-shrink-0">
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span>Your Subjects</span>
                  </CardTitle>
                  <CardDescription>Filter by Subject</CardDescription>
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
              <h2 className="text-[28px] font-bold text-gray-900 mb-2">
                {selectedSubject === 'ALL' ? 'My Learning Journey' : `${getSubjectDisplayName(selectedSubject as BusinessSubject)} Studies`}
              </h2>
              <p className="text-gray-600 text-[17px]">
                {!enrolledCaseStudies || enrolledCaseStudies.length === 0
                  ? 'Ready to start your case studies? Contact your instructor to get enrolled.'
                  : 'Access your enrolled case studies and continue building real-world business skills with GenAI simulations.'}
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
                      <span>Instructor-Led</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 space-y-2 flex justify-between">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{caseStudy.modules?.length || 0} Modules</span>
                        </div>
                        {(caseStudy.instructorName || caseStudy.instructorEmail) && (
                          <div className="flex items-center space-x-1 text-gray-600">
                            <User className="h-4 w-4 text-indigo-500" />
                            <span className="font-medium text-sm truncate" title={caseStudy.instructorEmail}>
                              {caseStudy.instructorName || caseStudy.instructorEmail}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => handleStartCaseStudy(caseStudy)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <BotIcon className="h-4 w-4" />
                          <span>Start Learning</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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
