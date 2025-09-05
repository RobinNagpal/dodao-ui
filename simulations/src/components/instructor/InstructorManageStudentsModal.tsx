'use client';

import { useState, useEffect } from 'react';
import { X, UserCheck, Plus, Users, Mail, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';

interface InstructorManageStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseStudyId: string;
  caseStudyTitle: string;
  instructorEmail: string;
}

export default function InstructorManageStudentsModal({ isOpen, onClose, caseStudyId, caseStudyTitle, instructorEmail }: InstructorManageStudentsModalProps) {
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const {
    data: enrolledStudents = [],
    loading: loadingStudents,
    reFetchData: refetchStudents,
  } = useFetchData<string[]>(
    `/api/instructor/enrollments/${caseStudyId}/students?instructorEmail=${encodeURIComponent(instructorEmail)}`,
    { skipInitialFetch: !caseStudyId || !instructorEmail },
    'Failed to load enrolled students'
  );

  const { postData: addStudent, loading: addingStudent } = usePostData({
    successMessage: 'Student added successfully!',
    errorMessage: 'Failed to add student',
  });

  const { deleteData: removeStudent, loading: removingStudent } = useDeleteData({
    successMessage: 'Student removed successfully!',
    errorMessage: 'Failed to remove student',
  });

  useEffect(() => {
    if (isOpen && caseStudyId && instructorEmail) {
      refetchStudents();
    }
  }, [isOpen, caseStudyId, instructorEmail, refetchStudents]);

  const handleAddStudent = async () => {
    // Reset error
    setEmailError('');

    if (!newStudentEmail.trim()) {
      setEmailError('Please enter a student email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStudentEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    const payload = {
      studentEmail: newStudentEmail.trim(),
      instructorEmail,
    };

    try {
      const result = await addStudent(`/api/instructor/enrollments/${caseStudyId}/students`, payload);
      if (result) {
        setNewStudentEmail('');
        setEmailError('');
        await refetchStudents();
      }
    } catch (error) {
      console.error('Error adding student:', error);
      setEmailError('Failed to add student');
    }
  };

  const handleRemoveStudent = async (studentEmail: string) => {
    const payload = {
      studentEmail,
      instructorEmail,
    };

    try {
      const result = await removeStudent(`/api/instructor/enrollments/${caseStudyId}/students`, payload);
      if (result) {
        await refetchStudents();
      }
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200/50">
        {/* Enhanced Header */}
        <div className="bg-blue-100/50 backdrop-blur-lg p-6 border-b border-gray-200/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-2 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Manage Students</h3>
                <p className="text-gray-600">{caseStudyTitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all duration-200">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {/* Enhanced Add Student Section */}
          <div className="mb-8">
            <div className="flex space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="Enter student email address"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 ${
                      emailError ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-green-500 bg-white'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddStudent();
                      }
                    }}
                    disabled={addingStudent}
                  />
                </div>
                {emailError && (
                  <div className="flex items-center space-x-2 mt-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm font-medium">{emailError}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleAddStudent}
                disabled={addingStudent || !newStudentEmail.trim()}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {addingStudent ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Add Student</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Enrolled Students Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserCheck className="h-5 w-5 text-blue-600 mr-2" />
              Enrolled Students ({enrolledStudents.length})
            </h4>

            {loadingStudents ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-blue-700 font-medium">Loading students...</span>
                </div>
              </div>
            ) : !enrolledStudents.length ? (
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 border border-gray-200 text-center">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No students enrolled yet.</p>
                <p className="text-sm text-gray-500 mt-1">Add students using the form above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enrolledStudents.map((studentEmail) => (
                  <div
                    key={studentEmail}
                    className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2 rounded-xl">
                          <UserCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <span className="text-gray-900 font-medium">{studentEmail}</span>
                          <div className="flex items-center space-x-1 mt-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">Enrolled</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(studentEmail)}
                        disabled={removingStudent}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-all duration-200 disabled:opacity-50 group-hover:bg-red-50"
                        title="Remove student"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
