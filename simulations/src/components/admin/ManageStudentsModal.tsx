'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { AlertCircle, Mail, Plus, RefreshCw, Trash2, UserCheck, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ManageStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string;
  enrollmentTitle: string;
  caseStudyId: string;
  refetchEnrollments: () => Promise<any>;
}

export default function ManageStudentsModal({ isOpen, onClose, enrollmentId, enrollmentTitle, caseStudyId, refetchEnrollments }: ManageStudentsModalProps) {
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showConfirmNewCode, setShowConfirmNewCode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch student enrollments with sign-in codes
  const {
    data: enrolledStudentsData,
    loading: loadingStudents,
    reFetchData,
  } = useFetchData<{ students: Array<{ email: string; name?: string; studentEnrollmentId: string; userId: string; signInCode?: string | null }> }>(
    `/api/case-studies/${caseStudyId}/class-enrollments/${enrollmentId}/student-enrollments`,
    { skipInitialFetch: !enrollmentId || !isOpen || !caseStudyId },
    'Failed to load enrolled students'
  );

  const enrolledStudents = enrolledStudentsData?.students || [];

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

  const { postData: generateNewCode, loading: generatingCode } = usePostData<{ code: string; message: string }, {}>(
    {
      successMessage: 'New sign-in code generated successfully!',
      errorMessage: 'Failed to generate new code',
    },
    {}
  );

  useEffect(() => {
    if (isOpen && enrollmentId) {
      reFetchData();
    }
  }, [isOpen, enrollmentId, reFetchData]);

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
      studentName: newStudentName.trim() || undefined,
    };

    try {
      const result = await addStudent(`/api/case-studies/${caseStudyId}/class-enrollments/${enrollmentId}/student-enrollments`, payload);

      if (result) {
        setNewStudentName('');
        setNewStudentEmail('');
        setEmailError('');
        await reFetchData();
        await refetchEnrollments();
      }
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleRemoveStudent = async (studentEnrollmentId: string) => {
    try {
      const result = await removeStudent(`/api/case-studies/${caseStudyId}/class-enrollments/${enrollmentId}/student-enrollments/${studentEnrollmentId}`);

      if (result) {
        await reFetchData();
        await refetchEnrollments();
      }
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  const handleGenerateNewCode = async () => {
    if (!selectedUserId) return;

    try {
      const result = await generateNewCode(`/api/users/${selectedUserId}/sign-in-code`, {});
      if (result) {
        setShowConfirmNewCode(false);
        setSelectedUserId(null);
        await reFetchData();
      }
    } catch (error) {
      console.error('Error generating new code:', error);
    }
  };

  const handleNewCodeClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowConfirmNewCode(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[5]">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-emerald-100/50">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 border-b border-emerald-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-emerald-500" />
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Manage Students - {enrollmentTitle}
                </h3>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all duration-200">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="mb-4 bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-100">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <Label htmlFor="studentName" className="sr-only">
                    Student Name
                  </Label>
                  <Input
                    id="studentName"
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Student name"
                    className="bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 placeholder:text-gray-500"
                    disabled={addingStudent}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="studentEmail" className="sr-only">
                    Student Email
                  </Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="student@email.com"
                    className={`bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 placeholder:text-gray-500 ${
                      emailError ? 'border-red-500' : ''
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddStudent();
                      }
                    }}
                    disabled={addingStudent}
                  />
                  {emailError && (
                    <div className="flex items-center space-x-2 mt-1 text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm font-medium">{emailError}</p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleAddStudent}
                  disabled={addingStudent || !newStudentEmail.trim()}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span>{addingStudent ? 'Adding...' : 'Add Student'}</span>
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-emerald-700 mb-4 flex items-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>Enrolled Students ({enrolledStudents.length})</span>
              </h4>

              {loadingStudents ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg border border-emerald-100">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                    <span className="text-emerald-600 font-medium">Loading students...</span>
                  </div>
                </div>
              ) : !enrolledStudents.length ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                  <Mail className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 italic">No students enrolled yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrolledStudents.map((student) => (
                    <div
                      key={student.studentEnrollmentId}
                      className="group flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="bg-emerald-100 p-2 rounded-xl">
                          <UserCheck className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex items-center flex-wrap gap-2 flex-1">
                          <span className="font-medium text-gray-900">{student.name || student.email}</span>
                          {student.name && <span className="text-sm text-gray-600">{student.email}</span>}
                          {student.signInCode && (
                            <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1 rounded-lg border border-emerald-200">
                              <span className="text-xs text-emerald-600 font-medium">Sign-in Code:</span>
                              <code className="text-xs font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                                {student.signInCode}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleNewCodeClick(student.userId)}
                          variant="outline"
                          size="sm"
                          disabled={generatingCode}
                          className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 text-sm font-medium"
                          title="Generate new sign-in code"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>New Code</span>
                        </Button>
                        <Button
                          onClick={() => handleRemoveStudent(student.studentEnrollmentId)}
                          variant="ghost"
                          size="sm"
                          disabled={removingStudent}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                          title="Remove student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for New Code - rendered outside Dialog to avoid stacking context issues */}
      <ConfirmationModal
        open={showConfirmNewCode}
        showSemiTransparentBg={true}
        onClose={() => {
          setShowConfirmNewCode(false);
          setSelectedUserId(null);
        }}
        onConfirm={handleGenerateNewCode}
        confirming={generatingCode}
        title="Generate New Sign-in Code"
        confirmationText="Are you sure you want to generate a new sign-in code for this student? Their current code will be deactivated and they will need to use the new code to sign in."
        askForTextInput={false}
      />
    </>
  );
}
