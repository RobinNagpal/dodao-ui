import React, { useState } from 'react';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/src/components/core/dropdowns/EllipsisDropdown';
import FullPageModal from '@dodao/web-core/src/components/core/modals/FullScreenModal';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor';
import Input from '@dodao/web-core/components/core/input/Input';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import Button from '@dodao/web-core/components/core/buttons/Button';
interface RubricDetails {
  name: string;
  summary: string;
  description: string;
}

interface RubricDetailsProps {
  rubricDetails: RubricDetails;
  setRubricDetails: React.Dispatch<React.SetStateAction<RubricDetails>>;
  isEditAccess: boolean | undefined;
}

const RubricDetails: React.FC<RubricDetailsProps> = ({ rubricDetails, setRubricDetails, isEditAccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showNotification } = useNotificationContext();

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
      <div className="flex items-center pb-8 align-center justify-center">
        {/* <h1 className="text-3xl font-bold text-center p-2">{isEditAccess ? 'Edit Rubric' : 'Giving Feedback on'}</h1> */}
        {isEditAccess && <EllipsisDropdown items={dropdownItems} onSelect={handleSelect} />}
      </div>

      <FullPageModal open={isModalOpen} onClose={handleCloseModal} title="Edit Rubric" showCloseButton={true}>
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2 w-full max-w-4xl p-4">
            <Input
              modelValue={rubricDetails.name}
              onUpdate={(value) => setRubricDetails((prev) => ({ ...prev, name: value as string }))}
              placeholder="Enter rubric name"
              label="Rubric Name"
              className="mb-3 text-center"
            />
            <label className="block mb-2 text-sm font-medium">Description</label>
            <MarkdownEditor
              modelValue={rubricDetails.description}
              onUpdate={(value) => setRubricDetails((prev) => ({ ...prev, description: value }))}
              placeholder="Enter description"
              editorClass="mb-4"
            />
            <label className="block mt-4 mb-2 text-sm font-medium">Summary</label>
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
