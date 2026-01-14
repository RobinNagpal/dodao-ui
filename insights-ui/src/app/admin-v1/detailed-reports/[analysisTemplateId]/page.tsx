'use client';

import React, { useState } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import RawJsonEditModal from '@/components/prompts/RawJsonEditModal';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { useParams } from 'next/navigation';
import Link from 'next/link';

/** ---------- Types ---------- */

/** ---------- Types ---------- */

interface CategoryFormData {
  name: string;
  description: string;
}

interface AnalysisTypeFormData {
  name: string;
  oneLineSummary: string;
  description: string;
  promptInstructions: string;
  outputSchema: string;
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

interface Category {
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
}

interface AnalysisType {
  id: string;
  name: string;
  oneLineSummary: string;
  description: string;
  promptInstructions: string;
  outputSchema: string | null;
}

export default function AnalysisTemplateDetailPage() {
  const params = useParams() as { analysisTemplateId: string };
  
  const [categoriesJson, setCategoriesJson] = useState<string>('[\n  {\n    "name": "Category Name",\n    "description": "Category Description"\n  }\n]');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [analysisTypes, setAnalysisTypes] = useState<AnalysisTypeFormData[]>([{
    name: '',
    oneLineSummary: '',
    description: '',
    promptInstructions: '',
    outputSchema: ''
  }]);
  const [analysisTypesJson, setAnalysisTypesJson] = useState<string>('[\n  {\n    "name": "Analysis Type Name",\n    "oneLineSummary": "Brief summary of what this analysis does",\n    "description": "Detailed description of the analysis type",\n    "promptInstructions": "Instructions for the AI prompt",\n    "outputSchema": {\n      "type": "object",\n      "properties": {\n        "result": {\n          "type": "string"\n        }\n      }\n    }\n  }\n]');
  const [useJsonForAnalysisTypes, setUseJsonForAnalysisTypes] = useState(false);
  const [showCategoriesJsonModal, setShowCategoriesJsonModal] = useState(false);
  const [showAnalysisTypesJsonModal, setShowAnalysisTypesJsonModal] = useState(false);
  const [showAnalysisTypesFormJsonModal, setShowAnalysisTypesFormJsonModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  const { data: template, loading: templateLoading, reFetchData: refetchTemplate } = useFetchData<AnalysisTemplate>(
    `${getBaseUrl()}/api/admin-v1/detailed-reports/${params.analysisTemplateId}`,
    { cache: 'no-cache' },
    'Failed to fetch analysis template'
  );

  const { postData: createCategories, loading: createCategoriesLoading } = usePostData<
    Category[],
    { categories: CategoryFormData[] }
  >({
    successMessage: 'Categories created successfully!',
    errorMessage: 'Failed to create categories.',
  });

  const { postData: createAnalysisTypes, loading: createAnalysisTypesLoading } = usePostData<
    AnalysisType[],
    { categoryId: string; analysisTypes: AnalysisTypeFormData[] }
  >({
    successMessage: 'Analysis types created successfully!',
    errorMessage: 'Failed to create analysis types.',
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
    setAnalysisTypes([...analysisTypes, {
      name: '',
      oneLineSummary: '',
      description: '',
      promptInstructions: '',
      outputSchema: ''
    }]);
  };

  const updateAnalysisType = (index: number, field: keyof AnalysisTypeFormData, value: string) => {
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

      const validCategories = parsedCategories.filter((cat: any) =>
        cat && typeof cat === 'object' && cat.name && typeof cat.name === 'string' && cat.name.trim()
      );

      if (validCategories.length === 0) {
        alert('No valid categories found. Each category must have a name.');
        return;
      }

      await createCategories(`${getBaseUrl()}/api/admin-v1/detailed-reports/${params.analysisTemplateId}/categories`, {
        categories: validCategories
      });

      // Refetch template to update the list
      refetchTemplate();

      // Reset to default
      setCategoriesJson('[\n  {\n    "name": "Category Name",\n    "description": "Category Description"\n  }\n]');
    } catch (error) {
      alert('Invalid JSON format: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
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

        const validAnalysisTypes = parsedAnalysisTypes.filter((type: any) =>
          type && typeof type === 'object' && type.name && typeof type.name === 'string' && type.name.trim()
        );

        if (validAnalysisTypes.length === 0) {
          alert('No valid analysis types found. Each analysis type must have a name.');
          return;
        }

        // Convert outputSchema to string if it's an object
        const processedAnalysisTypes = validAnalysisTypes.map((type: any) => ({
          ...type,
          outputSchema: type.outputSchema ? 
            (typeof type.outputSchema === 'string' ? type.outputSchema : JSON.stringify(type.outputSchema)) 
            : undefined
        }));

        await createAnalysisTypes(`${getBaseUrl()}/api/admin-v1/detailed-reports/${params.analysisTemplateId}/analysis-types`, {
          categoryId: selectedCategoryId,
          analysisTypes: processedAnalysisTypes
        });

        // Refetch template to update the list
        refetchTemplate();

        // Reset to default
        setAnalysisTypesJson('[\n  {\n    "name": "Analysis Type Name",\n    "oneLineSummary": "Brief summary of what this analysis does",\n    "description": "Detailed description of the analysis type",\n    "promptInstructions": "Instructions for the AI prompt",\n    "outputSchema": {\n      "type": "object",\n      "properties": {\n        "result": {\n          "type": "string"\n        }\n      }\n    }\n  }\n]');
        setSelectedCategoryId('');
      } catch (error) {
        alert('Invalid JSON format: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } else {
      // Handle form input
      const validAnalysisTypes = analysisTypes.filter(type => type.name.trim());
      if (validAnalysisTypes.length === 0) return;

      await createAnalysisTypes(`${getBaseUrl()}/api/admin-v1/detailed-reports/${params.analysisTemplateId}/analysis-types`, {
        categoryId: selectedCategoryId,
        analysisTypes: validAnalysisTypes
      });

      // Refetch template to update the list
      refetchTemplate();

      // Reset form
      setAnalysisTypes([{
        name: '',
        oneLineSummary: '',
        description: '',
        promptInstructions: '',
        outputSchema: ''
      }]);
      setSelectedCategoryId('');
    }
  };

  const openAnalysisTypesJsonModal = (index: number) => {
    setEditingIndex(index);
    setShowAnalysisTypesJsonModal(true);
  };

  const handleJsonSave = (json: string) => {
    if (editingIndex >= 0) {
      updateAnalysisType(editingIndex, 'outputSchema', json);
    }
    setShowAnalysisTypesJsonModal(false);
    setEditingIndex(-1);
  };

  const categoryOptions = template?.categories?.map(cat => ({
    id: cat.id,
    label: cat.name
  })) || [];

  if (templateLoading) {
    return (
      <PageWrapper>
        <p>Loading template...</p>
      </PageWrapper>
    );
  }

  if (!template) {
    return (
      <PageWrapper>
        <p>Template not found</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="text-color">
        <div className="mb-6">
          <Link href="/admin-v1/detailed-reports" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Templates
          </Link>
          <h1 className="text-3xl heading-color mb-2">{template.name}</h1>
          {template.description && (
            <p className="text-gray-600">{template.description}</p>
          )}
        </div>

        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="text-2xl heading-color mb-4">Add Categories</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add multiple categories at once using JSON format. Each category should have a "name" field (required) and optional "description" field.
          </p>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Categories JSON *</label>
              <IconButton
                iconName={IconTypes.Edit}
                onClick={() => setShowCategoriesJsonModal(true)}
                tooltip="Edit JSON"
              />
            </div>
            <div className="block-bg-color w-full py-4 px-2 border rounded max-h-[300px] overflow-y-auto">
              <pre className="whitespace-pre-wrap break-words text-xs overflow-x-auto">
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
            <Button
              onClick={handleCreateCategories}
              primary
              loading={createCategoriesLoading}
            >
              Create Categories
            </Button>
          </div>
        </div>

        {/* Analysis Types Section */}
        <div className="mb-12">
          <h2 className="text-2xl heading-color mb-4">Add Analysis Types</h2>

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
                variant={!useJsonForAnalysisTypes ? "contained" : "outlined"}
                primary={!useJsonForAnalysisTypes}
              >
                Form Input
              </Button>
              <Button
                onClick={() => setUseJsonForAnalysisTypes(true)}
                variant={useJsonForAnalysisTypes ? "contained" : "outlined"}
                primary={useJsonForAnalysisTypes}
              >
                JSON Input
              </Button>
            </div>
          </div>

          {useJsonForAnalysisTypes ? (
            // JSON Input Mode
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Add multiple analysis types at once using JSON format. The outputSchema can be either a JSON object or a string.
              </p>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Analysis Types JSON *</label>
                  <IconButton
                    iconName={IconTypes.Edit}
                    onClick={() => setShowAnalysisTypesFormJsonModal(true)}
                    tooltip="Edit JSON"
                  />
                </div>
                <div className="block-bg-color w-full py-4 px-2 border rounded max-h-[400px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap break-words text-xs overflow-x-auto">
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
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    modelValue={analysisType.name}
                    onUpdate={(val) => updateAnalysisType(index, 'name', val as string)}
                    placeholder="Analysis type name"
                  >
                    Name *
                  </Input>
                  <Input
                    modelValue={analysisType.oneLineSummary}
                    onUpdate={(val) => updateAnalysisType(index, 'oneLineSummary', val as string)}
                    placeholder="One line summary"
                  >
                    One Line Summary *
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

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Output Schema (JSON)</label>
                    <IconButton
                      iconName={IconTypes.Edit}
                      onClick={() => openAnalysisTypesJsonModal(index)}
                      tooltip="Edit JSON"
                    />
                  </div>
                  <div className="block-bg-color w-full py-2 px-2 border rounded">
                    {analysisType.outputSchema ? (
                      <pre className="whitespace-pre-wrap break-words text-xs overflow-x-auto max-h-[100px] overflow-y-auto">
                        {JSON.stringify(JSON.parse(analysisType.outputSchema), null, 2)}
                      </pre>
                    ) : (
                      <pre className="text-xs text-gray-500">Click edit icon to add JSON schema</pre>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => removeAnalysisTypeRow(index)}
                  variant="outlined"
                  disabled={analysisTypes.length === 1}
                >
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
              disabled={!selectedCategoryId || (useJsonForAnalysisTypes ? false : analysisTypes.every(type => !type.name.trim()))}
            >
              Create Analysis Types
            </Button>
          </div>
        </div>

        {/* Existing Categories Display */}
        <div>
          <h2 className="text-2xl heading-color mb-4">Existing Categories</h2>
          {template.categories && template.categories.length > 0 ? (
            <div className="space-y-4">
              {template.categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-gray-600 mb-4">{category.description}</p>
                  )}
                  <div className="ml-4">
                    <h4 className="font-medium mb-2">Analysis Types:</h4>
                    {category.analysisTypes.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {category.analysisTypes.map((type) => (
                          <li key={type.id} className="text-sm">
                            <strong>{type.name}</strong>: {type.oneLineSummary}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No analysis types yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No categories created yet</p>
          )}
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

      {/* Analysis Types Output Schema JSON Edit Modal */}
      {showAnalysisTypesJsonModal && editingIndex >= 0 && (
        <RawJsonEditModal
          open={showAnalysisTypesJsonModal}
          onClose={() => {
            setShowAnalysisTypesJsonModal(false);
            setEditingIndex(-1);
          }}
          title="Edit Output Schema JSON"
          sampleJson={analysisTypes[editingIndex]?.outputSchema || ''}
          onSave={handleJsonSave}
        />
      )}
    </PageWrapper>
  );
}