'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnrollmentWithRelations } from '@/types/api';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { Mail, Plus, Sparkles, UserCheck, Users, X } from 'lucide-react';
import { useState } from 'react';

interface ManageStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string;
  enrollmentTitle: string;
  refetchEnrollments: () => Promise<any>;
}

export default function ManageStudentsModal({ isOpen, onClose, enrollmentId, enrollmentTitle, refetchEnrollments }: ManageStudentsModalProps) {
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Fetch enrollment data with students
  const {
    data: enrollment,
    loading: loadingEnrollment,
    reFetchData,
  } = useFetchData<EnrollmentWithRelations>(
    `/api/enrollments/${enrollmentId}`,
    { skipInitialFetch: !enrollmentId || !isOpen },
    'Failed to load enrollment details'
  );

  const { postData: addStudent, loading: addingStudent } = usePostData(
    {
      successMessage: 'Student added successfully!',
      errorMessage: 'Failed to add student',
    },
    {}
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
        await refetchEnrollments();
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
        await refetchEnrollments();
      }
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden bg-white/95 backdrop-blur-md border border-emerald-100/50 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-emerald-50 to-green-50 -m-6 mb-2 p-6 rounded-t-lg border-b border-emerald-100">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent flex items-center space-x-2">
            <Users className="h-5 w-5 text-emerald-500" />
            <span>Manage Students - {enrollmentTitle}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pb-4">
          <div className="mb-8 bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-100">
            <h4 className="text-lg font-bold text-emerald-700 mb-4 flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Add New Student</span>
            </h4>
            <div className="flex space-x-3">
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
                  className={`bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 placeholder:text-gray-500 ${
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
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>{addingStudent ? 'Adding...' : 'Add'}</span>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-emerald-700 mb-4 flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span>Enrolled Students {enrollment && `(${enrollment.students?.length})`}</span>
            </h4>

            {loadingEnrollment ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg border border-emerald-100">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                  <span className="text-emerald-600 font-medium">Loading students...</span>
                </div>
              </div>
            ) : !enrollment?.students?.length ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <Mail className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500 italic">No students enrolled yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enrollment.students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-emerald-100 p-2 rounded-full">
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{student.assignedStudentId}</span>
                        <div className="text-xs text-gray-500">Added {new Date(student.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemoveStudent(student.assignedStudentId)}
                      variant="ghost"
                      size="sm"
                      disabled={removingStudent}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
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
      </DialogContent>
    </Dialog>
  );
}
