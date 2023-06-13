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
  onAddInput: (value: GuideCategoryType) => void;
}

const AddGuideCategoryModal = ({ open, onClose, onAddInput }: GuideCategoryModalProps) => {
  const [selectedButtons, setSelectedButtons] = useState<number[]>([]);

  const selectButton = (buttonIndex: number) => {
    if (selectedButtons.includes(buttonIndex)) {
      // Deselect the button
      setSelectedButtons(selectedButtons.filter((index) => index !== buttonIndex));
    } else {
      // Select the button
      setSelectedButtons([...selectedButtons, buttonIndex]);
    }
  };

  function addInput(inputType: GuideCategoryType, buttonIndex: number) {
    selectButton(buttonIndex);
  }

  function handleConfirm(inputType: GuideCategoryType) {
    onAddInput(inputType);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader className=" p-4 text-center font-bold text-2xl">Select Categories</ModalHeader>

      <div className="m-4 space-y-2  max-h-[50%] overflow-scroll">
        <p>select upto two categories</p>

        {Object.values(GuideCategoryType).map((i, buttonIndex) => (
          <Button
            key={buttonIndex}
            className={`button-outline w-full flex justify-center items-center transition - opacity ${
              selectedButtons.includes(buttonIndex) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => addInput(i, buttonIndex)}
            disabled={selectedButtons.length >= 2 && !selectedButtons.includes(buttonIndex)}
          >
            {i}
          </Button>
        ))}
      </div>
      <div className="flex flex-1 p-5">
        <Button onClick={onClose} className=" basis-1/2 py-2 gap-2">
          cancel
        </Button>
        <Button className=" basis-1/2 py-2">confirm</Button>
      </div>
    </Modal>
  );
};

export default AddGuideCategoryModal;
