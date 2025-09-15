import schema from '@/components/analysis-factors/analysisFactorsJsonSchema.json';
import { UpsertAnalysisFactorsRequest } from '@/types/public-equity/analysis-factors-types';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Ajv, { ErrorObject } from 'ajv';
import React, { useState } from 'react';

export interface UploadJsonModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  industryKey: string;
  subIndustryKey: string;
  onSave: (analysisFactors: UpsertAnalysisFactorsRequest) => void;
}

export default function UploadJsonModal({ open, onClose, title, industryKey, subIndustryKey, onSave }: UploadJsonModalProps) {
  const [rawJson, setRawJson] = useState<string>('');
  const [validationMessages, setValidationMessages] = useState<string[]>([]);

  const handleSave = () => {
    if (rawJson.trim() === '') {
      setValidationMessages(['JSON cannot be empty']);
      return;
    }

    try {
      const parsedJson = JSON.parse(rawJson) as UpsertAnalysisFactorsRequest;

      // Validate against schema
      const ajv = new Ajv({ allErrors: true });
      const validate = ajv.compile(schema);
      const valid = validate(parsedJson);

      if (!valid) {
        const errors: ErrorObject[] = validate.errors || [];
        const messages = errors.map((err) => `${err.instancePath || 'root'} ${err.message}`);
        setValidationMessages(messages);
        return;
      }

      // Additional validation: check if industryKey and subIndustryKey match
      if (parsedJson.industryKey !== industryKey) {
        setValidationMessages([`Industry key mismatch: expected ${industryKey}, got ${parsedJson.industryKey}`]);
        return;
      } else if (parsedJson.subIndustryKey !== subIndustryKey) {
        setValidationMessages([`Sub-industry key mismatch: expected ${subIndustryKey}, got ${parsedJson.subIndustryKey}`]);
        return;
      }

      // If validation passes, clear messages and save
      setValidationMessages([]);
      onSave(parsedJson);
      onClose();
    } catch (error) {
      setValidationMessages([error instanceof Error ? error.message : 'Invalid JSON format']);
    }
  };

  const sampleJson = {
    industryKey,
    subIndustryKey,
    categories: [
      {
        categoryKey: 'BusinessAndMoat',
        factors: [
          {
            factorAnalysisKey: 'COMPETITIVE_ADVANTAGE',
            factorAnalysisTitle: 'Competitive Advantage Assessment',
            factorAnalysisDescription: "Evaluate the company's sustainable competitive advantages and moat strength",
            factorAnalysisMetrics: "List and describe key metrics that demonstrate the company's competitive position (optional)",
          },
        ],
      },
    ],
  };

  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col h-[calc(100vh-120px)] p-4">
        {/* JSON Editor */}
        <div className="flex-1 overflow-hidden">
          <TextareaAutosize
            label={''}
            modelValue={rawJson || ''}
            onUpdate={(val) => setRawJson(val as string)}
            className="h-full w-full font-mono text-sm resize-none pb-4"
            fillParent={true}
            placeholder={`Paste your JSON here...\n\nExpected format:\n${JSON.stringify(sampleJson, null, 2)}`}
          />
        </div>

        {/* Validation Messages */}
        {validationMessages.length > 0 && (
          <div className="mt-2 ">
            <ul className="text-red-500 text-sm">
              {validationMessages.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
          <Button onClick={handleSave} primary variant="contained">
            Save
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
