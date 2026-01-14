'use client';

import React, { useState } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import Link from 'next/link';

/** ---------- Types ---------- */

interface CreateTemplateFormData {
  name: string;
  description?: string;
}

interface AnalysisTemplate {
  id: string;
  name: string;
  description: string | null;
  categories: Array<{
    id: string;
    name: string;
    description: string | null;
    analysisTypes: Array<{
      id: string;
      name: string;
      oneLineSummary: string;
      description: string;
      promptInstructions: string;
      outputSchema: string | null;
    }>;
  }>;
}

export default function DetailedReportsAdminPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateTemplateFormData>({
    name: '',
    description: ''
  });

  const { data: templates, loading: templatesLoading, reFetchData: refetchTemplates } = useFetchData<AnalysisTemplate[]>(
    `${getBaseUrl()}/api/admin-v1/detailed-reports`,
    { cache: 'no-cache' },
    'Failed to fetch analysis templates'
  );

  const { postData: createTemplate, loading: createTemplateLoading } = usePostData<
    AnalysisTemplate,
    CreateTemplateFormData
  >({
    successMessage: 'Analysis template created successfully!',
    errorMessage: 'Failed to create analysis template.',
  });

  const handleCreateTemplate = async () => {
    if (!formData.name.trim()) {
      alert('Template name is required');
      return;
    }

    await createTemplate(`${getBaseUrl()}/api/admin-v1/detailed-reports`, formData);
    
    // Refetch templates and reset form
    refetchTemplates();
    setFormData({ name: '', description: '' });
    setShowCreateModal(false);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({ name: '', description: '' });
  };

  return (
    <PageWrapper>
      <div className="text-color">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl heading-color">Analysis Templates</h1>
          <Button
            onClick={() => setShowCreateModal(true)}
            primary
            variant="contained"
          >
            Create New Template
          </Button>
        </div>

        <p className="text-gray-600 mb-8">
          Manage analysis templates that contain categories and analysis types for detailed reports.
        </p>

        {/* Templates List */}
        <div>
          {templatesLoading ? (
            <p>Loading templates...</p>
          ) : templates && templates.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                  {template.description && (
                    <p className="text-gray-600 mb-4">{template.description}</p>
                  )}
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-500">
                      {template.categories.length} categories, {' '}
                      {template.categories.reduce((total, cat) => total + cat.analysisTypes.length, 0)} analysis types
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link 
                      href={`/admin-v1/detailed-reports/${template.id}`}
                      className="flex-1"
                    >
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
              <Button
                onClick={() => setShowCreateModal(true)}
                primary
                variant="contained"
              >
                Create Your First Template
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      <FullPageModal
        open={showCreateModal}
        onClose={handleCloseModal}
        title="Create Analysis Template"
      >
        <div className="p-6 max-w-md mx-auto">
          <div className="space-y-4">
            <Input
              modelValue={formData.name}
              onUpdate={(val) => setFormData(prev => ({ ...prev, name: val as string }))}
              placeholder="Enter template name"
            >
              Template Name *
            </Input>

            <TextareaAutosize
              label="Description"
              modelValue={formData.description}
              onUpdate={(val) => setFormData(prev => ({ ...prev, description: val as string }))}
              placeholder="Enter template description (optional)"
            />
          </div>

          <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTemplate}
              primary
              loading={createTemplateLoading}
              disabled={!formData.name.trim()}
              className="flex-1"
            >
              Create Template
            </Button>
          </div>
        </div>
      </FullPageModal>
    </PageWrapper>
  );
}