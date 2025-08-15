'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockCaseStudies, mockEnrollments, addStudentToEnrollment, removeStudentFromEnrollment, getEnrolledStudents } from '@/data/mockData';
import type { CaseStudy, CaseStudyEnrollment } from '@/types';
import { BookOpen, LogOut, Users, Plus, X, UserCheck, Settings, Edit, Trash2, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'case-studies' | 'enrollments' | 'users'>('case-studies');
  const [selectedEnrollment, setSelectedEnrollment] = useState<CaseStudyEnrollment | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<string[]>([]);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const router = useRouter();

  // Check authentication on page load
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

  const handleLogout = () => {
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_email');
    router.push('/login');
  };

  const handleManageEnrollment = (enrollment: CaseStudyEnrollment) => {
    setSelectedEnrollment(enrollment);
    const students = getEnrolledStudents(enrollment.caseStudyId);
    setEnrolledStudents(students);
    setShowStudentManagement(true);
  };

  const handleAddStudent = () => {
    if (!selectedEnrollment || !newStudentEmail.trim()) return;

    const success = addStudentToEnrollment(selectedEnrollment.caseStudyId, newStudentEmail.trim());
    if (success) {
      const updatedStudents = getEnrolledStudents(selectedEnrollment.caseStudyId);
      setEnrolledStudents(updatedStudents);
      setNewStudentEmail('');
    } else {
      alert('Failed to add student. They may already be enrolled.');
    }
  };

  const handleRemoveStudent = (studentEmail: string) => {
    if (!selectedEnrollment) return;

    const success = removeStudentFromEnrollment(selectedEnrollment.caseStudyId, studentEmail);
    if (success) {
      const updatedStudents = getEnrolledStudents(selectedEnrollment.caseStudyId);
      setEnrolledStudents(updatedStudents);
    } else {
      alert('Failed to remove student.');
    }
  };

  const getCaseStudyTitle = (caseStudyId: string) => {
    const caseStudy = mockCaseStudies.find((cs) => cs.id === caseStudyId);
    return caseStudy?.title || 'Unknown Case Study';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-900">Loading admin dashboard...</span>
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
              <div className="bg-red-100 p-3 rounded-xl">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('case-studies')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'case-studies' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Case Studies ({mockCaseStudies.length})
              </button>
              <button
                onClick={() => setActiveTab('enrollments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'enrollments' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Enrollments ({mockEnrollments.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Case Studies Tab */}
        {activeTab === 'case-studies' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Case Studies Management</h2>
                <p className="text-gray-600">Manage all case studies in the system</p>
              </div>
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Case Study</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCaseStudies.map((caseStudy) => (
                <div key={caseStudy.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{getSubjectDisplayName(caseStudy.subject)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{caseStudy.title}</h3>
                    </div>
                    <div className="flex space-x-1">
                      <button className="text-blue-600 hover:text-blue-800 p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{caseStudy.shortDescription}</p>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-500">{caseStudy.modules?.length || 0} modules</span>
                    <span className="text-gray-500">Created by {caseStudy.createdBy}</span>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Manage</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Enrollment Management</h2>
                <p className="text-gray-600">Manage case study enrollments and student assignments</p>
              </div>
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Enrollment</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Study</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Instructor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students Enrolled</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{getCaseStudyTitle(enrollment.caseStudyId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{enrollment.assignedInstructorId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{enrollment.students?.length || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enrollment.createdAt.toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onClick={() => handleManageEnrollment(enrollment)} className="text-blue-600 hover:text-blue-900">
                          Manage Students
                        </button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Student Management Modal */}
      {showStudentManagement && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Manage Students - {getCaseStudyTitle(selectedEnrollment.caseStudyId)}</h3>
                <button onClick={() => setShowStudentManagement(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Add Student Section */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Add New Student</h4>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="Enter student email"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={handleAddStudent}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Enrolled Students Section */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Enrolled Students ({enrolledStudents.length})</h4>
                {enrolledStudents.length === 0 ? (
                  <p className="text-gray-500 italic">No students enrolled yet.</p>
                ) : (
                  <div className="space-y-2">
                    {enrolledStudents.map((studentEmail) => (
                      <div key={studentEmail} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4 text-green-600" />
                          <span className="text-gray-900">{studentEmail}</span>
                        </div>
                        <button onClick={() => handleRemoveStudent(studentEmail)} className="text-red-600 hover:text-red-800 p-1" title="Remove student">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowStudentManagement(false)}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
