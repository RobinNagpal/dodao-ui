'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import EllipsisDropdown from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import MarkdownEditor from '@/components/markdown/MarkdownEditor';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { parseMarkdown } from '@/utils/parse-markdown';
import { Lightbulb, FileText, Sparkles, Save, X } from 'lucide-react';
import type { ModuleExercise } from '@/types';

interface ViewExerciseModalProps {
  open: boolean;
  onClose: () => void;
  exercise: ModuleExercise | null;
  moduleTitle?: string;
  moduleNumber?: number;
  caseStudy?: any; // Pass the full case study instead of just ID
  moduleId?: string;
  onExerciseUpdate?: (updatedExercise: any) => void;
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
}: ViewExerciseModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    details: '',
    promptHint: '',
  });

  // Use the usePutData hook
  const { putData, loading: isSubmitting } = usePutData(
    {
      successMessage: 'Exercise updated successfully!',
      errorMessage: 'Failed to update exercise',
    },
    {
      headers: {
        'admin-email': localStorage.getItem('user_email') || 'admin@example.com',
      },
    }
  );

  useEffect(() => {
    // Check if user is admin
    const userType = localStorage.getItem('user_type');
    setIsAdmin(userType === 'admin');

    // Initialize form data when exercise changes
    if (exercise) {
      setFormData({
        title: exercise.title || '',
        shortDescription: exercise.shortDescription || '',
        details: exercise.details || '',
        promptHint: exercise.promptHint || '',
      });
    }
  }, [exercise]);

  if (!exercise) return null;

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
      const updatedCaseStudy = await putData(`/api/case-studies/${caseStudy.id}`, {
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
    <div className="flex items-center justify-between w-full">
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
      {isAdmin && !isEditMode && <EllipsisDropdown items={dropdownItems} onSelect={handleDropdownSelect} />}
      {isEditMode && (
        <div className="flex items-center space-x-2">
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
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-xl">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Exercise Overview</h4>
              </div>
              <div className="space-y-2">
                <Textarea
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Enter exercise overview"
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>

            {/* AI Prompt Hint Section */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-2 rounded-xl">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">AI Prompt Hint</h4>
              </div>
              <div className="space-y-2">
                <Textarea
                  value={formData.promptHint}
                  onChange={(e) => handleInputChange('promptHint', e.target.value)}
                  placeholder="Enter AI prompt hint"
                  rows={3}
                  className="w-full"
                />
              </div>
            </div>

            {/* Exercise Details Section */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-xl">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Detailed Instructions</h4>
              </div>
              <div className="space-y-2">
                <MarkdownEditor
                  objectId={`exercise-details-${exercise.id}`}
                  modelValue={formData.details}
                  onUpdate={(value) => handleInputChange('details', value)}
                  placeholder="Enter detailed exercise instructions in markdown"
                  maxHeight={400}
                />
              </div>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="space-y-6">
            {/* Short Description Section */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-xl">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Exercise Overview</h4>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200/50">
                <p className="text-blue-900 text-base leading-relaxed">{exercise.shortDescription}</p>
              </div>
            </div>

            {/* AI Prompt Hint Section (if exists) */}
            {exercise.promptHint && (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-2 rounded-xl">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">AI Prompt Hint</h4>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200/50">
                  <p className="text-yellow-900 text-sm leading-relaxed font-medium">{exercise.promptHint}</p>
                </div>
              </div>
            )}

            {/* Exercise Details Section */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-xl">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Detailed Instructions</h4>
              </div>
              <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(exercise.details) }} />
            </div>
          </div>
        )}
      </div>
    </FullPageModal>
  );
}
