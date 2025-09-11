import { BusinessSubject } from '@/types';
import { getSubjectDisplayName, getSubjectIcon } from '@/utils/subject-utils';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Plus, Sparkles } from 'lucide-react';
import SubjectFilter from '@/components/common/SubjectFilter';
import CaseStudyCard from './CaseStudyCard';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import type { DeleteResponse } from '@/types/api';

interface CaseStudyListItem {
  id: string;
  title: string;
  shortDescription: string;
  subject: BusinessSubject;
  createdBy: string | null;
  createdAt: string;
  modules: Array<{
    id: string;
  }>;
}

interface CaseStudiesTabProps {
  caseStudies: CaseStudyListItem[];
  filteredCaseStudies: CaseStudyListItem[];
  selectedSubject: BusinessSubject | 'ALL';
  setSelectedSubject: (subject: BusinessSubject | 'ALL') => void;
  loadingCaseStudies: boolean;
  onCreateCaseStudy: () => void;
  refetchCaseStudies: () => Promise<any>;
}

export default function CaseStudiesTab({
  caseStudies,
  filteredCaseStudies,
  selectedSubject,
  setSelectedSubject,
  loadingCaseStudies,
  onCreateCaseStudy,
  refetchCaseStudies,
}: CaseStudiesTabProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string>('');

  const { deleteData: deleteCaseStudy, loading: deletingCaseStudy } = useDeleteData<DeleteResponse, never>({
    successMessage: 'Case study deleted successfully!',
    errorMessage: 'Failed to delete case study',
  });

  const handleViewCaseStudy = (caseStudyId: string): void => {
    router.push(`/admin/case-study/${caseStudyId}`);
  };

  const handleEditCaseStudy = (caseStudyId: string): void => {
    router.push(`/admin/edit/${caseStudyId}`);
  };

  const handleDeleteCaseStudy = (caseStudyId: string): void => {
    setDeleteId(caseStudyId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    try {
      await deleteCaseStudy(`/api/case-studies/${deleteId}`);
      await refetchCaseStudies();
      setShowDeleteConfirm(false);
      setDeleteId('');
    } catch (error: unknown) {
      console.error('Error deleting case study:', error);
    }
  };
  return (
    <div className="flex gap-8">
      {caseStudies && caseStudies.length > 0 && (
        <SubjectFilter studies={caseStudies} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />
      )}

      <div className="flex-1">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">
              {selectedSubject === 'ALL' ? 'Case Studies Management' : `${getSubjectDisplayName(selectedSubject as BusinessSubject)} Studies`}
            </h2>
            <p className="text-gray-600/70 mt-1">Manage all case studies in the system</p>
          </div>
          <button
            onClick={onCreateCaseStudy}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Add Case Study</span>
          </button>
        </div>

        {loadingCaseStudies ? (
          <div className="flex justify-center items-center h-40">
            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
              <span className="text-lg font-medium text-gray-600">Loading case studies...</span>
            </div>
          </div>
        ) : caseStudies?.length === 0 ? (
          <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
            <CardContent className="text-center py-16">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="h-12 w-12 text-gray-600" />
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-gray-400 to-gray-500 p-2 rounded-full">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Case Studies</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Get started by creating a new case study for your educational platform.</p>
              <button
                onClick={onCreateCaseStudy}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Create Case Study</span>
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCaseStudies?.map((caseStudy) => (
              <CaseStudyCard
                key={caseStudy.id}
                caseStudy={caseStudy}
                onView={handleViewCaseStudy}
                onEdit={handleEditCaseStudy}
                onDelete={handleDeleteCaseStudy}
              />
            )) || []}
          </div>
        )}

        {caseStudies && caseStudies.length > 0 && filteredCaseStudies.length === 0 && selectedSubject !== 'ALL' && (
          <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
            <CardContent className="text-center py-16">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">{getSubjectIcon(selectedSubject as BusinessSubject)}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No {getSubjectDisplayName(selectedSubject as BusinessSubject)} Studies</h3>
              <p className="text-gray-600">There are no case studies in the {getSubjectDisplayName(selectedSubject as BusinessSubject)} subject area yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmationModal
        open={showDeleteConfirm}
        showSemiTransparentBg={true}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        confirming={deletingCaseStudy}
        title="Delete Case Study"
        confirmationText="Are you sure you want to delete this case study? This action cannot be undone."
        askForTextInput={false}
      />
    </div>
  );
}
