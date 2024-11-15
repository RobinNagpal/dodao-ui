import React from 'react';
import { ByteErrors } from '@dodao/web-core/types/errors/byteErrors';
import { ByteDto } from '@/types/bytes/ByteDto';

interface EditByteErrorMessagesProps {
  byte: ByteDto;
  byteErrors: ByteErrors;
}

const errorMessages: { [key: string]: string } = {
  name: 'Name is required.',
  content: 'Summary is required.',
  stepName: 'Step name is required.',
};

const ErrorMessages: React.FC<EditByteErrorMessagesProps> = ({ byte, byteErrors }) => {
  return (
    <div className="space-y-2 mb-4 mr-2 ml-2">
      {Object.entries(byteErrors).map(([field, hasError]) =>
        hasError === true && errorMessages[field] ? (
          <p key={field} className="text-red-600 bg-red-100 border border-red-200 rounded-md p-2 text-sm">
            {errorMessages[field]}
          </p>
        ) : null
      )}

      {byteErrors.steps &&
        Object.entries(byteErrors.steps).map(([stepId, stepErrors]) => {
          const stepIndex = byte.steps.findIndex((step) => step.uuid === stepId) + 1;

          return (
            <React.Fragment key={stepId}>
              {stepErrors.stepName && (
                <p className="text-red-600 bg-red-100 border border-red-200 rounded-md p-2 text-sm">
                  {errorMessages['stepName']} (Step {stepIndex})
                </p>
              )}

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
