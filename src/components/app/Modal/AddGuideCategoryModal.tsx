import React, { useState } from 'react';
import Modal from '@/components/app/Modal';
import styled from 'styled-components';
import Button from '@/components/app/Button';
import { GuideCategoryType } from '@/types/deprecated/models/enums';

const ModalHeader = styled.h3`
  /* Custom styles if needed */
`;

interface GuideCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onAddInput: (value: GuideCategoryType[]) => void;
}

const AddGuideCategoryModal = ({ open, onClose, onAddInput }: GuideCategoryModalProps) => {
  const [selectedButtons, setSelectedButtons] = useState<GuideCategoryType[]>([]);

  const selectButton = (category: GuideCategoryType) => {
    if (selectedButtons.includes(category)) {
      // Deselect the button
      setSelectedButtons(selectedButtons.filter((index) => index !== category));
    } else {
      // Select the button
      setSelectedButtons([...selectedButtons, category]);
    }
  };

  function addInput(inputType: GuideCategoryType, buttonIndex: number) {
    selectButton(inputType);
  }

  function handleConfirm() {
    onAddInput([...selectedButtons]);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader className=" p-4 text-center font-bold text-2xl">Select Categories</ModalHeader>

      <div className="m-4 space-y-2  max-h-[50%] overflow-scroll">
        <p>select upto two categories</p>

        {Object.values(GuideCategoryType).map((i, buttonIndex) => (
          <Button
            key={i}
            className={`button-outline w-full flex justify-center items-center transition-opacity ${selectedButtons.includes(i) ? 'opacity-50 ' : ''}`}
            onClick={() => addInput(i, buttonIndex)}
            disabled={selectedButtons.length >= 2 && !selectedButtons.includes(i)}
          >
            {i}
          </Button>
        ))}
      </div>
      <div className="flex flex-1 p-5">
        <Button onClick={onClose} className=" basis-1/2 py-2 gap-2">
          cancel
        </Button>
        <Button onClick={handleConfirm} className=" basis-1/2 py-2">
          confirm
        </Button>
      </div>
    </Modal>
  );
};

export default AddGuideCategoryModal;
