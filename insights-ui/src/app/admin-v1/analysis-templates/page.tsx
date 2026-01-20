'use client';

import React, { useState } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { AnalysisTemplateWithRelations } from '../../api/analysis-templates/route';
import AddEditAnalysisTemplateModal from './AddEditAnalysisTemplateModal';
import { PencilIcon } from '@heroicons/react/24/outline';

export default function DetailedReportsAdminPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AnalysisTemplateWithRelations | null>(null);

  const {
    data: templates,
    loading: templatesLoading,
    reFetchData: refetchTemplates,
  } = useFetchData<AnalysisTemplateWithRelations[]>(`${getBaseUrl()}/api/analysis-templates`, { cache: 'no-cache' }, 'Failed to fetch analysis templates');

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

  return (
    <PageWrapper>
      <div className="text-color">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl heading-color">Analysis Templates</h1>
          <Button onClick={handleCreateTemplate} primary variant="contained">
            Create New Template
          </Button>
        </div>

        <p className="text-gray-600 mb-8">Manage analysis templates that contain categories and analysis types for detailed reports.</p>

        {/* Templates List */}
        <div>
          {templatesLoading ? (
            <p>Loading templates...</p>
          ) : templates && templates.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                  {template.description && <p className="text-gray-600 mb-4">{template.description}</p>}

                  <div className="mb-4">
                    <div className="text-sm text-gray-500">
                      {template.categories.length} categories, {template.categories.reduce((total, cat) => total + cat.analysisParameters.length, 0)} analysis parameters
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleEditTemplate(template)} variant="outlined" className="flex items-center gap-2">
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </Button>
                    <Link href={`/admin-v1/analysis-templates/${template.id}`} className="flex-1">
                      <Button variant="contained" primary className="w-full">
                        Manage Template
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No analysis templates created yet</p>
              <Button onClick={handleCreateTemplate} primary variant="contained">
                Create Your First Template
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Template Modal */}
      <AddEditAnalysisTemplateModal isOpen={showModal} onClose={handleCloseModal} onSuccess={handleModalSuccess} existingTemplate={editingTemplate} />
    </PageWrapper>
  );
}
