import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaseStudy, BusinessSubject } from '@/types';
import { getSubjectDisplayName, getSubjectIcon } from '@/utils/subject-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, GraduationCap, Brain } from 'lucide-react';

interface CaseStudiesContentProps {
  filteredCaseStudies: CaseStudy[];
  assignedCaseStudies: CaseStudy[];
  selectedSubject: BusinessSubject | 'ALL';
  instructorEmail: string;
  refetchCaseStudies: () => Promise<any>;
  highlightGradient?: string;
  lightHighlightGradient?: string;
  hoverGradient?: string;
  shadowColor?: string;
}

export default function CaseStudiesContent({
  filteredCaseStudies,
  assignedCaseStudies,
  selectedSubject,
  instructorEmail,
  refetchCaseStudies,
  highlightGradient = 'from-amber-500 to-orange-600',
  lightHighlightGradient = 'from-amber-100 to-orange-200',
  hoverGradient = 'from-amber-600 to-orange-700',
  shadowColor = 'shadow-amber-500/25',
}: CaseStudiesContentProps) {
  const router = useRouter();

  const hoverClasses = hoverGradient
    .split(' ')
    .map((c) => `hover:${c}`)
    .join(' ');

  const handleViewCaseStudy = (caseStudy: CaseStudy): void => {
    router.push(`/instructor/case-study/${caseStudy.id}`);
  };

  const getEnrollmentCount = (caseStudy: CaseStudy): number => {
    return caseStudy.enrollments?.reduce((total, enrollment) => total + (enrollment.students?.length || 0), 0) || 0;
  };

  return (
    <div className="flex-1">
      <div className="mb-8">
        <h2 className="text-[28px] font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-2">
          {selectedSubject === 'ALL' ? 'Assigned Case Studies' : `${getSubjectDisplayName(selectedSubject as BusinessSubject)} Studies`}
        </h2>
        <p className="text-purple-600/80 text-[17px]">
          {assignedCaseStudies.length === 0
            ? "You don't have any case studies assigned yet. Contact admin to get case studies assigned to you."
            : 'View your assigned case studies, track student progress, and manage enrollments.'}
        </p>
      </div>

      {assignedCaseStudies.length === 0 ? (
        <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg shadow-purple-500/5">
          <CardContent className="text-center py-16">
            <div className="relative mb-6">
              <div className={`bg-gradient-to-br ${lightHighlightGradient} w-24 h-24 rounded-full flex items-center justify-center mx-auto`}>
                <BookOpen className={`h-12 w-12 ${highlightGradient}`} />
              </div>
              <div className={`absolute -top-2 -right-2 bg-gradient-to-r ${highlightGradient} p-2 rounded-full`}>
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-3">No Case Studies Assigned</h3>
            <p className="text-purple-600 mb-6 max-w-md mx-auto">
              {"You don't have any case studies assigned to you yet. Contact the admin to get case studies assigned to your instructor account."}
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-purple-500">
              <div className="flex items-center space-x-1">
                <Brain className="h-4 w-4" />
                <span>AI-Powered</span>
              </div>
              <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Student Management</span>
              </div>
              <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
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
              className={`backdrop-blur-xl bg-white/80 border-white/20 shadow-lg hover:shadow-purple-500/10 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={`bg-gradient-to-r ${highlightGradient} text-white border-0`}>
                      <span className="mr-1">{getSubjectIcon(caseStudy.subject)}</span>
                      {getSubjectDisplayName(caseStudy.subject)}
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Assigned
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{caseStudy.title}</CardTitle>
                <CardDescription className="text-gray-600 line-clamp-2">{caseStudy.shortDescription}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <BookOpen className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">{caseStudy.modules?.length || 0} modules</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Users className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium">{getEnrollmentCount(caseStudy)} students</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleViewCaseStudy(caseStudy)}
                    className={`w-full bg-gradient-to-r ${highlightGradient} hover:bg-gradient-to-r ${hoverClasses} text-white shadow-lg ${shadowColor} transition-all duration-200`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>View Case Study</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {assignedCaseStudies && assignedCaseStudies.length > 0 && filteredCaseStudies.length === 0 && selectedSubject !== 'ALL' && (
        <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg shadow-purple-500/5">
          <CardContent className="text-center py-16">
            <div className={`bg-gradient-to-br ${lightHighlightGradient} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6`}>
              <span className="text-3xl text-purple-600">{getSubjectIcon(selectedSubject as BusinessSubject)}</span>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-2">
              No {getSubjectDisplayName(selectedSubject as BusinessSubject)} Studies
            </h3>
            <p className="text-purple-600">You are not assigned any {getSubjectDisplayName(selectedSubject as BusinessSubject)} case studies yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
