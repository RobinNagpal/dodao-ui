import CreateEnrollmentModal from '@/components/admin/CreateEnrollmentModal';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Plus, Users } from 'lucide-react';
import EnrollmentRow from './EnrollmentRow';
import { useState } from 'react';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { DeleteResponse, EnrollmentWithRelations } from '@/types/api';
import ManageStudentsModal from './ManageStudentsModal';

export default function EnrollmentsTab() {
  const [showManageStudents, setShowManageStudents] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>('');
  const [selectedEnrollmentTitle, setSelectedEnrollmentTitle] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string>('');
  const [showCreateEnrollment, setShowCreateEnrollment] = useState<boolean>(false);

  const onCreateEnrollment = () => {
    setShowCreateEnrollment(true);
  };

  const {
    data: enrollments,
    loading: loadingEnrollments,
    reFetchData: refetchEnrollments,
  } = useFetchData<EnrollmentWithRelations[]>(`${getBaseUrl()}/api/enrollments`, {}, 'Failed to load enrollments');

  const { deleteData: deleteEnrollment, loading: deletingEnrollment } = useDeleteData<DeleteResponse, never>({
    successMessage: 'Enrollment deleted successfully!',
    errorMessage: 'Failed to delete enrollment',
  });

  const handleManageStudents = (enrollment: EnrollmentWithRelations): void => {
    setSelectedEnrollmentId(enrollment.id);
    setSelectedEnrollmentTitle(enrollment.caseStudy.title);
    setShowManageStudents(true);
  };

  const handleDeleteEnrollment = (enrollmentId: string): void => {
    setDeleteId(enrollmentId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    try {
      // Find the enrollment to get the caseStudyId
      const enrollmentToDelete = enrollments?.find((e) => e.id === deleteId);
      if (!enrollmentToDelete) {
        throw new Error('Enrollment not found');
      }

      await deleteEnrollment(`/api/case-studies/${enrollmentToDelete.caseStudy.id}/class-enrollments/${deleteId}`);
      await refetchEnrollments();
      setShowDeleteConfirm(false);
      setDeleteId('');
    } catch (error: unknown) {
      console.error('Error deleting enrollment:', error);
    }
  };

  const handleEnrollmentSuccess = async (): Promise<void> => {
    await refetchEnrollments();
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Enrollment Management</h2>
          <p className="text-emerald-600/70 mt-1">Manage case study enrollments and student assignments</p>
        </div>
        <button
          onClick={onCreateEnrollment}
          className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Create Enrollment</span>
        </button>
      </div>

      {loadingEnrollments ? (
        <div className="flex justify-center items-center h-40">
          <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            <span className="text-lg font-medium text-emerald-600">Loading enrollments...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/50 overflow-hidden">
          {enrollments?.length === 0 ? (
            <div className="text-center py-16">
              <Users className="mx-auto h-16 w-16 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No enrollments</h3>
              <p className="text-gray-600 mb-6">Get started by creating a new enrollment.</p>
              <button
                onClick={onCreateEnrollment}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Create Enrollment</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-100">
                <thead className="bg-gradient-to-r from-emerald-50 to-green-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Case Study</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Class Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Assigned Instructor</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Students Enrolled</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {enrollments?.map((enrollment) => (
                    <EnrollmentRow key={enrollment.id} enrollment={enrollment} onManageStudents={handleManageStudents} onDelete={handleDeleteEnrollment} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showManageStudents && selectedEnrollmentId && (
        <ManageStudentsModal
          isOpen={showManageStudents}
          onClose={() => {
            setShowManageStudents(false);
            setSelectedEnrollmentId('');
            setSelectedEnrollmentTitle('');
          }}
          refetchEnrollments={refetchEnrollments}
          enrollmentId={selectedEnrollmentId}
          enrollmentTitle={selectedEnrollmentTitle}
          caseStudyId={enrollments?.find((e) => e.id === selectedEnrollmentId)?.caseStudy.id || ''}
        />
      )}

      <ConfirmationModal
        open={showDeleteConfirm}
        showSemiTransparentBg={true}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        confirming={deletingEnrollment}
        title="Delete Enrollment"
        confirmationText="Are you sure you want to delete this enrollment? This action cannot be undone."
        askForTextInput={false}
      />

      <CreateEnrollmentModal isOpen={showCreateEnrollment} onClose={() => setShowCreateEnrollment(false)} onSuccess={handleEnrollmentSuccess} />
    </div>
  );
}
