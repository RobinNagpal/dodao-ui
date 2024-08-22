'use client';

import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor';
import { RubricWithEntities, SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { Program } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface RubricDetails {
  name: string;
  summary: string;
  description: string;
}

interface RubricBasicInfoFormProps {
  rubric?: RubricWithEntities;
  programs: Program[];
  space: SpaceWithIntegrationsFragment;
  onCreateOrUpdate: (rubricId: string) => void;
}

const RubricBasicInfoForm: React.FC<RubricBasicInfoFormProps> = ({ rubric, programs, space }) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const { showNotification } = useNotificationContext();
  const router = useRouter();
  const handleBack = () => {
    router.push(`/rubrics`);
  };

  const [rubricBasicInfo, setRubricBasicInfo] = useState<RubricDetails>({
    name: rubric?.name || '',
    summary: rubric?.summary || '',
    description: rubric?.description || '',
  });

  const handleSave = async () => {
    const { name, summary, description } = rubricBasicInfo;
    const spaceId = space.id;
    if (!rubric) {
      if (!name || !summary) {
        showNotification({
          type: 'error',
          message: 'Name and Summary are required.',
        });
        return;
      }

      const programId = selectedProgramId;
      const rubric = {
        name: name,
        summary: summary,
        description: description,
        levels: [
          {
            columnName: 'Excellent',
            description: 'The performance is outstanding.',
            score: 5,
          },
          {
            columnName: 'Good',
            description: 'The performance is above average.',
            score: 4,
          },
          {
            columnName: 'Fair',
            description: 'The performance meets the minimum requirements.',
            score: 3,
          },
          {
            columnName: 'Improvement Needed',
            description: 'The performance is below expectations.',
            score: 2,
          },
        ],
        criteria: 'Content',
      };

      const response = await fetch(`${getBaseUrl()}/api/rubrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ programId, rubric, spaceId }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Rubric sent successfully:', result.body);
        showNotification({
          type: 'success',
          message: 'Rubric created',
        });
        router.push(`/rubrics/edit/${result.body.id}`);
      } else {
        console.error('Failed to send rubric:', response.statusText);
      }
    } else {
      const response = await fetch(`/api/rubrics/${rubric.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          summary: summary,
          description: description,
          spaceId: spaceId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Rubric details updated successfully:', result.body);
        showNotification({
          type: 'success',
          message: 'Rubric updated',
        });
      } else {
        showNotification({
          type: 'error',
          message: 'Failed to update rubric details.',
        });
      }
    }
  };

  const programItems: StyledSelectItem[] = programs.map((program) => ({
    id: program.id.toString(),
    label: program.name,
  }));

  return (
    <PageWrapper>
      <button onClick={handleBack} style={{ color: 'var(--primary-color)' }} className="flex items-center focus:outline-none">
        <ChevronLeftIcon className="h-5 w-5 ml-4" />
        Rubrics
      </button>

      <StyledSelect label="Select a program" items={programItems} selectedItemId={selectedProgramId} setSelectedItemId={(id) => setSelectedProgramId(id)} />

      <Input
        modelValue={rubricBasicInfo.name}
        onUpdate={(value) => setRubricBasicInfo((prev) => ({ ...prev, name: value as string }))}
        placeholder="Enter rubric name"
        label="Rubric Name"
      />
      <label>Description</label>
      <MarkdownEditor
        modelValue={rubricBasicInfo.description}
        onUpdate={(value) => setRubricBasicInfo((prev) => ({ ...prev, description: value }))}
        placeholder="Enter description"
      />
      <label>Summary</label>
      <MarkdownEditor
        modelValue={rubricBasicInfo.summary}
        onUpdate={(value) => setRubricBasicInfo((prev) => ({ ...prev, summary: value }))}
        placeholder="Enter summary"
      />

      <div className="flex justify-center gap-2 mt-4">
        <Button variant="contained" primary onClick={handleSave} className="mt-2">
          Save
        </Button>
      </div>
    </PageWrapper>
  );
};

export default RubricBasicInfoForm;
