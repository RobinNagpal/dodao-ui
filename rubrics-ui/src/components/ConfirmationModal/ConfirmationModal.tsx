import { ConfirmationModalProps } from '@/types/rubricsTypes/types';
import Button from '@dodao/web-core/components/core/buttons/Button';
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-xl mb-2">{message}</h2>
        <div className="mt-4 flex justify-end space-x-2">
          <Button onClick={onClose} className="px-4 py-2">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmationModal;
