'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getEnrolledCaseStudies, isStudentEnrolled } from '@/data/mockData';
import type { CaseStudy, BusinessSubject } from '@/types';
import { BookOpen, LogOut, GraduationCap, Lock, ArrowRight } from 'lucide-react';

export default function StudentDashboard() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<BusinessSubject | 'ALL'>('ALL');
  const [enrolledCaseStudies, setEnrolledCaseStudies] = useState<CaseStudy[]>([]);
  const [filteredCaseStudies, setFilteredCaseStudies] = useState<CaseStudy[]>([]);
  const router = useRouter();

  // Check authentication on page load
  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    const email = localStorage.getItem('user_email');

    if (!userType || userType !== 'student' || !email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);

    // Load only enrolled case studies for this student
    const enrolled = getEnrolledCaseStudies(email);
    setEnrolledCaseStudies(enrolled);
    setFilteredCaseStudies(enrolled); // Initially show all enrolled case studies
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    // Filter enrolled case studies based on selected subject
    if (selectedSubject === 'ALL') {
      setFilteredCaseStudies(enrolledCaseStudies);
    } else {
      setFilteredCaseStudies(enrolledCaseStudies.filter((cs) => cs.subject === selectedSubject));
    }
  }, [selectedSubject, enrolledCaseStudies]);

  const handleLogout = () => {
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_email');
    router.push('/login');
  };

  const handleStartCaseStudy = (caseStudy: CaseStudy) => {
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

  // Get subjects with counts from enrolled case studies only
  const getEnrolledSubjectsWithCounts = () => {
    const subjects: BusinessSubject[] = ['MARKETING', 'FINANCE', 'HR', 'OPERATIONS', 'ECONOMICS'];
    return subjects
      .map((subject) => ({
        subject,
        count: enrolledCaseStudies.filter((cs) => cs.subject === subject).length,
      }))
      .filter((item) => item.count > 0); // Only show subjects with enrolled case studies
  };

  const enrolledSubjectsWithCounts = getEnrolledSubjectsWithCounts();

  if (isLoading) {
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
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
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
        <div className="flex gap-8">
          {/* Sidebar - Only show if student has enrolled case studies */}
          {enrolledCaseStudies.length > 0 && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Subjects</h3>

                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedSubject('ALL')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedSubject === 'ALL' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>All Subjects</span>
                    <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">{enrolledCaseStudies.length}</span>
                  </button>

                  {enrolledSubjectsWithCounts.map(({ subject, count }) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedSubject === subject ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{getSubjectDisplayName(subject)}</span>
                      <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedSubject === 'ALL' ? 'Your Enrolled Case Studies' : `${getSubjectDisplayName(selectedSubject as BusinessSubject)} Case Studies`}
              </h2>
              <p className="text-gray-600">
                {enrolledCaseStudies.length === 0
                  ? 'You are not enrolled in any case studies yet. Contact your instructor to get enrolled.'
                  : 'Continue your learning journey with these case studies.'}
              </p>
            </div>

            {enrolledCaseStudies.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Case Studies Enrolled</h3>
                <p className="text-gray-600 mb-4">You haven&apos;t been enrolled in any case studies yet.</p>
                <p className="text-sm text-gray-500">Contact your instructor or admin to get enrolled in case studies.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCaseStudies.map((caseStudy) => (
                  <div key={caseStudy.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {getSubjectDisplayName(caseStudy.subject)}
                          </span>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Enrolled</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{caseStudy.title}</h3>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{caseStudy.shortDescription}</p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-500">{caseStudy.modules?.length || 0} modules</span>
                    </div>

                    <button
                      onClick={() => handleStartCaseStudy(caseStudy)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Start Case Study</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* No filtered results */}
            {enrolledCaseStudies.length > 0 && filteredCaseStudies.length === 0 && selectedSubject !== 'ALL' && (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Case Studies in {getSubjectDisplayName(selectedSubject as BusinessSubject)}</h3>
                <p className="text-gray-600">You are not enrolled in any {getSubjectDisplayName(selectedSubject as BusinessSubject)} case studies.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
