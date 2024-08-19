import React, { useState } from 'react';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/src/components/core/dropdowns/EllipsisDropdown';
import FullPageModal from '@dodao/web-core/src/components/core/modals/FullScreenModal';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor';
import Input from '@dodao/web-core/components/core/input/Input';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import ProgramDropDown from '@/components/programDropDown/programDropDown';
import { SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
interface RubricDetails {
  name: string;
  summary: string;
  description: string;
}

interface RubricDetailsProps {
  rubricDetails: RubricDetails;
  setRubricDetails: React.Dispatch<React.SetStateAction<RubricDetails>>;
  isEditAccess: boolean | undefined;
  editRubricDetails?: {
    name: string | undefined;
    summary: string | undefined;
    description: string | undefined;
  };
  programs?: any;
  setPrograms?: any;
  onSelectProgram?: any;
  selectedProgramId?: string | null;
  isGlobalAccess?: boolean;
  rubricId?: string;
  space: SpaceWithIntegrationsFragment;
}

const RubricDetails: React.FC<RubricDetailsProps> = ({
  rubricDetails,
  setRubricDetails,
  isEditAccess,
  editRubricDetails,
  programs,
  setPrograms,
  onSelectProgram,
  selectedProgramId,
  isGlobalAccess,
  rubricId,
  space,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { showNotification } = useNotificationContext();
  const router = useRouter();
  const handleBack = () => {
    router.push(`/rubrics`);
  };
  const handleSelect = (key: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (key === 'edit') {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    const { name, summary, description } = rubricDetails;
    const spaceId = space.id;
    if (isGlobalAccess) {
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

      const sendInitialRubricToServer = async () => {
        try {
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
        } catch (error) {
          console.error('Error sending rubric:', error);
        }
      };

      sendInitialRubricToServer();
    } else if (!isGlobalAccess) {
      const updateRubricDetails = async () => {
        try {
          const response = await fetch(`/api/rubrics/${rubricId}`, {
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
            setIsModalOpen(false);
          } else {
            console.error('Failed to update rubric details:', response.statusText);
          }
        } catch (error) {
          console.error('Error updating rubric details:', error);
        }
      };

      updateRubricDetails();
    }
  };

  const dropdownItems: EllipsisDropdownItem[] = [{ label: 'Edit', key: 'edit' }];

  return (
    <div className="relative">
      <FullPageModal open={isModalOpen} onClose={handleCloseModal} title="Edit Rubric" showCloseButton={false}>
        <button onClick={handleBack} style={{ color: 'var(--primary-color)' }} className="flex items-center focus:outline-none">
          <ChevronLeftIcon className="h-5 w-5 ml-4" />
          Rubrics
        </button>
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2 w-full max-w-4xl p-4">
            {isGlobalAccess && <ProgramDropDown serverResponse={programs} setServerResponse={setPrograms} onSelectProgram={onSelectProgram} space={space} />}
            <Input
              modelValue={rubricDetails.name}
              onUpdate={(value) => setRubricDetails((prev) => ({ ...prev, name: value as string }))}
              placeholder="Enter rubric name"
              label="Rubric Name"
              className="mb-3 text-left"
            />
            <label className="block mb-2 text-sm font-medium text-left">Description</label>
            <MarkdownEditor
              modelValue={rubricDetails.description}
              onUpdate={(value) => setRubricDetails((prev) => ({ ...prev, description: value }))}
              placeholder="Enter description"
              editorClass="mb-4"
            />
            <label className="block mt-4 mb-2 text-sm font-medium text-left">Summary</label>
            <MarkdownEditor
              modelValue={rubricDetails.summary}
              onUpdate={(value) => setRubricDetails((prev) => ({ ...prev, summary: value }))}
              placeholder="Enter summary"
              editorClass="mb-4"
            />
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="contained" primary onClick={handleSave} className="mt-2">
            Save
          </Button>
        </div>
      </FullPageModal>
    </div>
  );
};

export default RubricDetails;
