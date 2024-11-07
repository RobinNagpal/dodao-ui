import React from 'react';
import { ByteErrors } from '@dodao/web-core/types/errors/byteErrors';
import { Byte } from '@dodao/web-core/types/byte';

// Props type for the component
interface ErrorMessagesProps {
  byte: Byte;
  byteErrors: ByteErrors;
}

// Error message mapping
const errorMessages: { [key: string]: string } = {
  name: 'Name is required.',
  content: 'Content cannot be empty.',
  stepName: 'Step name is required.',
};

const ErrorMessages: React.FC<ErrorMessagesProps> = ({ byte, byteErrors }) => {
  return (
    <div className="space-y-2 mb-4 mr-2 ml-2">
      {/* Display error for main fields */}
      {Object.entries(byteErrors).map(([field, hasError]) =>
        hasError === true && errorMessages[field] ? (
          <p key={field} className="text-red-600 bg-red-100 border border-red-200 rounded-md p-2 text-sm">
            {errorMessages[field]}
          </p>
        ) : null
      )}

      {/* Display errors for nested step fields */}
      {byteErrors.steps &&
        Object.entries(byteErrors.steps).map(([stepId, stepErrors]) => {
          // Find the step index + 1 based on the UUID
          const stepIndex = byte.steps.findIndex((step) => step.uuid === stepId) + 1;

          return (
            <React.Fragment key={stepId}>
              {/* Display step-level errors */}
              {stepErrors.stepName && (
                <p className="text-red-600 bg-red-100 border border-red-200 rounded-md p-2 text-sm">
                  {errorMessages['stepName']} (Step {stepIndex})
                </p>
              )}

              {/* Display errors for step items */}
              {stepErrors.stepItems &&
                Object.entries(stepErrors.stepItems).map(([itemIndex, itemErrors]) =>
                  Object.entries(itemErrors).map(([itemField, hasError]) => {
                    return hasError === true && errorMessages[itemField] ? (
                      <p key={`${stepId}-${itemIndex}-${itemField}`} className="text-red-600 bg-red-100 border border-red-200 rounded-md p-2 text-sm">
                        Step Item ({itemField}) incomplete (Step {stepIndex})
                      </p>
                    ) : null;
                  })
                )}
            </React.Fragment>
          );
        })}

      {/* Display errors for Completion Screen */}
      {byteErrors.completionScreen &&
        Object.entries(byteErrors.completionScreen).map(([field, hasError]) =>
          hasError === true && errorMessages[field] ? (
            <p key={field} className="text-red-600 bg-red-100 border border-red-200 rounded-md p-2 text-sm">
              Completion Screen {errorMessages[field]}
            </p>
          ) : null
        )}
    </div>
  );
};

export default ErrorMessages;
