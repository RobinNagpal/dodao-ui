'use client';

import { UpdateModuleExerciseRequest } from '@/app/api/case-studies/[caseStudyId]/case-study-modules/[moduleId]/exercises/[exerciseId]/route';
import MarkdownEditor from '@/components/markdown/MarkdownEditor';
import { Button } from '@/components/ui/button';
import { ModuleExercise } from '@/types';
import { CaseStudyWithRelationsForInstructor, CaseStudyWithRelationsForStudents } from '@/types/api';
import { parseMarkdown } from '@/utils/parse-markdown';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import Input from '@dodao/web-core/components/core/input/Input';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Save, X } from 'lucide-react';
import { useState } from 'react';

/* =========================================================
 * Types
 * =======================================================*/

export interface ViewExerciseModalProps {
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

interface BaseViewProps {
  exercise: ModuleExercise;
}

type EditableField =
  | 'title'
  | 'details'
  | 'promptHint'
  | 'gradingLogic'
  | 'instructorInstructions'
  | 'promptCharacterLimit'
  | 'promptOutputInstructions'
  | 'orderNumber'
  | 'archive';

/* =========================================================
 * Student View
 * =======================================================*/

export function StudentView({ exercise }: BaseViewProps): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Details:</h4>
        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(exercise.details) }} />
      </div>

      {/* AI Prompt Hint (optional) */}
      {exercise.promptHint && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Prompt Hint:</h4>
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(exercise.promptHint) }} />
        </div>
      )}

      {/* Grading Logic (optional) */}
      {exercise.gradingLogic && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Grading Logic:</h4>
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(exercise.gradingLogic) }} />
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * Instructor View
 * (Student view + Instructor Instructions)
 * =======================================================*/

export function InstructorView({ exercise }: BaseViewProps): JSX.Element {
  return (
    <div className="space-y-6">
      <StudentView exercise={exercise} />
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Prompt Character Limit:</h4>
        <div>{exercise.promptCharacterLimit === -1 ? 'unlimited' : exercise.promptCharacterLimit + ' characters'}</div>
      </div>

      {exercise.instructorInstructions && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Instructor Instructions:</h4>
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(exercise.instructorInstructions),
            }}
          />
        </div>
      )}
      {exercise.promptOutputInstructions && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Prompt Output Instructions:</h4>
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(exercise.promptOutputInstructions),
            }}
          />
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * Edit Exercise (owns form state & save logic)
 * =======================================================*/

interface EditExerciseProps {
  exercise: ModuleExercise;
  caseStudy?: CaseStudyWithRelationsForStudents | CaseStudyWithRelationsForInstructor;
  moduleId?: string;
  onExerciseUpdate?: (updatedExercise: ModuleExercise) => void;
  onCancel: () => void; // tells parent to exit edit mode
  onClose: () => void; // close modal after successful save (kept behavior)
}

export function EditExercise({ exercise, caseStudy, moduleId, onExerciseUpdate, onCancel, onClose }: EditExerciseProps): JSX.Element {
  const [formData, setFormData] = useState<UpdateModuleExerciseRequest>({
    title: exercise.title,
    details: exercise.details,
    promptHint: exercise.promptHint,
    gradingLogic: exercise.gradingLogic,
    instructorInstructions: exercise.instructorInstructions,
    promptOutputInstructions: exercise.promptOutputInstructions,
    promptCharacterLimit: exercise.promptCharacterLimit,
    orderNumber: exercise.orderNumber,
    archive: exercise.archive,
  });

  const { putData, loading: isSubmitting } = usePutData<ModuleExercise, UpdateModuleExerciseRequest>(
    {
      successMessage: 'Exercise updated successfully!',
      errorMessage: 'Failed to update exercise',
    },
    {}
  );

  const handleInputChange = <K extends EditableField>(field: K, value: string | number): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = (): void => {
    // reset to original exercise values then exit edit mode
    setFormData({
      title: exercise.title,
      details: exercise.details,
      promptHint: exercise.promptHint,
      gradingLogic: exercise.gradingLogic,
      promptOutputInstructions: exercise.promptOutputInstructions,
      promptCharacterLimit: exercise.promptCharacterLimit,
      instructorInstructions: exercise.instructorInstructions,
      orderNumber: exercise.orderNumber,
      archive: exercise.archive,
    });
    onCancel();
  };

  const handleSave = async (): Promise<void> => {
    if (!exercise?.id || !caseStudy?.id || !moduleId) return;
    const response = await putData(`${getBaseUrl()}/api/case-studies/${caseStudy.id}/case-study-modules/${moduleId}/exercises/${exercise.id}`, formData);
    if (response) {
      onExerciseUpdate?.(response);
      onClose(); // keep the same close-after-save behavior
    }
  };

  return (
    <div className="space-y-6">
      {/* Top bar within edit view */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Editing:</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={handleCancel} variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
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
      </div>

      {/* Editable Sections */}
      <div className="space-y-6">
        <Input
          label={'Exercise Name'}
          modelValue={formData.title}
          onUpdate={(value) => handleInputChange('title', value?.toString() || '')}
          placeholder="Enter exercise title"
        />
        <MarkdownEditor
          label={'Details'}
          objectId={`exercise-details-${exercise.id}`}
          modelValue={formData.details}
          onUpdate={(value) => handleInputChange('details', value)}
          placeholder="Enter detailed exercise instructions in markdown"
          maxHeight={400}
        />

        <MarkdownEditor
          label={'AI Prompt Hint'}
          objectId={`exercise-prompt-hint-${exercise.id}`}
          modelValue={formData.promptHint || undefined}
          onUpdate={(value) => handleInputChange('promptHint', value)}
          placeholder="Enter AI prompt hint using markdown..."
          maxHeight={200}
        />

        <MarkdownEditor
          label={'Grading Logic'}
          objectId={`exercise-grading-logic-${exercise.id}`}
          modelValue={formData.gradingLogic || undefined}
          onUpdate={(value) => handleInputChange('gradingLogic', value)}
          placeholder="Enter grading logic using markdown..."
          maxHeight={200}
        />

        <Input
          label={'Prompt Character Limit'}
          number={true}
          modelValue={formData.promptCharacterLimit}
          onUpdate={(value) => handleInputChange('promptCharacterLimit', value ? parseInt(value.toString()) : '')}
          placeholder="Enter prompt character limit"
        />
        <MarkdownEditor
          label={'Prompt Output Instructions'}
          objectId={`exercise-grading-logic-${exercise.id}`}
          modelValue={formData.promptOutputInstructions || undefined}
          onUpdate={(value) => handleInputChange('promptOutputInstructions', value)}
          placeholder="Enter prompt output instructions using markdown..."
          maxHeight={200}
        />

        <MarkdownEditor
          label={'Notes for Instructor'}
          objectId={`exercise-instructor-instructions-${exercise.id}`}
          modelValue={formData.instructorInstructions || undefined}
          onUpdate={(value) => handleInputChange('instructorInstructions', value)}
          placeholder="Enter instructions for the instructor using markdown..."
          maxHeight={200}
        />
      </div>
    </div>
  );
}

/* =========================================================
 * Container Component
 * =======================================================*/

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
}: ViewExerciseModalProps): JSX.Element {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const handleEdit = (): void => setIsEditMode(true);

  const dropdownItems: EllipsisDropdownItem[] = [
    {
      label: 'Edit',
      key: 'edit',
      active: false,
      disabled: false,
    },
  ];

  const handleDropdownSelect = (key: string): void => {
    if (key === 'edit') handleEdit();
  };

  const title: JSX.Element = (
    <div className="flex items-center justify-center w-full relative">
      {allowEdit && !isEditMode && (
        <div className="absolute right-0">
          <EllipsisDropdown items={dropdownItems} onSelect={handleDropdownSelect} />
        </div>
      )}
      <span className="text-lg font-bold">
        {moduleTitle && moduleNumber && <span className="text-gray-600 text-lg mr-2">Module {moduleNumber}</span>}
        Exercise {exercise.orderNumber}) {exercise.title}
      </span>
    </div>
  );

  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <div className="px-8 text-left mx-auto space-y-6 pb-4">
        {isEditMode ? (
          <EditExercise
            exercise={exercise}
            caseStudy={caseStudy}
            moduleId={moduleId}
            onExerciseUpdate={onExerciseUpdate}
            onCancel={() => setIsEditMode(false)}
            onClose={onClose}
          />
        ) : isInstructor ? (
          <InstructorView exercise={exercise} />
        ) : (
          <StudentView exercise={exercise} />
        )}
      </div>
    </FullPageModal>
  );
}
