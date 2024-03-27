import Modal from '@/components/app/Modal';
import Button from '@/components/core/buttons/Button';
import styled from 'styled-components';

interface CompletionScreenItemModalProps {
  open: boolean;
  onClose: () => void;
  onAddButton: () => void;
}

const ModalHeader = styled.h3`
  /* Custom styles if needed */
`;

function CompletionScreenItemModal({ open, onClose, onAddButton }: CompletionScreenItemModalProps) {
  const addButton = () => {
    onAddButton();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader className=" p-4 text-center font-bold text-2xl">Add Input or Question</ModalHeader>
      <div className="m-4 space-y-2">
        <Button className="button-outline w-full flex justify-center items-center" onClick={() => addButton()}>
          Add a Button
        </Button>
      </div>
    </Modal>
  );
}

export default CompletionScreenItemModal;
