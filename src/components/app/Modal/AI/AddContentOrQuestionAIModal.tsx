import Modal from '@/components/app/Modal';
import Button from '@/components/core/buttons/Button';

interface AddStepItemModalProps {
  open: boolean;
  onGenerateContent: () => void;
  onGenerateQuestions: () => void;
  onClose: () => void;
}

export default function AddContentOrQuestionAIModal({ open, onClose, onGenerateContent, onGenerateQuestions }: AddStepItemModalProps) {
  const addQuestions = () => {
    onGenerateQuestions();
    onClose();
  };

  const addContent = () => {
    onGenerateContent();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className=" p-4 text-center font-bold text-2xl">Generate Using AI</h3>
      <div className="m-4 space-y-2">
        <Button className="button-outline w-full flex justify-center items-center" onClick={() => addContent()}>
          Generate Content
        </Button>
        <Button className="button-outline w-full flex justify-center items-center" onClick={() => addQuestions()}>
          Generate Questions
        </Button>
      </div>
    </Modal>
  );
}
