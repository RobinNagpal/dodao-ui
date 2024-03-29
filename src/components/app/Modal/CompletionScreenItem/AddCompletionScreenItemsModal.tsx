import Modal from '@/components/app/Modal';
import Button from '@/components/core/buttons/Button';

interface CompletionScreenItemModalProps {
  open: boolean;
  onClose: () => void;
  onAddButton: () => void;
}

function AddCompletionScreenItemsModal({ open, onClose, onAddButton }: CompletionScreenItemModalProps) {
  const addButton = () => {
    onAddButton();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className=" p-4 text-center font-bold text-2xl">Add Buttons for Completion Screen</div>
      <div className="m-4 space-y-2">
        <Button className="button-outline w-full flex justify-center items-center" onClick={() => addButton()}>
          Add a Button
        </Button>
      </div>
    </Modal>
  );
}

export default AddCompletionScreenItemsModal;
