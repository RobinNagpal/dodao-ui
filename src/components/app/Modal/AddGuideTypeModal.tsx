import Button from '@/components/app/Button';
import Modal from '@/components/app/Modal';
import { GuideType } from '@/types/deprecated/models/enums';
import styled from 'styled-components';

interface AddStepItemModalProps {
  open: boolean;
  onClose: () => void;
  onAddInput: (value: GuideType) => void;
}

const ModalHeader = styled.h3`
  /* Custom styles if needed */
`;

function AddGuideTypeModal({ open, onClose, onAddInput }: AddStepItemModalProps) {
  function addInput(inputType: GuideType) {
    onAddInput(inputType);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader className=" p-4 text-center font-bold text-2xl">Select Guide Type</ModalHeader>
      <div className="m-4 space-y-2">
        {Object.values(GuideType).map((i) => (
          <Button key={i} className="button-outline w-full flex justify-center items-center" onClick={() => addInput(i)}>
            {i}
          </Button>
        ))}

        {/* <Button className="button-outline w-full flex justify-center items-center" onClick={() => addInput(GuideType.course)} >
                    Course
                </Button>
                <Button className="button-outline w-full flex justify-center items-center" onClick={() => addInput(GuideType.Onboarding)} >
                    Onboarding
                </Button>
                <Button className="button-outline w-full flex justify-center items-center" onClick={() => addInput(GuideType.HowTo)} >
                    How To
                </Button>
                <Button className="button-outline w-full flex justify-center items-center" onClick={() => addInput(GuideType.LevelUp)} >
                    Level Up
                </Button> */}
      </div>
    </Modal>
  );
}

export default AddGuideTypeModal;
