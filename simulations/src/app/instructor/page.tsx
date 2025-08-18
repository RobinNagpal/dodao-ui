'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import InstructorManageStudentsModal from '@/components/instructor/InstructorManageStudentsModal';
import type { CaseStudy } from '@/types';
import { BookOpen, LogOut, Users, Plus, X, UserCheck } from 'lucide-react';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-900">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
                <p className="text-gray-600">Welcome back, {userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Assigned Case Studies</h2>
          <p className="text-gray-600">
            {assignedCaseStudies.length === 0
              ? "You don't have any case studies assigned yet. Contact admin to get case studies assigned to you."
              : 'Manage and view the case studies assigned to you. You can also manage student enrollments.'}
          </p>
        </div>

        {assignedCaseStudies.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Case Studies Assigned</h3>
            <p className="text-gray-600 mb-4">You don&apos;t have any case studies assigned to you yet.</p>
            <p className="text-sm text-gray-500">Contact the admin to get case studies assigned to your instructor account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedCaseStudies.map((caseStudy) => (
              <div key={caseStudy.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{getSubjectDisplayName(caseStudy.subject)}</span>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Assigned</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{caseStudy.title}</h3>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{caseStudy.shortDescription}</p>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-500">{caseStudy.modules?.length || 0} modules</span>
                  <span className="text-gray-500 flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{getEnrollmentCount(caseStudy)} students</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleViewCaseStudy(caseStudy)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>View Case Study</span>
                  </button>

                  <button
                    onClick={() => handleManageStudents(caseStudy)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
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
