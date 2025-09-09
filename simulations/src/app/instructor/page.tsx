'use client';

import { SimulationSession } from '@/types/user';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import InstructorManageStudentsModal from '@/components/instructor/InstructorManageStudentsModal';
import type { CaseStudy } from '@/types';
import type { BusinessSubject } from '@/types';
import { getSubjectDisplayName, getSubjectIcon, getSubjectColor } from '@/utils/subject-utils';
import { BookOpen, Users, GraduationCap, Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import InstructorNavbar from '@/components/navigation/InstructorNavbar';
import InstructorLoading from '@/components/instructor/InstructorLoading';

export default function InstructorDashboard() {
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<BusinessSubject | 'ALL'>('ALL');
  const [filteredCaseStudies, setFilteredCaseStudies] = useState<CaseStudy[]>([]);
  const router = useRouter();

  // API hook to fetch case studies
  const {
    data: assignedCaseStudies,
    loading: loadingCaseStudies,
    reFetchData: refetchCaseStudies,
  } = useFetchData<CaseStudy[]>(`${getBaseUrl()}/api/case-studies`, {}, 'Failed to load assigned case studies');

  // Check authentication on page load
  useEffect(() => {
    if (!session || session.role !== 'Admin') {
      router.push('/login');
      return;
    }
  }, [router]);

  // Filter case studies based on selected subject
  useEffect(() => {
    if (assignedCaseStudies) {
      if (selectedSubject === 'ALL') {
        setFilteredCaseStudies(assignedCaseStudies);
      } else {
        setFilteredCaseStudies(assignedCaseStudies.filter((cs) => cs.subject === selectedSubject));
      }
    }
  }, [selectedSubject, assignedCaseStudies]);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleViewCaseStudy = (caseStudy: CaseStudy) => {
    router.push(`/instructor/case-study/${caseStudy.id}`);
  };

  const handleManageStudents = (caseStudy: CaseStudy) => {
    setSelectedCaseStudy(caseStudy);
    setShowStudentManagement(true);
  };

  const handleCloseModal = async () => {
    setShowStudentManagement(false);
    setSelectedCaseStudy(null);
    // Refresh case studies to get updated counts
    await refetchCaseStudies();
  };

  const getEnrollmentCount = (caseStudy: CaseStudy) => {
    return caseStudy.enrollments?.reduce((total, enrollment) => total + (enrollment.students?.length || 0), 0) || 0;
  };

  const getAssignedSubjectsWithCounts = () => {
    if (!assignedCaseStudies) return [];

    const subjects: BusinessSubject[] = ['MARKETING', 'FINANCE', 'HR', 'OPERATIONS', 'ECONOMICS'];
    return subjects
      .map((subject) => ({
        subject,
        count: assignedCaseStudies.filter((cs) => cs.subject === subject).length,
      }))
      .filter((item) => item.count > 0);
  };

  const assignedSubjectsWithCounts = getAssignedSubjectsWithCounts();

  if (loadingCaseStudies || assignedCaseStudies === undefined) {
    return <InstructorLoading text="Loading Dashboard" subtitle="Preparing your instructor console..." variant="enhanced" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <InstructorNavbar
        title="Instructor Dashboard"
        subtitle="Welcome Back"
        userEmail={session?.email!}
        onLogout={handleLogout}
        icon={<GraduationCap className="h-8 w-8 text-white" />}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {assignedCaseStudies && assignedCaseStudies.length > 0 && (
            <div className="w-80 flex-shrink-0">
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    <span>Subject Areas</span>
                  </CardTitle>
                  <CardDescription>Filter by Subject</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setSelectedSubject('ALL')}
                    variant={selectedSubject === 'ALL' ? 'default' : 'ghost'}
                    className={`w-full justify-between h-12 ${
                      selectedSubject === 'ALL' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-current rounded-full"></div>
                      <span>All Subjects</span>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-current">
                      {assignedCaseStudies?.length || 0}
                    </Badge>
                  </Button>

                  {assignedSubjectsWithCounts.map(({ subject, count }) => (
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
                {selectedSubject === 'ALL' ? 'Assigned Case Studies' : `${getSubjectDisplayName(selectedSubject as BusinessSubject)} Studies`}
              </h2>
              <p className="text-gray-600 text-[17px]">
                {assignedCaseStudies.length === 0
                  ? "You don't have any case studies assigned yet. Contact admin to get case studies assigned to you."
                  : 'View your assigned case studies, track student progress, and manage enrollments.'}
              </p>
            </div>

            {assignedCaseStudies.length === 0 ? (
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="relative mb-6">
                    <div className="bg-gradient-to-br from-purple-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                      <BookOpen className="h-12 w-12 text-purple-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-400 to-purple-500 p-2 rounded-full">
                      <GraduationCap className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Case Studies Assigned</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    You don’t have any case studies assigned to you yet. Contact the admin to get case studies assigned to your instructor account.
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Brain className="h-4 w-4" />
                      <span>AI-Powered</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>Student Management</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>Instructor-Led</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            Assigned
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{caseStudy.title}</CardTitle>
                      <CardDescription className="text-gray-600 line-clamp-2">{caseStudy.shortDescription}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-3">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <BookOpen className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">{caseStudy.modules?.length || 0} modules</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{getEnrollmentCount(caseStudy)} students</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Button
                          onClick={() => handleViewCaseStudy(caseStudy)}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <BookOpen className="h-4 w-4" />
                            <span>View Case Study</span>
                          </div>
                        </Button>

                        <Button
                          onClick={() => handleManageStudents(caseStudy)}
                          variant="outline"
                          className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Manage Students</span>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {assignedCaseStudies && assignedCaseStudies.length > 0 && filteredCaseStudies.length === 0 && selectedSubject !== 'ALL' && (
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">{getSubjectIcon(selectedSubject as BusinessSubject)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No {getSubjectDisplayName(selectedSubject as BusinessSubject)} Studies</h3>
                  <p className="text-gray-600">You are not assigned any {getSubjectDisplayName(selectedSubject as BusinessSubject)} case studies yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Student Management Modal */}
      <InstructorManageStudentsModal
        isOpen={showStudentManagement}
        onClose={handleCloseModal}
        caseStudyId={selectedCaseStudy?.id || ''}
        caseStudyTitle={selectedCaseStudy?.title || ''}
        instructorEmail={session?.email!}
      />
    </div>
  );
}
