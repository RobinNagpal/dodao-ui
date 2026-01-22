'use client';

import { useState, useEffect } from 'react';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { AnalysisTemplateReportWithRelations, CreateAnalysisTemplateReportRequest } from '@/app/api/analysis-template-reports/route';
import { AnalysisTemplateWithRelations } from '@/app/api/analysis-templates/route';

interface AddEditAnalysisTemplateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingReport?: AnalysisTemplateReportWithRelations | null;
}

export default function AddEditAnalysisTemplateReportModal({ isOpen, onClose, onSuccess, existingReport }: AddEditAnalysisTemplateReportModalProps) {
  const isEdit = !!existingReport;

  const [formData, setFormData] = useState<CreateAnalysisTemplateReportRequest>({
    analysisTemplateId: '',
    promptKey: '',
    inputObj: {},
  });
  const [inputJson, setInputJson] = useState('');

  // API hooks
  const { postData: createReport, loading: createReportLoading } = usePostData<AnalysisTemplateReportWithRelations, CreateAnalysisTemplateReportRequest>({
    successMessage: 'Analysis template report created successfully!',
    errorMessage: 'Failed to create analysis template report.',
  });

  const { putData: updateReport, loading: updateReportLoading } = usePutData<AnalysisTemplateReportWithRelations, CreateAnalysisTemplateReportRequest>({
    successMessage: 'Analysis template report updated successfully!',
    errorMessage: 'Failed to update analysis template report.',
  });

  const { data: templates, loading: templatesLoading } = useFetchData<AnalysisTemplateWithRelations[]>(
    `${getBaseUrl()}/api/analysis-templates`,
    { cache: 'no-cache' },
    'Failed to fetch analysis templates'
  );

  const loading = createReportLoading || updateReportLoading;

  // Update form when existing report changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingReport) {
        setFormData({
          analysisTemplateId: existingReport.analysisTemplateId,
          promptKey: existingReport.promptKey,
          inputObj: existingReport.inputObj,
        });
        setInputJson(JSON.stringify(existingReport.inputObj, null, 2));
      } else {
        // Reset form for new report
        setFormData({
          analysisTemplateId: '',
          promptKey: '',
          inputObj: {},
        });
        setInputJson('');
      }
    }
  }, [isOpen, existingReport]);

  const handleSubmit = async () => {
    if (!formData.analysisTemplateId || !formData.promptKey.trim() || !inputJson.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    let inputObj: any;
    try {
      inputObj = JSON.parse(inputJson);
    } catch (error) {
      alert('Invalid JSON format. Please check your input.');
      return;
    }

    const submitData = { ...formData, inputObj };

    if (isEdit && existingReport) {
      // Update existing report
      const result = await updateReport(`${getBaseUrl()}/api/analysis-template-reports/${existingReport.id}`, submitData);
      if (result) {
        onSuccess();
        onClose();
      }
    } else {
      // Create new report
      const result = await createReport(`${getBaseUrl()}/api/analysis-template-reports`, submitData);
      if (result) {
        onSuccess();
        onClose();
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  const templateOptions =
    templates?.map((template) => ({
      id: template.id,
      label: template.name,
    })) || [];

  return (
    <FullPageModal open={isOpen} onClose={handleClose} title={isEdit ? 'Edit Analysis Template Report' : 'Create Analysis Template Report'}>
      <div className="p-6 max-w-md mx-auto">
        <div className="space-y-4">
          <StyledSelect
            label="Select Analysis Template *"
            selectedItemId={formData.analysisTemplateId}
            items={templateOptions}
            setSelectedItemId={(id) => setFormData((prev) => ({ ...prev, analysisTemplateId: id || '' }))}
          />

          <Input
            modelValue={formData.promptKey}
            onUpdate={(val) => setFormData((prev) => ({ ...prev, promptKey: val as string }))}
            placeholder="Enter prompt key"
          >
            Prompt Key *
          </Input>

          <div>
            <label className="block text-sm font-medium mb-2">Input JSON *</label>
            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder='Enter JSON data (e.g., {"tickerSymbol": "AAPL", "exchange": "NASDAQ"})'
              className="w-full h-32 p-3 border border-gray-300 rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontFamily: 'monospace' }}
            />
            <p className="text-xs text-gray-500 mt-1">Enter valid JSON that will be used as input for the analysis template.</p>
          </div>
        </div>

        <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
          <Button onClick={handleClose} variant="outlined" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            primary
            loading={loading}
            disabled={!formData.analysisTemplateId || !formData.promptKey.trim() || !inputJson.trim()}
            className="flex-1"
          >
            {isEdit ? 'Update' : 'Create'} Report
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
