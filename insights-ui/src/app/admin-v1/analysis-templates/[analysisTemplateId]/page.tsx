'use client';

import React, { useState } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import RawJsonEditModal from '@/components/prompts/RawJsonEditModal';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useParams } from 'next/navigation';
import { AnalysisTemplateWithRelations } from '../../../api/analysis-templates/route';
import { CreateCategoriesRequest, AnalysisTemplateCategoryWithTypes } from '../../../api/analysis-templates/[analysisTemplateId]/categories/route';
import { CreateAnalysisTypesRequest } from '../../../api/analysis-templates/[analysisTemplateId]/analysis-types/route';
import { AnalysisTemplateParameter } from '@prisma/client';
import DeleteConfirmationModal from '../../industry-management/DeleteConfirmationModal';
import { TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AnalysisTemplateDetailPage() {
  const params = useParams() as { analysisTemplateId: string };

  const [categoriesJson, setCategoriesJson] = useState<string>('[\n  {\n    "name": "Category Name",\n    "description": "Category Description"\n  }\n]');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [analysisTypes, setAnalysisTypes] = useState<CreateAnalysisTypesRequest['analysisTypes']>([
    {
      name: '',
      description: '',
      promptInstructions: '',
    },
  ]);
  const [analysisTypesJson, setAnalysisTypesJson] = useState<string>(
    '[\n  {\n    "name": "Analysis Type Name",\n    "description": "Detailed description of the analysis type",\n    "promptInstructions": "Instructions for the AI prompt"\n  }\n]'
  );
  const [useJsonForAnalysisTypes, setUseJsonForAnalysisTypes] = useState(false);
  const [showCategoriesJsonModal, setShowCategoriesJsonModal] = useState(false);
  const [showAnalysisTypesFormJsonModal, setShowAnalysisTypesFormJsonModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);

  const {
    data: template,
    loading: templateLoading,
    reFetchData: refetchTemplate,
  } = useFetchData<AnalysisTemplateWithRelations>(
    `${getBaseUrl()}/api/analysis-templates/${params.analysisTemplateId}`,
    { cache: 'no-cache' },
    'Failed to fetch analysis template'
  );

  const { postData: createCategories, loading: createCategoriesLoading } = usePostData<AnalysisTemplateCategoryWithTypes[], CreateCategoriesRequest>({
    successMessage: 'Categories created successfully!',
    errorMessage: 'Failed to create categories.',
  });

  const { postData: createAnalysisTypes, loading: createAnalysisTypesLoading } = usePostData<AnalysisTemplateParameter[], CreateAnalysisTypesRequest>({
    successMessage: 'Analysis types created successfully!',
    errorMessage: 'Failed to create analysis types.',
  });

  const { deleteData: deleteCategory, loading: deleteCategoryLoading } = useDeleteData({
    successMessage: 'Category deleted successfully!',
    errorMessage: 'Failed to delete category.',
  });

  const { deleteData: deleteAnalysisType, loading: deleteAnalysisTypeLoading } = useDeleteData({
    successMessage: 'Analysis type deleted successfully!',
    errorMessage: 'Failed to delete analysis type.',
  });

  const handleCategoriesJsonSave = (json: string) => {
    setCategoriesJson(json);
    setShowCategoriesJsonModal(false);
  };

  const handleAnalysisTypesJsonSave = (json: string) => {
    setAnalysisTypesJson(json);
    setShowAnalysisTypesFormJsonModal(false);
  };

  const addAnalysisTypeRow = () => {
    setAnalysisTypes([
      ...analysisTypes,
      {
        name: '',
        description: '',
        promptInstructions: '',
      },
    ]);
  };

  const updateAnalysisType = (index: number, field: keyof CreateAnalysisTypesRequest['analysisTypes'][0], value: string) => {
    const updatedAnalysisTypes = [...analysisTypes];
    updatedAnalysisTypes[index][field] = value;
    setAnalysisTypes(updatedAnalysisTypes);
  };

  const removeAnalysisTypeRow = (index: number) => {
    if (analysisTypes.length > 1) {
      setAnalysisTypes(analysisTypes.filter((_, i) => i !== index));
    }
  };

  const handleCreateCategories = async () => {
    try {
      const parsedCategories = JSON.parse(categoriesJson);
      if (!Array.isArray(parsedCategories)) {
        alert('Categories must be a JSON array');
        return;
      }

      const validCategories = parsedCategories.filter(
        (cat: any) => cat && typeof cat === 'object' && cat.name && typeof cat.name === 'string' && cat.name.trim()
      );

      if (validCategories.length === 0) {
        alert('No valid categories found. Each category must have a name.');
        return;
      }

      await createCategories(`${getBaseUrl()}/api/analysis-templates/${params.analysisTemplateId}/categories`, {
        categories: validCategories,
      });

      // Refetch template to update the list
      refetchTemplate();

      // Reset to default
      setCategoriesJson('[\n  {\n    "name": "Category Name",\n    "description": "Category Description"\n  }\n]');
    } catch (error) {
      alert('Invalid JSON format: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    await deleteCategory(`${getBaseUrl()}/api/analysis-templates/${params.analysisTemplateId}/categories/${categoryToDelete.id}`);
    refetchTemplate();
    setCategoryToDelete(null);
  };

  const handleDeleteAnalysisType = async (analysisTypeId: string) => {
    await deleteAnalysisType(`${getBaseUrl()}/api/analysis-templates/${params.analysisTemplateId}/analysis-types/${analysisTypeId}`);
    refetchTemplate();
  };

  const handleCreateAnalysisTypes = async () => {
    if (!selectedCategoryId) return;

    if (useJsonForAnalysisTypes) {
      // Handle JSON input
      try {
        const parsedAnalysisTypes = JSON.parse(analysisTypesJson);
        if (!Array.isArray(parsedAnalysisTypes)) {
          alert('Analysis types must be a JSON array');
          return;
        }

        const validAnalysisTypes = parsedAnalysisTypes.filter(
          (type: any) => type && typeof type === 'object' && type.name && typeof type.name === 'string' && type.name.trim()
        );

        if (validAnalysisTypes.length === 0) {
          alert('No valid analysis types found. Each analysis type must have a name.');
          return;
        }

        const processedAnalysisTypes = validAnalysisTypes;

        await createAnalysisTypes(`${getBaseUrl()}/api/analysis-templates/${params.analysisTemplateId}/analysis-types`, {
          categoryId: selectedCategoryId,
          analysisTypes: processedAnalysisTypes,
        });

        // Refetch template to update the list
        refetchTemplate();

        // Reset to default
        setAnalysisTypesJson(
          '[\n  {\n    "name": "Analysis Type Name",\n    "description": "Detailed description of the analysis type",\n    "promptInstructions": "Instructions for the AI prompt"\n  }\n]'
        );
        setSelectedCategoryId('');
      } catch (error) {
        alert('Invalid JSON format: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } else {
      // Handle form input
      const validAnalysisTypes = analysisTypes.filter((type) => type.name.trim());
      if (validAnalysisTypes.length === 0) return;

      await createAnalysisTypes(`${getBaseUrl()}/api/analysis-templates/${params.analysisTemplateId}/analysis-types`, {
        categoryId: selectedCategoryId,
        analysisTypes: validAnalysisTypes,
      });

      // Refetch template to update the list
      refetchTemplate();

      // Reset form
      setAnalysisTypes([
        {
          name: '',
          description: '',
          promptInstructions: '',
        },
      ]);
      setSelectedCategoryId('');
    }
  };

  const categoryOptions =
    template?.categories?.map((cat) => ({
      id: cat.id,
      label: cat.name,
    })) || [];

  if (templateLoading) {
    return <FullPageLoader />;
  }

  if (!template) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-8">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Template not found</h2>
            <p className="text-gray-400">The analysis template you’re looking for doesn’t exist.</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="pt-2 pb-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-8">
              {/* Left side - Template info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <DocumentTextIcon className="w-8 h-8 text-blue-500" />
                  <h1 className="text-3xl font-bold text-white">{template.name}</h1>
                </div>
                <div className="ml-11">
                  {template.description && <p className="text-gray-400 text-base">{template.description}</p>}
                  <p className="text-gray-400 text-base mt-2">Manage categories and analysis types for this template.</p>
                </div>
              </div>

              {/* Right side - Links */}
              <div className="flex flex-col gap-2 items-end">
                {template.analysisTemplateReports && template.analysisTemplateReports.length > 0 && (
                  <>
                    {template.analysisTemplateReports.map((report) => {
                      return (
                        <Link key={report.id} href={`/admin-v1/analysis-template-report/${report.id}`}>
                          <span className="text-blue-400 hover:text-blue-300 transition-colors text-sm">{report.reportName} →</span>
                        </Link>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Add Categories</h2>
            <p className="text-gray-300 text-sm mb-6">
              Add multiple categories at once using JSON format. Each category should have a name field (required) and optional description field.
            </p>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-white">Categories JSON *</label>
                <IconButton iconName={IconTypes.Edit} onClick={() => setShowCategoriesJsonModal(true)} tooltip="Edit JSON" />
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg w-full py-4 px-3 max-h-[300px] overflow-y-auto">
                <pre className="whitespace-pre-wrap break-words text-xs text-gray-300 overflow-x-auto">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(categoriesJson), null, 2);
                    } catch {
                      return categoriesJson;
                    }
                  })()}
                </pre>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleCreateCategories} primary loading={createCategoriesLoading}>
                Create Categories
              </Button>
            </div>
          </div>

          {/* Analysis Types Section */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Add Analysis Types</h2>

            <div className="mb-6">
              <StyledSelect
                label="Select Category *"
                selectedItemId={selectedCategoryId}
                items={categoryOptions}
                setSelectedItemId={(id) => setSelectedCategoryId(id || '')}
              />
            </div>

            <div className="mb-6">
              <div className="flex gap-4">
                <Button
                  onClick={() => setUseJsonForAnalysisTypes(false)}
                  variant={!useJsonForAnalysisTypes ? 'contained' : 'outlined'}
                  primary={!useJsonForAnalysisTypes}
                >
                  Form Input
                </Button>
                <Button
                  onClick={() => setUseJsonForAnalysisTypes(true)}
                  variant={useJsonForAnalysisTypes ? 'contained' : 'outlined'}
                  primary={useJsonForAnalysisTypes}
                >
                  JSON Input
                </Button>
              </div>
            </div>

            {useJsonForAnalysisTypes ? (
              // JSON Input Mode
              <div className="mb-6">
                <p className="text-gray-300 text-sm mb-4">Add multiple analysis types at once using JSON format.</p>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-white">Analysis Types JSON *</label>
                    <IconButton iconName={IconTypes.Edit} onClick={() => setShowAnalysisTypesFormJsonModal(true)} tooltip="Edit JSON" />
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg w-full py-4 px-3 max-h-[400px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-words text-xs text-gray-300 overflow-x-auto">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(analysisTypesJson), null, 2);
                        } catch {
                          return analysisTypesJson;
                        }
                      })()}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              // Form Input Mode
              <div className="space-y-6">
                {analysisTypes.map((analysisType, index) => (
                  <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="mb-4">
                      <Input
                        modelValue={analysisType.name}
                        onUpdate={(val) => updateAnalysisType(index, 'name', val as string)}
                        placeholder="Analysis type name"
                      >
                        Name *
                      </Input>
                    </div>

                    <div className="mb-4">
                      <TextareaAutosize
                        label="Description *"
                        modelValue={analysisType.description}
                        onUpdate={(val) => updateAnalysisType(index, 'description', val as string)}
                        placeholder="Detailed description"
                      />
                    </div>

                    <div className="mb-4">
                      <TextareaAutosize
                        label="Prompt Instructions *"
                        modelValue={analysisType.promptInstructions}
                        onUpdate={(val) => updateAnalysisType(index, 'promptInstructions', val as string)}
                        placeholder="Instructions for the prompt"
                      />
                    </div>

                    <Button onClick={() => removeAnalysisTypeRow(index)} variant="outlined" disabled={analysisTypes.length === 1}>
                      Remove This Analysis Type
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4 mt-6">
              {!useJsonForAnalysisTypes && (
                <Button onClick={addAnalysisTypeRow} variant="outlined">
                  Add Another Analysis Type
                </Button>
              )}
              <Button
                onClick={handleCreateAnalysisTypes}
                primary
                loading={createAnalysisTypesLoading}
                disabled={!selectedCategoryId || (useJsonForAnalysisTypes ? false : analysisTypes.every((type) => !type.name.trim()))}
              >
                Create Analysis Types
              </Button>
            </div>
          </div>

          {/* Existing Categories Display */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">Existing Categories</h2>
            {template.categories && template.categories.length > 0 ? (
              <div className="space-y-6">
                {template.categories.map((category) => (
                  <div key={category.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                        {category.description && <p className="text-gray-300 mt-2">{category.description}</p>}
                      </div>
                      <Button onClick={() => setCategoryToDelete({ id: category.id, name: category.name })} variant="outlined" loading={deleteCategoryLoading}>
                        <TrashIcon className="w-4 h-4 mr-1" />
                      </Button>
                    </div>
                    <div className="ml-4 mt-6">
                      <h4 className="font-medium text-white mb-4">Analysis Parameters:</h4>
                      {category.analysisParameters.length > 0 ? (
                        <ul className="space-y-3">
                          {category.analysisParameters.map((type) => (
                            <li key={type.id} className="flex justify-between items-center text-sm bg-gray-800 border border-gray-700 rounded-lg p-3">
                              <div>
                                <strong className="text-white">{type.name}</strong>
                                {type.description && <p className="text-gray-400 text-xs mt-1">{type.description}</p>}
                              </div>
                              <Button onClick={() => handleDeleteAnalysisType(type.id)} variant="outlined" size="sm" loading={deleteAnalysisTypeLoading}>
                                Delete
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 bg-gray-800 border border-gray-700 rounded-lg p-3">No analysis types yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
                <p className="text-gray-400">You haven’t created any categories for this template yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories JSON Edit Modal */}
      {showCategoriesJsonModal && (
        <RawJsonEditModal
          open={showCategoriesJsonModal}
          onClose={() => setShowCategoriesJsonModal(false)}
          title="Edit Categories JSON"
          sampleJson={categoriesJson}
          onSave={handleCategoriesJsonSave}
        />
      )}

      {/* Analysis Types Form JSON Edit Modal */}
      {showAnalysisTypesFormJsonModal && (
        <RawJsonEditModal
          open={showAnalysisTypesFormJsonModal}
          onClose={() => setShowAnalysisTypesFormJsonModal(false)}
          title="Edit Analysis Types JSON"
          sampleJson={analysisTypesJson}
          onSave={handleAnalysisTypesJsonSave}
        />
      )}

      {/* Category Delete Confirmation Modal */}
      {categoryToDelete && (
        <DeleteConfirmationModal
          open={!!categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          onDelete={handleDeleteCategory}
          title="Delete Category"
          confirmationText="DELETE"
        />
      )}
    </PageWrapper>
  );
}
