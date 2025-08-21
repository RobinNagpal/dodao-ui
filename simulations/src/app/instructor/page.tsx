'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import InstructorManageStudentsModal from '@/components/instructor/InstructorManageStudentsModal';
import type { CaseStudy } from '@/types';
import { BookOpen, Users, GraduationCap, Brain } from 'lucide-react';
import InstructorNavbar from '@/components/navigation/InstructorNavbar';

export default function InstructorDashboard() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const router = useRouter();

  // API hook to fetch case studies
  const {
    data: assignedCaseStudies = [],
    loading: loadingCaseStudies,
    reFetchData: refetchCaseStudies,
  } = useFetchData<CaseStudy[]>(
    `/api/instructor/case-studies?instructorEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !userEmail },
    'Failed to load assigned case studies'
  );

  // Check authentication on page load
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

  const getSubjectDisplayName = (subject: string) => {
    const displayNames: Record<string, string> = {
      HR: 'Human Resources',
      ECONOMICS: 'Economics',
      MARKETING: 'Marketing',
      FINANCE: 'Finance',
      OPERATIONS: 'Operations',
    };
    return displayNames[subject] || subject;
  };

  const getEnrollmentCount = (caseStudy: CaseStudy) => {
    return caseStudy.enrollments?.reduce((total, enrollment) => total + (enrollment.students?.length || 0), 0) || 0;
  };

  if (isLoading || loadingCaseStudies) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-purple-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Preparing your instructor console...</p>
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
        title="Instructor Dashboard"
        subtitle="Welcome Back"
        userEmail={userEmail}
        onLogout={handleLogout}
        icon={<GraduationCap className="h-8 w-8 text-white" />}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
            <Brain className="h-6 w-6 text-purple-600 mr-2" />
            Your Assigned Case Studies
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {assignedCaseStudies.length === 0
              ? "You don't have any case studies assigned yet. Contact admin to get case studies assigned to you."
              : 'Manage and view the case studies assigned to you. You can also manage student enrollments and track progress.'}
          </p>
        </div>

        {assignedCaseStudies.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-12 border border-white/30 shadow-xl max-w-md mx-auto">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Case Studies Assigned</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">You don’t have any case studies assigned to you yet.</p>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                <p className="text-sm text-purple-700 font-medium">Contact the admin to get case studies assigned to your instructor account.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assignedCaseStudies.map((caseStudy) => (
              <div
                key={caseStudy.id}
                className="group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {getSubjectDisplayName(caseStudy.subject)}
                      </span>
                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Assigned</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{caseStudy.title}</h3>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">{caseStudy.shortDescription}</p>

                <div className="flex items-center justify-between text-sm mb-6 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-3">
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
                  <button
                    onClick={() => handleViewCaseStudy(caseStudy)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>View Case Study</span>
                  </button>

                  <button
                    onClick={() => handleManageStudents(caseStudy)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Users className="h-4 w-4" />
                    <span>Manage Students</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Management Modal */}
      <InstructorManageStudentsModal
        isOpen={showStudentManagement}
        onClose={handleCloseModal}
        caseStudyId={selectedCaseStudy?.id || ''}
        caseStudyTitle={selectedCaseStudy?.title || ''}
        instructorEmail={userEmail}
      />
    </div>
  );
}
