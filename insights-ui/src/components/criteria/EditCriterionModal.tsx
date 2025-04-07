import schema from '@/components/criteria/insdustryGroupCriteriaJsonSchema.json';
import { Form } from '@/components/rjsf';
import { CriterionDefinition } from '@/types/public-equity/criteria-types';
import Block from '@dodao/web-core/components/app/Block';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import Ajv, { ErrorObject } from 'ajv';

import React, { useState } from 'react';

export interface ViewCriteriaModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  criterionDefinition: CriterionDefinition;
  onSave: (criterion: CriterionDefinition) => void;
}

export default function EditCriterionModal({ open, onClose, title, criterionDefinition, onSave }: ViewCriteriaModalProps) {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);

  const [selectedCriterion, setSelectedCriterion] = useState<CriterionDefinition>(criterionDefinition);
  const [validationMessages, setValidationMessages] = useState<string[]>();

  const updateSelectedCriterion = (updated: CriterionDefinition) => {
    const valid = validate(updated);
    if (!valid) {
      const errors: ErrorObject[] = validate.errors || [];
      const messages = errors.map((err) => `${err.instancePath || 'root'} ${err.message}`);
      setValidationMessages(messages);
    } else {
      setValidationMessages(undefined);
    }
    setSelectedCriterion(updated);
  };

  const uiSchema = {
    matchingInstruction: {
      'ui:widget': 'textarea',
    },
    importantMetrics: {
      items: {
        description: {
          'ui:widget': 'textarea',
        },
        formula: {
          'ui:widget': 'textarea',
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
            formData={selectedCriterion || {}}
            onChange={(e) => updateSelectedCriterion(e.formData as CriterionDefinition)}
            onSubmit={() => onSave(selectedCriterion)}
            validator={validator}
            noHtml5Validate
            uiSchema={uiSchema}
          />
        </div>
      </Block>
    </FullPageModal>
  );
}
