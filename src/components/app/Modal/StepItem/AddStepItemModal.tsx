import Modal from '@/components/app/Modal';
import Button from '@/components/core/buttons/Button';
import { InputType, QuestionType } from '@/types/deprecated/models/enums';
import styled from 'styled-components';

interface AddStepItemModalProps {
  open: boolean;
  hasDiscordEnabled: boolean;
  onClose: () => void;
  onAddQuestion: (questionType: QuestionType) => void;
  onAddInput: (inputType: InputType) => void;
  onAddDiscord: () => void;
}

const ModalHeader = styled.h3`
  /* Custom styles if needed */
`;

function AddStepItemModal({ open, hasDiscordEnabled, onClose, onAddQuestion, onAddInput, onAddDiscord }: AddStepItemModalProps) {
  const addQuestion = (questionType: QuestionType) => {
    onAddQuestion(questionType);
    onClose();
  };

  const addInput = (inputType: InputType) => {
    onAddInput(inputType);
    onClose();
  };

  const addDiscord = () => {
    onAddDiscord();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader className=" p-4 text-center font-bold text-2xl">Add Input or Question</ModalHeader>
      <div className="m-4 space-y-2">
        <Button className="button-outline w-full flex justify-center items-center" onClick={() => addInput(InputType.PublicShortInput)}>
          Public Input
        </Button>
        <Button className="button-outline w-full flex justify-center items-center" onClick={() => addInput(InputType.PrivateShortInput)}>
          Private Input
        </Button>
        <Button className="button-outline w-full flex justify-center items-center" onClick={() => addQuestion(QuestionType.MultipleChoice)}>
          Multiple Choice Question
        </Button>
        <Button className="button-outline w-full flex justify-center items-center" onClick={() => addQuestion(QuestionType.SingleChoice)}>
          Single Choice Question
        </Button>
        <Button disabled={hasDiscordEnabled} className="button-outline w-full flex justify-center items-center" onClick={addDiscord}>
          Add Discord
        </Button>
      </div>
    </Modal>
  );
}

export default AddStepItemModal;
