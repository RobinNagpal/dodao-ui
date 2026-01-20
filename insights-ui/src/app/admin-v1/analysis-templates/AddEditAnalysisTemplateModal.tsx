'use client';

import { useState, useEffect } from 'react';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { CreateAnalysisTemplateRequest, AnalysisTemplateWithRelations } from '../../api/analysis-templates/route';

interface AddEditAnalysisTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingTemplate?: AnalysisTemplateWithRelations | null;
}

export default function AddEditAnalysisTemplateModal({ isOpen, onClose, onSuccess, existingTemplate }: AddEditAnalysisTemplateModalProps) {
  const isEdit = !!existingTemplate;

  const [formData, setFormData] = useState<CreateAnalysisTemplateRequest>({
    name: '',
    description: '',
    promptKey: '',
  });

  // API hooks
  const { postData: createTemplate, loading: createTemplateLoading } = usePostData<AnalysisTemplateWithRelations, CreateAnalysisTemplateRequest>({
    successMessage: 'Analysis template created successfully!',
    errorMessage: 'Failed to create analysis template.',
  });

  const { putData: updateTemplate, loading: updateTemplateLoading } = usePutData<AnalysisTemplateWithRelations, CreateAnalysisTemplateRequest>({
    successMessage: 'Analysis template updated successfully!',
    errorMessage: 'Failed to update analysis template.',
  });

  const loading = createTemplateLoading || updateTemplateLoading;

  // Update form when existing template changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingTemplate) {
        setFormData({
          name: existingTemplate.name,
          description: existingTemplate.description || '',
          promptKey: existingTemplate.promptKey || '',
        });
      } else {
        // Reset form for new template
        setFormData({
          name: '',
          description: '',
          promptKey: '',
        });
      }
    }
  }, [isOpen, existingTemplate]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Template name is required');
      return;
    }

    if (!formData.promptKey.trim()) {
      alert('Prompt key is required');
      return;
    }

    if (isEdit && existingTemplate) {
      // Update existing template
      const result = await updateTemplate(`${getBaseUrl()}/api/analysis-templates/${existingTemplate.id}`, formData);
      if (result) {
        onSuccess();
        onClose();
      }
    } else {
      // Create new template
      const result = await createTemplate(`${getBaseUrl()}/api/analysis-templates`, formData);
      if (result) {
        onSuccess();
        onClose();
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <FullPageModal open={isOpen} onClose={handleClose} title={isEdit ? 'Edit Analysis Template' : 'Create Analysis Template'}>
      <div className="p-6 max-w-md mx-auto">
        <div className="space-y-4">
          <Input modelValue={formData.name} onUpdate={(val) => setFormData((prev) => ({ ...prev, name: val as string }))} placeholder="Enter template name">
            Template Name *
          </Input>

          <TextareaAutosize
            label="Description"
            modelValue={formData.description}
            onUpdate={(val) => setFormData((prev) => ({ ...prev, description: val as string }))}
            placeholder="Enter template description (optional)"
          />

          <Input
            modelValue={formData.promptKey}
            onUpdate={(val) => setFormData((prev) => ({ ...prev, promptKey: val as string }))}
            placeholder="Enter prompt key"
            required
          >
            Prompt Key *
          </Input>
        </div>

        <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
          <Button onClick={handleClose} variant="outlined" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} primary loading={loading} disabled={!formData.name.trim() || !formData.promptKey.trim()} className="flex-1">
            {isEdit ? 'Update' : 'Create'} Template
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
