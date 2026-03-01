'use client';

import Breadcrumbs from '@/components/ui/Breadcrumbs';
import InstructorNavbar from '@/components/navigation/InstructorNavbar';
import AdminNavbar from '@/components/navigation/AdminNavbar';
import AttemptDetailModal from '@/components/shared/AttemptDetailModal';
import StudentActivityLogs from '@/components/instructor/StudentActivityLogs';
import StudentTabNavigation from '@/components/instructor/StudentTabNavigation';
import StudentDetailedInfo from '@/components/instructor/StudentDetailedInfo';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { CaseStudyWithRelationsForInstructor, StudentDetailResponse } from '@/types/api';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { BookOpen, Calendar, GraduationCap, Mail, Shield, User } from 'lucide-react';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

export type StudentDetailsVariant = 'instructor' | 'admin';

interface StudentDetailsClientProps {
  caseStudyId: string;
  classEnrollmentId: string;
  studentEnrollmentId: string;
  variant?: StudentDetailsVariant;
}

type CaseStudyResponse = CaseStudyWithRelationsForInstructor;
type StudentTabType = 'detailed-info' | 'activity-logs';

export default function StudentDetailsClient({
  caseStudyId,
  classEnrollmentId,
  studentEnrollmentId,
  variant = 'instructor',
}: StudentDetailsClientProps): ReactElement | null {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);
  const [activeTab, setActiveTab] = useState<StudentTabType>('detailed-info');

  const basePath = variant === 'admin' ? '/admin' : '/instructor';

  const { data: caseStudyData, loading: loadingCaseStudy } = useFetchData<CaseStudyResponse>(
    `/api/case-studies/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId },
    'Failed to load case study details'
  );

  const { data: studentDetails, loading: loadingStudentDetails } = useFetchData<StudentDetailResponse>(
    `/api/case-studies/${caseStudyId}/class-enrollments/${classEnrollmentId}/student-enrollments/${studentEnrollmentId}`,
    { skipInitialFetch: !studentEnrollmentId || !caseStudyId || !classEnrollmentId },
    'Failed to load student details'
  );

  const { renderAuthGuard } = useAuthGuard({
    allowedRoles: ['Instructor', 'Admin'],
    loadingType: variant === 'admin' ? 'admin' : 'instructor',
    loadingText: 'Loading Student Details',
    loadingSubtitle: 'Preparing detailed analysis...',
    additionalLoadingConditions: [loadingCaseStudy || loadingStudentDetails],
  });

  const attemptDetails = selectedAttemptId ? studentDetails?.attempts.find((a) => a.id === selectedAttemptId) ?? null : null;

  const statistics = (() => {
    if (!studentDetails || !caseStudyData) {
      return { totalExercises: 0, attemptedExercises: 0, totalAttempts: 0, completionPercentage: 0, averageScore: 0, completedExercises: 0 };
    }
    const allExercises = caseStudyData.modules?.flatMap((m) => m.exercises || []) || [];
    const totalExercises = allExercises.length;
    const attemptedExerciseIds = [...new Set(studentDetails.attempts.map((a) => a.exerciseId))];
    const attemptedExercises = attemptedExerciseIds.length;
    const totalAttempts = studentDetails.attempts.length;
    const completedAttempts = studentDetails.attempts.filter((a) => a.status === 'completed' || a.status === 'success');
    const completedExercises = completedAttempts.length;
    const completionPercentage = totalExercises > 0 ? Math.round((attemptedExercises / totalExercises) * 100) : 0;
    const attemptsWithScores = studentDetails.attempts.filter((a) => a.evaluatedScore !== null);
    const averageScore =
      attemptsWithScores.length > 0 ? attemptsWithScores.reduce((sum, a) => sum + (a.evaluatedScore || 0), 0) / attemptsWithScores.length : 0;
    return { totalExercises, attemptedExercises, totalAttempts, completionPercentage, averageScore, completedExercises };
  })();

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const handleAttemptClick = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
  };

  useEffect(() => {
    if (attemptDetails && selectedAttemptId) setShowAttemptModal(true);
  }, [attemptDetails, selectedAttemptId]);

  const loadingGuard = renderAuthGuard();
  if (loadingGuard) return loadingGuard as ReactElement;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: caseStudyData?.title || 'Case Study', href: `${basePath}/case-study/${caseStudyId}`, current: false },
    {
      name: studentDetails?.enrollment.className || 'Class Enrollment',
      href: `${basePath}/case-study/${caseStudyId}/class-enrollments/${classEnrollmentId}`,
      current: false,
    },
    {
      name: studentDetails?.assignedStudent.name || studentDetails?.assignedStudent.email || 'Student',
      href: `${basePath}/case-study/${caseStudyId}/class-enrollments/${classEnrollmentId}/student-enrollments/${studentEnrollmentId}`,
      current: true,
    },
  ];

  const Navbar = variant === 'admin' ? AdminNavbar : InstructorNavbar;
  const title = studentDetails?.assignedStudent.name || studentDetails?.assignedStudent.email || 'Student Not Found';
  const subtitle = studentDetails ? studentDetails.enrollment.className : undefined;
  const icon = variant === 'admin' ? <Shield className="h-8 w-8 text-white" /> : <GraduationCap className="h-8 w-8 text-white" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <Navbar title={title} subtitle={subtitle} icon={icon} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <Breadcrumbs breadcrumbs={breadcrumbs} />

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6 mb-6 mt-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {(studentDetails?.assignedStudent.name || studentDetails?.assignedStudent.email || 'S')?.charAt(0).toUpperCase()}
                  </span>
                </div>
                {statistics.averageScore > 0 && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                    {(statistics.averageScore * 10).toFixed(1)}%
                  </div>
                )}
              </div>
              <div>
                {studentDetails?.assignedStudent.name && (
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <User className="h-4 w-4 mr-1.5 text-purple-600" />
                    {studentDetails.assignedStudent.name}
                  </h3>
                )}
                <p className="flex items-center text-sm text-gray-600">
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  {studentDetails?.assignedStudent.email}
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Enrolled: {new Date(studentDetails?.createdAt ?? '').toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {studentDetails?.enrollment.className}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl px-4 py-2 border border-purple-200">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-600"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray={`${statistics.completionPercentage}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900">{statistics.completionPercentage}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-700">Progress</p>
                  <p className="text-xs text-gray-600">
                    {statistics.attemptedExercises}/{statistics.totalExercises} exercises
                  </p>
                </div>
              </div>

              {statistics.averageScore > 0 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-xl shadow-lg">
                  <p className="text-xs font-medium">Final Score</p>
                  <p className="text-lg font-bold">{(statistics.averageScore * 10).toFixed(1)}%</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <StudentTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'detailed-info' && (
          <StudentDetailedInfo
            caseStudyData={caseStudyData ?? null}
            studentDetails={studentDetails ?? null}
            expandedModules={expandedModules}
            onToggleModule={toggleModule}
            onAttemptClick={handleAttemptClick}
          />
        )}

        {activeTab === 'activity-logs' && caseStudyData?.modules && (
          <StudentActivityLogs
            classEnrollmentId={classEnrollmentId}
            studentEnrollmentId={studentEnrollmentId}
            modules={caseStudyData.modules.map((m) => ({
              id: m.id,
              orderNumber: m.orderNumber,
              title: m.title,
              exercises: (m.exercises || []).map((e) => ({ id: e.id, orderNumber: e.orderNumber, title: e.title })),
            }))}
          />
        )}
      </div>

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
