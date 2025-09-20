'use client';

import { UpdateModuleExerciseRequest } from '@/app/api/case-studies/[caseStudyId]/case-study-modules/[moduleId]/exercises/[exerciseId]/route';
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
  onExerciseUpdate?: (updatedExercise: ModuleExercise) => void;
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
  const [formData, setFormData] = useState<UpdateModuleExerciseRequest>({
    title: exercise.title,
    shortDescription: exercise.shortDescription,
    details: exercise.details,
    promptHint: exercise.promptHint,
    instructorInstructions: exercise.instructorInstructions,
    orderNumber: exercise.orderNumber,
    archive: exercise.archive,
  });

  // Use the usePutData hook
  const { putData, loading: isSubmitting } = usePutData<ModuleExercise, UpdateModuleExerciseRequest>(
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
      title: exercise.title,
      shortDescription: exercise.shortDescription,
      details: exercise.details,
      promptHint: exercise.promptHint,
      instructorInstructions: exercise.instructorInstructions,
      orderNumber: exercise.orderNumber,
      archive: exercise.archive,
    });
    setIsEditMode(false);
  };

  const handleSave = async () => {
    if (!exercise?.id || !caseStudy?.id || !moduleId) return;
    const response = await putData(`${getBaseUrl()}/api/case-studies/${caseStudy.id}/case-study-modules/${moduleId}/exercises/${exercise.id}`, formData);
    if (response) {
      onExerciseUpdate?.(response);
      setIsEditMode(false);
      onClose();
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
                modelValue={formData.promptHint || undefined}
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
                modelValue={formData.instructorInstructions || undefined}
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
