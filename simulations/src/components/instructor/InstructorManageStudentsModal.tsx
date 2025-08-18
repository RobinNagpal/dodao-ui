'use client';

import { useState, useEffect } from 'react';
import { X, UserCheck, Plus } from 'lucide-react';
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

  // Fetch enrolled students using the hook
  const {
    data: enrolledStudents = [],
    loading: loadingStudents,
    reFetchData: refetchStudents,
  } = useFetchData<string[]>(
    `/api/instructor/enrollments/${caseStudyId}/students?instructorEmail=${encodeURIComponent(instructorEmail)}`,
    { skipInitialFetch: !caseStudyId || !instructorEmail },
    'Failed to load enrolled students'
  );

  // Hooks for add and remove operations
  const { postData: addStudent, loading: addingStudent } = usePostData({
    successMessage: 'Student added successfully!',
    errorMessage: 'Failed to add student',
  });

  const { deleteData: removeStudent, loading: removingStudent } = useDeleteData({
    successMessage: 'Student removed successfully!',
    errorMessage: 'Failed to remove student',
  });

  // Load students when modal opens
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Manage Students - {caseStudyTitle}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Add Student Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Add New Student</h4>
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="Enter student email"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    emailError ? 'border-red-500' : ''
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddStudent();
                    }
                  }}
                  disabled={addingStudent}
                />
                {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
              </div>
              <button
                onClick={handleAddStudent}
                disabled={addingStudent || !newStudentEmail.trim()}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:bg-gray-400"
              >
                <Plus className="h-4 w-4" />
                <span>{addingStudent ? 'Adding...' : 'Add'}</span>
              </button>
            </div>
          </div>

          {/* Enrolled Students Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Enrolled Students ({enrolledStudents.length})</h4>

            {loadingStudents ? (
              <p className="text-gray-500 italic">Loading students...</p>
            ) : !enrolledStudents.length ? (
              <p className="text-gray-500 italic">No students enrolled yet.</p>
            ) : (
              <div className="space-y-2">
                {enrolledStudents.map((studentEmail) => (
                  <div key={studentEmail} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="text-gray-900">{studentEmail}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(studentEmail)}
                      disabled={removingStudent}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors disabled:opacity-50"
                      title="Remove student"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
