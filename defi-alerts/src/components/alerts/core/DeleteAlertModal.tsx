import React from 'react';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

interface DeleteAlertModalProps {
  open: boolean;
  alertId: string | null;
  baseUrl: string;
  deleting: boolean;
  onClose: () => void;
  onDeleteSuccess: () => Promise<void>;
  deleteAlert: (url: string) => Promise<any>;
}

/**
 * Component for confirming and handling alert deletion
 */
const DeleteAlertModal: React.FC<DeleteAlertModalProps> = ({ open, alertId, baseUrl, deleting, onClose, onDeleteSuccess, deleteAlert }) => {
  if (!open || !alertId) return null;

  const handleConfirm = async () => {
    await deleteAlert(`${baseUrl}/api/alerts/${alertId}`);
    await onDeleteSuccess();
    onClose();
  };

  return (
    <ConfirmationModal
      open={open}
      showSemiTransparentBg={true}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Delete Alert"
      confirmationText="Are you sure you want to delete this alert?"
      confirming={deleting}
      askForTextInput={false}
    />
  );
};

export default DeleteAlertModal;
