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
import { Check, Edit, Save, X, EllipsisVertical } from 'lucide-react';

interface CaseStudyModalProps {
  open: boolean;
  onClose: () => void;
  caseStudy: any;
  hasCaseStudyInstructionsRead: () => boolean;
  handleMarkInstructionAsRead: (type: 'case_study' | 'module', moduleId?: string) => Promise<void>;
  updatingStatus: boolean;
  onCaseStudyUpdate?: (updatedCaseStudy: any) => void;
}

export default function ViewCaseStudyModal({
  open,
  onClose,
  caseStudy,
  hasCaseStudyInstructionsRead,
  handleMarkInstructionAsRead,
  updatingStatus,
  onCaseStudyUpdate,
}: CaseStudyModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    details: '',
    finalSummaryPromptInstructions: '',
  });

  // Use the usePutData hook
  const { putData, loading: isSubmitting } = usePutData(
    {
      successMessage: 'Case study updated successfully!',
      errorMessage: 'Failed to update case study',
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

    // Initialize form data when case study changes
    if (caseStudy) {
      setFormData({
        title: caseStudy.title || '',
        shortDescription: caseStudy.shortDescription || '',
        details: caseStudy.details || '',
        finalSummaryPromptInstructions: caseStudy.finalSummaryPromptInstructions || '',
      });
    }
  }, [caseStudy]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      title: caseStudy?.title || '',
      shortDescription: caseStudy?.shortDescription || '',
      details: caseStudy?.details || '',
      finalSummaryPromptInstructions: caseStudy?.finalSummaryPromptInstructions || '',
    });
    setIsEditMode(false);
  };

  const handleSave = async () => {
    if (!caseStudy?.id) return;

    try {
      const updatedCaseStudy = await putData(`/api/case-studies/${caseStudy.id}`, {
        title: formData.title,
        shortDescription: formData.shortDescription,
        details: formData.details,
        finalSummaryPromptInstructions: formData.finalSummaryPromptInstructions,
        subject: caseStudy.subject,
        modules: caseStudy.modules || [],
      });

      if (updatedCaseStudy) {
        onCaseStudyUpdate?.(updatedCaseStudy);
        setIsEditMode(false);
        onClose(); // Close modal after successful save
      }
    } catch (error) {
      console.error('Error updating case study:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
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
      <span className="text-2xl font-bold">Case Study Details</span>
      {isAdmin && !isEditMode && (
        <EllipsisDropdown
          items={dropdownItems}
          onSelect={handleDropdownSelect}
        />
      )}
      {isEditMode && (
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
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
            {/* Title Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter case study title"
                className="w-full"
              />
            </div>

            {/* Short Description Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Short Description</label>
              <Textarea
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                placeholder="Enter short description"
                rows={3}
                className="w-full"
              />
            </div>

            {/* Details Field (Markdown) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Details</label>
              <MarkdownEditor
                objectId={`case-study-details-${caseStudy?.id}`}
                modelValue={formData.details}
                onUpdate={(value) => handleInputChange('details', value)}
                placeholder="Enter detailed case study content in markdown"
                maxHeight={400}
              />
            </div>

            {/* Final Summary Prompt Instructions Field (Markdown) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Final Summary Prompt Instructions</label>
              <MarkdownEditor
                objectId={`case-study-prompt-${caseStudy?.id}`}
                modelValue={formData.finalSummaryPromptInstructions}
                onUpdate={(value) => handleInputChange('finalSummaryPromptInstructions', value)}
                placeholder="Enter final summary prompt instructions in markdown"
                maxHeight={300}
              />
            </div>
          </div>
        ) : (
          // View Mode
          <div className="space-y-6">
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(caseStudy?.details || '') }} />

            {/* Read Instructions Button */}
            {!hasCaseStudyInstructionsRead() && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 text-center">
                <p className="text-blue-900 mb-4 font-medium">Please confirm that you have read and understood the case study instructions.</p>
                <Button
                  onClick={() => handleMarkInstructionAsRead('case_study')}
                  disabled={updatingStatus}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {updatingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Marking as Read...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />I Have Read the Instructions
                    </>
                  )}
                </Button>
              </div>
            )}

            {hasCaseStudyInstructionsRead() && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 text-center">
                <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">You have read the case study instructions</p>
              </div>
            )}
          </div>
        )}
      </div>
    </FullPageModal>
  );
}
