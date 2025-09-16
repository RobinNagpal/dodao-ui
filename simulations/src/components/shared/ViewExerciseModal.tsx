'use client';

import MarkdownEditor from '@/components/markdown/MarkdownEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ModuleExercise } from '@/types';
import { CaseStudyWithRelationsForInstructor, CaseStudyWithRelationsForStudents } from '@/types/api';
import { parseMarkdown } from '@/utils/parse-markdown';
import EllipsisDropdown from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Save, X } from 'lucide-react';
import { useState } from 'react';

interface ViewExerciseModalProps {
  open: boolean;
  onClose: () => void;
  exercise: ModuleExercise;
  moduleTitle?: string;
  moduleNumber?: number;
  caseStudy?: CaseStudyWithRelationsForStudents | CaseStudyWithRelationsForInstructor;
  moduleId?: string;
  onExerciseUpdate?: (updatedExercise: any) => void;
  allowEdit?: boolean;
  isInstructor?: boolean;
}

export default function ViewExerciseModal({
  open,
  onClose,
  exercise,
  moduleTitle,
  moduleNumber,
  caseStudy,
  moduleId,
  onExerciseUpdate,
  allowEdit,
  isInstructor,
}: ViewExerciseModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: exercise.title || '',
    shortDescription: exercise.shortDescription || '',
    details: exercise.details || '',
    promptHint: exercise.promptHint || '',
    instructorInstructions: exercise.instructorInstructions || '',
  });

  // Use the usePutData hook
  const { putData, loading: isSubmitting } = usePutData(
    {
      successMessage: 'Exercise updated successfully!',
      errorMessage: 'Failed to update exercise',
    },
    {}
  );

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      title: exercise?.title || '',
      shortDescription: exercise?.shortDescription || '',
      details: exercise?.details || '',
      promptHint: exercise?.promptHint || '',
      instructorInstructions: exercise?.instructorInstructions || '',
    });
    setIsEditMode(false);
  };

  const handleSave = async () => {
    if (!exercise?.id || !caseStudy?.id || !moduleId) return;

    try {
      // Find and update the specific exercise using the passed case study data
      const updatedModules =
        caseStudy.modules?.map((module: any) => {
          if (module.id === moduleId) {
            const updatedExercises =
              module.exercises?.map((ex: any) => {
                if (ex.id === exercise.id) {
                  return {
                    ...ex,
                    title: formData.title,
                    shortDescription: formData.shortDescription,
                    details: formData.details,
                    promptHint: formData.promptHint,
                  };
                }
                return ex;
              }) || [];
            return {
              ...module,
              exercises: updatedExercises,
            };
          }
          return module;
        }) || [];

      // Update the case study with the modified modules
      const updatedCaseStudy = await putData(`${getBaseUrl()}/api/case-studies/${caseStudy.id}`, {
        title: caseStudy.title,
        shortDescription: caseStudy.shortDescription,
        details: caseStudy.details,
        finalSummaryPromptInstructions: caseStudy.finalSummaryPromptInstructions,
        subject: caseStudy.subject,
        modules: updatedModules,
      });

      if (updatedCaseStudy) {
        const updatedModule = (updatedCaseStudy as any).modules?.find((m: any) => m.id === moduleId);
        const updatedExercise = updatedModule?.exercises?.find((ex: any) => ex.id === exercise.id);
        onExerciseUpdate?.(updatedExercise);
        setIsEditMode(false);
        onClose(); // Close modal after successful save
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const dropdownItems = [
    {
      label: 'Edit',
      key: 'edit',
      active: false,
      disabled: false,
    },
  ];

  const handleDropdownSelect = (key: string) => {
    if (key === 'edit') {
      handleEdit();
    }
  };

  const title = (
    <div className="flex items-center justify-center w-full relative">
      {allowEdit && !isEditMode && (
        <div className="absolute right-0">
          <EllipsisDropdown items={dropdownItems} onSelect={handleDropdownSelect} />
        </div>
      )}
      <span className="text-lg font-bold">
        {moduleTitle && moduleNumber && <span className="text-gray-600 text-lg mr-2">Module {moduleNumber}</span>}
        Exercise {exercise.orderNumber}){' '}
        {isEditMode ? (
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="inline-block w-96 ml-2"
            placeholder="Enter exercise title"
          />
        ) : (
          exercise.title
        )}
      </span>
      {isEditMode && (
        <div className="absolute right-0 flex items-center space-x-2">
          <Button onClick={handleCancel} variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <div className="px-8 text-left mx-auto space-y-6 pb-4">
        {isEditMode ? (
          // Edit Mode
          <div className="space-y-6">
            {/* Short Description Section */}
            <div className="space-y-2">
              <label className="block text-md font-semibold text-gray-900">Short Description</label>
              <Textarea
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                placeholder="Enter exercise overview"
                rows={4}
                className="w-full"
              />
            </div>

            {/* Exercise Details Section */}
            <div className="space-y-2">
              <label className="block text-md font-semibold text-gray-900">Details</label>
              <MarkdownEditor
                objectId={`exercise-details-${exercise.id}`}
                modelValue={formData.details}
                onUpdate={(value) => handleInputChange('details', value)}
                placeholder="Enter detailed exercise instructions in markdown"
                maxHeight={400}
              />
            </div>

            {/* AI Prompt Hint Section */}
            <div className="space-y-2">
              <label className="block text-md font-semibold text-gray-900">AI Prompt Hint</label>
              <MarkdownEditor
                objectId={`exercise-prompt-hint-${exercise.id}`}
                modelValue={formData.promptHint}
                onUpdate={(value) => handleInputChange('promptHint', value)}
                placeholder="Enter AI prompt hint using markdown..."
                maxHeight={200}
              />
            </div>

            {/* AI Prompt Hint Section */}
            <div className="space-y-2">
              <label className="block text-md font-semibold text-gray-900">Instructor Instructions</label>
              <MarkdownEditor
                objectId={`exercise-prompt-hint-${exercise.id}`}
                modelValue={formData.instructorInstructions}
                onUpdate={(value) => handleInputChange('instructorInstructions', value)}
                placeholder="Enter instructions for the instructor using markdown..."
                maxHeight={200}
              />
            </div>
          </div>
        ) : (
          // View Mode
          <div className="space-y-6">
            {/* Short Description Section */}
            <div className="bg-white rounded-lg pt-2">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Short Description:</h4>
                  <p className="text-gray-700 text-base leading-relaxed">{exercise.shortDescription}</p>
                </div>

                {/* Exercise Details Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Details:</h4>
                  <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(exercise.details) }} />
                </div>

                {/* AI Prompt Hint Section (if exists) */}
                {exercise.promptHint && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Prompt Hint:</h4>
                    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(exercise.promptHint) }} />
                  </div>
                )}

                {/* AI Prompt Hint Section (if exists) */}
                {isInstructor && exercise.instructorInstructions && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Instructor Instructions:</h4>
                    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(exercise.instructorInstructions) }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </FullPageModal>
  );
}
