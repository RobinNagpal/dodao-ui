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
import { Check, Lightbulb, FileText, Edit, Save, X } from 'lucide-react';

interface ModuleModalProps {
  open: boolean;
  onClose: () => void;
  selectedModule: any;
  hasModuleInstructionsRead: (moduleId: string) => boolean;
  handleMarkInstructionAsRead: (type: 'case_study' | 'module', moduleId?: string) => Promise<void>;
  updatingStatus: boolean;
  caseStudy?: any;
  onModuleUpdate?: (updatedModule: any) => void;
}

export default function ViewModuleModal({
  open,
  onClose,
  selectedModule,
  hasModuleInstructionsRead,
  handleMarkInstructionAsRead,
  updatingStatus,
  caseStudy,
  onModuleUpdate,
}: ModuleModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    details: '',
  });

  // Use the usePutData hook
  const { putData, loading: isSubmitting } = usePutData(
    {
      successMessage: 'Module updated successfully!',
      errorMessage: 'Failed to update module',
    },
    {}
  );

  useEffect(() => {
    // Check if user is admin
    const userType = localStorage.getItem('user_type');
    setIsAdmin(userType === 'admin');

    // Initialize form data when module changes
    if (selectedModule) {
      setFormData({
        title: selectedModule.title || '',
        shortDescription: selectedModule.shortDescription || '',
        details: selectedModule.details || '',
      });
    }
  }, [selectedModule]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      title: selectedModule?.title || '',
      shortDescription: selectedModule?.shortDescription || '',
      details: selectedModule?.details || '',
    });
    setIsEditMode(false);
  };

  const handleSave = async () => {
    if (!selectedModule?.id || !caseStudy?.id) return;

    try {
      // Update the specific module in the modules array using the passed case study data
      const updatedModules =
        caseStudy.modules?.map((module: any) => {
          if (module.id === selectedModule.id) {
            return {
              ...module,
              title: formData.title,
              shortDescription: formData.shortDescription,
              details: formData.details,
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
        const updatedModule = (updatedCaseStudy as any).modules?.find((m: any) => m.id === selectedModule.id);
        if (updatedModule) {
          onModuleUpdate?.(updatedModule);
        }
        setIsEditMode(false);
        onClose(); // Close modal after successful save
      }
    } catch (error) {
      console.error('Error updating module:', error);
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

  const title = selectedModule && (
    <div className="flex items-center justify-center w-full relative">
      {isAdmin && !isEditMode && (
        <div className="absolute right-0">
          <EllipsisDropdown items={dropdownItems} onSelect={handleDropdownSelect} />
        </div>
      )}
      <span className="text-2xl font-bold">
        Module {selectedModule.orderNumber}:{' '}
        {isEditMode ? (
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="inline-block w-96 ml-2"
            placeholder="Enter module title"
          />
        ) : (
          selectedModule.title
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
      {selectedModule && (
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
                  placeholder="Enter short description"
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Module Details Section */}
              <div className="space-y-2">
                <label className="block text-md font-semibold text-gray-900">Details</label>
                <MarkdownEditor
                  objectId={`module-details-${selectedModule.id}`}
                  modelValue={formData.details}
                  onUpdate={(value) => handleInputChange('details', value)}
                  placeholder="Enter detailed module content in markdown"
                  maxHeight={400}
                />
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-6">
              {/* Module Content */}
              <div className="bg-white rounded-lg pt-2">
                <div className="space-y-6">
                  {/* Short Description */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Short Description:</h4>
                    <p className="text-gray-700 text-base leading-relaxed">{selectedModule.shortDescription}</p>
                  </div>

                  {/* Module Details */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Details:</h4>
                    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(selectedModule.details) }} />
                  </div>
                </div>
              </div>

              {/* Read Module Instructions Button */}
              {!hasModuleInstructionsRead(selectedModule.id) && (
                <div className="text-center">
                  <Button
                    onClick={() => handleMarkInstructionAsRead('module', selectedModule.id)}
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
                        <Check className="h-5 w-5 mr-2" />I Have Read the Module Instructions
                      </>
                    )}
                  </Button>
                </div>
              )}

              {hasModuleInstructionsRead(selectedModule.id) && (
                <div className="text-center">
                  <Check className="h-8 w-8 text-green-600 mx-auto" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </FullPageModal>
  );
}
