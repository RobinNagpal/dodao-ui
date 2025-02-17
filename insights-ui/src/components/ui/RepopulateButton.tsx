'use client';
import React from 'react';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { RepopulatableFields } from '@/types/project/project';
import { repopulateProjectField } from '@/util/repopulate';

interface RepopulateButtonProps {
  projectId: string;
  field: RepopulatableFields;
}

export default function RepopulateButton({ projectId, field }: RepopulateButtonProps) {
  return (
    <div className="flex justify-end">
      <Button
        onClick={() => {
          repopulateProjectField(projectId, field);
        }}
        className="m-4"
        variant="contained"
        primary
      >
        Repopulate {field}
      </Button>
    </div>
  );
}
