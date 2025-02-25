'use client';
import { RepopulatableFields } from '@/types/project/project';
import { repopulateProjectField } from '@/util/repopulate';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import LoadingSpinner from '@dodao/web-core/components/core/loaders/LoadingSpinner';
import React from 'react';

interface RepopulateButtonProps {
  projectId: string;
  field: RepopulatableFields;
  currentFieldValue?: string | object;
}

export default function RepopulateButton({ projectId, field, currentFieldValue }: RepopulateButtonProps) {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [repopulating, setRepopulating] = React.useState(false);

  return (
    <div className="flex justify-end">
      <ConfirmationModal
        open={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
        }}
        onConfirm={async () => {
          setRepopulating(true);
          setShowConfirmation(false);
          await repopulateProjectField(projectId, field);
          setRepopulating(false);
        }}
        confirming={repopulating}
        confirmationText={`Are you sure you want to repopulate ${field}?`}
        title={`Repopulate ${field}`}
        askForTextInput={false}
      />

      <a
        onClick={async () => {
          if (currentFieldValue) {
            setShowConfirmation(true);
          } else {
            await repopulateProjectField(projectId, field);
          }
        }}
        className="primary-text-color hover:underline cursor-pointer text-sm link-color"
      >
        Repopulate {field} {'  '}
        {repopulating && <LoadingSpinner />}
      </a>
    </div>
  );
}
