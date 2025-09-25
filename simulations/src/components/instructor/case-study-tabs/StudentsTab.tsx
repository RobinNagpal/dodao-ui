import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CaseStudyWithRelationsForInstructor, EnrollmentWithStudents } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Eye, GraduationCap, BookOpen } from 'lucide-react';
import InstructorManageStudentsModal from '../InstructorManageStudentsModal';

interface StudentsTabProps {
  caseStudy: CaseStudyWithRelationsForInstructor | null;
  caseStudyId: string;
}

const StudentsTab: FC<StudentsTabProps> = ({ caseStudy, caseStudyId }) => {
  const router = useRouter();
  const [selectedEnrollment, setSelectedEnrollment] = useState<{ id: string; title: string } | null>(null);
  const [showStudentManagement, setShowStudentManagement] = useState(false);

  if (!caseStudy) {
    return (
      <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-12">
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-gray-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Case Study Not Found</h3>
          <p className="text-gray-600">Unable to load case study data.</p>
        </div>
      </div>
    );
  }

  // Type assertion since we know the API returns enrollments for instructors and admins
  const enrollments = caseStudy?.enrollments || [];

  const handleManageStudents = (enrollmentId: string, className: string) => {
    setSelectedEnrollment({ id: enrollmentId, title: className });
    setShowStudentManagement(true);
  };

  const handleViewStudentProgress = (enrollmentId: string) => {
    router.push(`/instructor/case-study/${caseStudyId}/class-enrollments/${enrollmentId}`);
  };

  const handleCloseModal = () => {
    setShowStudentManagement(false);
    setSelectedEnrollment(null);
  };

  const getStudentCount = (enrollment: EnrollmentWithStudents): number => {
    return enrollment.students?.length || 0;
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-[28px] font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-2">Class Enrollments</h2>
        <p className="text-purple-600/80 text-[17px]">
          {enrollments.length === 0 ? 'No class enrollments found for this case study.' : 'Manage students and track progress for each class enrollment.'}
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg shadow-purple-500/5">
          <CardContent className="text-center py-16">
            <div className="relative mb-6">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-12 w-12 text-purple-600" />
              </div>
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-full">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-3">No Class Enrollments</h3>
            <p className="text-purple-600 mb-6 max-w-md mx-auto">
              This case study doesn’t have any class enrollments yet. Contact the admin to create enrollments for this case study.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enrollment: EnrollmentWithStudents) => (
            <Card
              key={enrollment.id}
              className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg hover:shadow-purple-500/10 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Class Enrollment
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{enrollment.className}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">{getStudentCount(enrollment)} students</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <BookOpen className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium">{caseStudy.modules?.length || 0} modules</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleManageStudents(enrollment.id, enrollment.className)}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Manage Students</span>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleViewStudentProgress(enrollment.id)}
                    variant="outline"
                    className="w-full border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>View Student Progress</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student Management Modal */}
      <InstructorManageStudentsModal
        isOpen={showStudentManagement}
        onClose={handleCloseModal}
        enrollmentId={selectedEnrollment?.id || ''}
        enrollmentTitle={selectedEnrollment?.title || ''}
        caseStudyId={caseStudyId}
      />
    </div>
  );
};

export default StudentsTab;
