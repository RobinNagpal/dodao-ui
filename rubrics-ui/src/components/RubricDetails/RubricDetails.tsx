import React, { useState } from 'react';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/src/components/core/dropdowns/EllipsisDropdown';
import FullPageModal from '@dodao/web-core/src/components/core/modals/FullScreenModal';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor';
import Input from '@dodao/web-core/components/core/input/Input';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import ProgramDropDown from '@/components/ProgramDropDown/programDropDown';
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
}

const RubricDetails: React.FC<RubricDetailsProps> = ({
  rubricDetails,
  setRubricDetails,
  isEditAccess,
  editRubricDetails,
  programs,
  setPrograms,
  onSelectProgram,
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
    const { name, summary } = rubricDetails;

    if (!name || !summary) {
      showNotification({
        type: 'error',
        message: 'Name and Summary are required.',
      });
      return;
    }

    setIsModalOpen(false);
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
            <ProgramDropDown serverResponse={programs} setServerResponse={setPrograms} onSelectProgram={onSelectProgram} />
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
