import schema from '@/components/analysis-factors/analysisFactorsJsonSchema.json';
import { Form } from '@/components/rjsf';
import { GetAnalysisFactorsResponse } from '@/types/public-equity/analysis-factors-types';
import Block from '@dodao/web-core/components/app/Block';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import Ajv, { ErrorObject } from 'ajv';
import React, { useState } from 'react';

export interface EditAnalysisFactorsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  analysisFactorsData: GetAnalysisFactorsResponse;
  onSave: (analysisFactors: GetAnalysisFactorsResponse) => void;
}

export default function EditAnalysisFactorsModal({ open, onClose, title, analysisFactorsData, onSave }: EditAnalysisFactorsModalProps) {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);

  const [selectedAnalysisFactors, setSelectedAnalysisFactors] = useState<GetAnalysisFactorsResponse>(analysisFactorsData);
  const [validationMessages, setValidationMessages] = useState<string[]>();

  const updateSelectedAnalysisFactors = (updated: GetAnalysisFactorsResponse) => {
    const valid = validate(updated);
    if (!valid) {
      const errors: ErrorObject[] = validate.errors || [];
      const messages = errors.map((err) => `${err.instancePath || 'root'} ${err.message}`);
      setValidationMessages(messages);
    } else {
      setValidationMessages(undefined);
    }
    setSelectedAnalysisFactors(updated);
  };

  const uiSchema = {
    categories: {
      items: {
        factors: {
          items: {
            factorAnalysisDescription: {
              'ui:widget': 'textarea',
            },
          },
        },
      },
    },
  };

  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <Block className="text-left scroll-auto min-h-full">
        {validationMessages && validationMessages.length > 0 && (
          <div className="text-red-500 bg-red-100 border border-red-400 p-2 rounded mb-2">
            <strong>Validation Errors:</strong>
            <ul className="list-disc ml-4">
              {validationMessages.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="text-left w-full">
          <Form
            schema={schema as RJSFSchema}
            formData={selectedAnalysisFactors || {}}
            onChange={(e) => updateSelectedAnalysisFactors(e.formData as GetAnalysisFactorsResponse)}
            onSubmit={() => onSave(selectedAnalysisFactors)}
            validator={validator}
            noHtml5Validate
            uiSchema={uiSchema}
          />
        </div>
      </Block>
    </FullPageModal>
  );
}
