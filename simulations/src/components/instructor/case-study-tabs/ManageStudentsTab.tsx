'use client';

import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { UserCheck, Plus, Users, Trash2, Key, ExternalLink } from 'lucide-react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import AddStudentModal from '../AddStudentModal';
import SignInCodeModal from '../SignInCodeModal';
import InstructorBulkAddStudentsModal from '../InstructorBulkAddStudentsModal';

export interface AddStudentEnrollmentRequest {
  studentEmail?: string;
  studentName?: string;
  students?: Array<{ name?: string; email: string }>;
}

interface EnrolledStudent {
  email: string;
  name?: string;
  studentEnrollmentId: string;
  userId: string;
}

interface ManageStudentsTabProps {
  caseStudyId: string;
  classEnrollmentId: string;
}

const ManageStudentsTab: FC<ManageStudentsTabProps> = ({ caseStudyId, classEnrollmentId }) => {
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedStudentForCode, setSelectedStudentForCode] = useState<EnrolledStudent | null>(null);

  const {
    data: enrolledStudentsData,
    loading: loadingStudents,
    reFetchData: refetchStudents,
  } = useFetchData<{ students: EnrolledStudent[] }>(
    `${getBaseUrl()}/api/case-studies/${caseStudyId}/class-enrollments/${classEnrollmentId}/student-enrollments`,
    { skipInitialFetch: !classEnrollmentId },
    'Failed to load enrolled students'
  );

  const enrolledStudents = enrolledStudentsData?.students || [];

  const { postData: addStudent, loading: addingStudent } = usePostData<{ message: string }, AddStudentEnrollmentRequest>({
    successMessage: 'Student added successfully!',
    errorMessage: 'Failed to add student',
  });

  const { postData: addStudentsBatch, loading: addingStudentsBatch } = usePostData<{ message: string }, AddStudentEnrollmentRequest>({
    successMessage: 'Students processed successfully!',
    errorMessage: 'Failed to add students',
  });

  const { deleteData: removeStudent, loading: removingStudent } = useDeleteData<{ message: string }, AddStudentEnrollmentRequest>({
    successMessage: 'Student removed successfully!',
    errorMessage: 'Failed to remove student',
  });

  useEffect(() => {
    if (classEnrollmentId) {
      refetchStudents();
    }
  }, [classEnrollmentId, refetchStudents]);

  const handleAddStudent = async (name: string, email: string) => {
    const payload: AddStudentEnrollmentRequest = {
      studentEmail: email,
      studentName: name || undefined,
    };

    try {
      const result = await addStudent(`${getBaseUrl()}/api/case-studies/${caseStudyId}/class-enrollments/${classEnrollmentId}/student-enrollments`, payload);
      if (result) {
        setShowAddStudentModal(false);
        await refetchStudents();
      }
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleBulkAddStudents = async (students: Array<{ name?: string; email: string }>) => {
    const payload: AddStudentEnrollmentRequest = { students };

    const result = await addStudentsBatch(
      `${getBaseUrl()}/api/case-studies/${caseStudyId}/class-enrollments/${classEnrollmentId}/student-enrollments`,
      payload
    );

    if (result) {
      setShowBulkModal(false);
      await refetchStudents();
    }
  };

  const handleRemoveStudent = async (studentEnrollmentId: string) => {
    try {
      const result = await removeStudent(
        `${getBaseUrl()}/api/case-studies/${caseStudyId}/class-enrollments/${classEnrollmentId}/student-enrollments/${studentEnrollmentId}`
      );
      if (result) {
        await refetchStudents();
      }
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  return (
    <>
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
        {/* Header with action buttons */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <UserCheck className="h-6 w-6 text-blue-600 mr-2" />
            Enrolled Students ({enrolledStudents.length})
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center space-x-2 border-2 border-blue-200 text-blue-700 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-blue-50 font-medium"
            >
              <Users className="h-4 w-4" />
              <span>Add Multiple</span>
            </button>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Student List */}
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
            <p className="text-sm text-gray-500 mt-1">Add students using the buttons above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enrolledStudents.map((student) => (
              <div
                key={student.studentEnrollmentId}
                className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2 rounded-xl">
                      <UserCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/instructor/case-study/${caseStudyId}/class-enrollments/${classEnrollmentId}/student-enrollments/${student.studentEnrollmentId}`}
                        className="group flex items-center space-x-2 text-left transition-all duration-200 hover:text-purple-600 cursor-pointer"
                        title={`View details for ${student.name || student.email}`}
                      >
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-gray-900 font-medium group-hover:text-purple-600 transition-colors duration-200">
                            {student.name || student.email}
                          </span>
                          {student.name && (
                            <span className="text-sm text-gray-600 group-hover:text-purple-500 transition-colors duration-200">{student.email}</span>
                          )}
                        </div>
                        <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-purple-600 transition-all duration-200 group-hover:scale-110" />
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedStudentForCode(student)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium border border-blue-200"
                      title="View sign-in code"
                    >
                      <Key className="h-3.5 w-3.5" />
                      <span>Sign in Code</span>
                    </button>
                    <button
                      onClick={() => handleRemoveStudent(student.studentEnrollmentId)}
                      disabled={removingStudent}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-all duration-200 disabled:opacity-50 group-hover:bg-red-50"
                      title="Remove student"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Add Student Modal */}
      <AddStudentModal isOpen={showAddStudentModal} onClose={() => setShowAddStudentModal(false)} onSubmit={handleAddStudent} loading={addingStudent} />

      {/* Bulk Add Students Modal */}
      <InstructorBulkAddStudentsModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSubmit={handleBulkAddStudents}
        loading={addingStudentsBatch}
      />

      {/* Sign In Code Modal */}
      {selectedStudentForCode && (
        <SignInCodeModal
          isOpen={!!selectedStudentForCode}
          onClose={() => setSelectedStudentForCode(null)}
          userId={selectedStudentForCode.userId}
          studentName={selectedStudentForCode.name || ''}
          studentEmail={selectedStudentForCode.email}
        />
      )}
    </>
  );
};

export default ManageStudentsTab;
