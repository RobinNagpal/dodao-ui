import React from 'react';
import { ClickableDemoErrors } from '@dodao/web-core/types/errors/clickableDemoErrors';
import { UpsertClickableDemoInput } from '@/graphql/generated/generated-types';

interface EditClickableDemoErrorMessagesProps {
  clickableDemo: UpsertClickableDemoInput;
  clickableDemoErrors: ClickableDemoErrors;
}

const errorMessages: { [key: string]: string } = {
  title: 'Title is required.',
  excerpt: 'Summary is required.',
  stepName: 'Step name is required.',
  selector: 'Selector is required.',
  url: 'URL is required.',
  tooltipInfo: 'Tooltip information is required.',
};

const ErrorMessages: React.FC<EditClickableDemoErrorMessagesProps> = ({ clickableDemo, clickableDemoErrors }) => {
  return (
    <div className="space-y-2 mb-4 mr-2 ml-2">
      {Object.entries(clickableDemoErrors).map(([field, hasError]) => {
        if (field !== 'steps' && hasError === true && errorMessages[field]) {
          return (
            <p key={field} className="text-red-600 bg-red-100 border border-red-200 rounded-md p-2 text-sm">
              {errorMessages[field]}
            </p>
          );
        }
        return null;
      })}

      {clickableDemoErrors.steps &&
        Object.entries(clickableDemoErrors.steps).map(([stepIndex, stepErrors]) => (
          <div key={`step-${stepIndex}`}>
            {Object.entries(stepErrors).map(([field, hasError]) =>
              hasError === true && errorMessages[field] ? (
                <p key={`${stepIndex}-${field}`} className="text-red-600 bg-red-100 border border-red-200 rounded-md p-2 text-sm mb-2">
                  {errorMessages[field]} (Step {parseInt(stepIndex) + 1})
                </p>
              ) : null
            )}
          </div>
        ))}
    </div>
  );
};

export default ErrorMessages;
