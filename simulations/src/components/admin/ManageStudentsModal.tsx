'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, UserCheck } from 'lucide-react';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';

interface Student {
  id: string;
  assignedStudentId: string;
  createdBy: string | null; // Admin email
  createdAt: string;
}

interface Enrollment {
  id: string;
  caseStudy: {
    title: string;
  };
  students: Student[];
}

interface ManageStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string;
  enrollmentTitle: string;
}

export default function ManageStudentsModal({ isOpen, onClose, enrollmentId, enrollmentTitle }: ManageStudentsModalProps) {
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Fetch enrollment data with students
  const {
    data: enrollment,
    loading: loadingEnrollment,
    reFetchData,
  } = useFetchData<Enrollment>(`/api/enrollments/${enrollmentId}`, { skipInitialFetch: !enrollmentId || !isOpen }, 'Failed to load enrollment details');

  const adminEmail = localStorage.getItem('user_email') || 'admin@example.com';

  const { postData: addStudent, loading: addingStudent } = usePostData(
    {
      successMessage: 'Student added successfully!',
      errorMessage: 'Failed to add student',
    },
    {
      headers: {
        'admin-email': adminEmail,
      },
    }
  );

  const { deleteData: removeStudent, loading: removingStudent } = useDeleteData({
    successMessage: 'Student removed successfully!',
    errorMessage: 'Failed to remove student',
  });

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
    };

    try {
      const result = await addStudent(`/api/enrollments/${enrollmentId}/students`, payload);

      if (result) {
        setNewStudentEmail('');
        setEmailError('');
        await reFetchData();
      }
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleRemoveStudent = async (studentEmail: string) => {
    const payload = {
      studentEmail,
    };

    try {
      const result = await removeStudent(`/api/enrollments/${enrollmentId}/students/remove`, payload);

      if (result) {
        await reFetchData();
      }
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Manage Students - {enrollmentTitle}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] p-4">
          {/* Add Student Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Add New Student</h4>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="studentEmail" className="sr-only">
                  Student Email
                </Label>
                <Input
                  id="studentEmail"
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="Enter student email"
                  className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                    emailError ? 'border-red-500' : ''
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddStudent();
                    }
                  }}
                />
                {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
              </div>
              <Button
                onClick={handleAddStudent}
                disabled={addingStudent}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
              >
                <Plus className="h-4 w-4" />
                <span>{addingStudent ? 'Adding...' : 'Add'}</span>
              </Button>
            </div>
          </div>

          {/* Enrolled Students Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Enrolled Students {enrollment && `(${enrollment.students.length})`}</h4>

            {loadingEnrollment ? (
              <p className="text-gray-500 dark:text-gray-400 italic">Loading students...</p>
            ) : !enrollment?.students.length ? (
              <p className="text-gray-500 dark:text-gray-400 italic">No students enrolled yet.</p>
            ) : (
              <div className="space-y-2">
                {enrollment.students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-gray-900 dark:text-gray-100">{student.assignedStudentId}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">(Added {new Date(student.createdAt).toLocaleDateString()})</span>
                    </div>
                    <Button
                      onClick={() => handleRemoveStudent(student.assignedStudentId)}
                      variant="ghost"
                      size="sm"
                      disabled={removingStudent}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-1"
                      title="Remove student"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-600">
          <Button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-700 text-white" variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
