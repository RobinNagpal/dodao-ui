'use client';

import React, { useState } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { AnalysisTemplateWithRelations } from '../../api/analysis-templates/route';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import AddEditAnalysisTemplateModal from '@/components/analysis-templates/AddEditAnalysisTemplateModal';
import AnalysisTemplateActions from '@/components/analysis-templates/AnalysisTemplateActions';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';

export default function DetailedReportsAdminPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AnalysisTemplateWithRelations | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<AnalysisTemplateWithRelations | null>(null);

  const {
    data: templates,
    loading: templatesLoading,
    reFetchData: refetchTemplates,
  } = useFetchData<AnalysisTemplateWithRelations[]>(`${getBaseUrl()}/api/analysis-templates`, { cache: 'no-cache' }, 'Failed to fetch analysis templates');

  const { deleteData, loading: deleting } = useDeleteData<{ success: boolean }, any>({
    errorMessage: 'Failed to delete analysis template',
    successMessage: 'Analysis template deleted successfully',
  });

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowModal(true);
  };

  const handleEditTemplate = (template: AnalysisTemplateWithRelations) => {
    setEditingTemplate(template);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
  };

  const handleModalSuccess = () => {
    refetchTemplates();
  };

  const handleDeleteTemplate = (template: AnalysisTemplateWithRelations) => {
    setTemplateToDelete(template);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setTemplateToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      await deleteData(`${getBaseUrl()}/api/analysis-templates/${templateToDelete.id}`);
      refetchTemplates();
      handleCloseDeleteModal();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (templatesLoading) {
    return <FullPageLoader />;
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="pt-2 pb-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <DocumentTextIcon className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-white">Analysis Templates</h1>
              <div className="ml-auto">
                <Button onClick={handleCreateTemplate} primary variant="contained">
                  Create New Template
                </Button>
              </div>
            </div>
            <p className="text-gray-400 text-base ml-11">
              Discover {templates?.length || 0} analysis template{(templates?.length || 0) !== 1 ? 's' : ''} and explore their categories and parameters
            </p>
          </div>

          {/* Templates List */}
          {templates && templates.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Link key={template.id} href={`/admin-v1/analysis-templates/${template.id}`}>
                  <div className="bg-gray-900 rounded-2xl overflow-hidden transition-all border border-gray-800 hover:border-blue-500 relative group cursor-pointer">
                    <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                      <AnalysisTemplateActions onEdit={() => handleEditTemplate(template)} onDelete={() => handleDeleteTemplate(template)} />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 mb-2 pr-12">{template.name}</h3>
                      {template.description && <p className="text-gray-300 text-sm leading-relaxed mb-4">{template.description}</p>}

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Categories:</span>
                          <span className="text-white font-medium">{template.categories.length}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Analysis Parameters:</span>
                          <span className="text-white font-medium">{template.categories.reduce((total, cat) => total + cat.analysisParameters.length, 0)}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Generated Reports:</span>
                          <span className="text-white font-medium">{template._count?.analysisTemplateReports ?? 0}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-700 mt-4">
                        <span className="text-blue-400 group-hover:text-blue-300 transition-colors text-sm font-medium">Manage Template →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <DocumentTextIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No analysis templates yet</h3>
              <p className="text-gray-400 mb-4">You haven’t created any analysis templates yet.</p>
              <Button onClick={handleCreateTemplate} primary variant="contained">
                Create Your First Template
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Template Modal */}
      <AddEditAnalysisTemplateModal isOpen={showModal} onClose={handleCloseModal} onSuccess={handleModalSuccess} existingTemplate={editingTemplate} />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onDelete={handleConfirmDelete}
        title="Delete Analysis Template"
        deleting={deleting}
        deleteButtonText="Delete Template"
        confirmationText="DELETE"
      />
    </PageWrapper>
  );
}
