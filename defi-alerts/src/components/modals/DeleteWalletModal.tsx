'use client';

import React from 'react';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { formatWalletAddress } from '@/utils/getFormattedWalletAddress';

interface DeleteWalletModalProps {
  open: boolean;
  walletAddress: string | null;
  baseUrl: string;
  deleting: boolean;
  onClose: () => void;
  onDeleteSuccess: () => Promise<any>;
  deleteWallet: (url: string, data?: { walletAddress: string }) => Promise<any>;
}

/**
 * Component for confirming and handling wallet deletion
 */
const DeleteWalletModal: React.FC<DeleteWalletModalProps> = ({ open, walletAddress, baseUrl, deleting, onClose, onDeleteSuccess, deleteWallet }) => {
  if (!open || !walletAddress) return null;

  const handleConfirm = async () => {
    await deleteWallet(`${baseUrl}/api/user/wallet`, { walletAddress });
    await onDeleteSuccess();
    onClose();
  };

  return (
    <ConfirmationModal
      open={open}
      showSemiTransparentBg={true}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Delete Wallet Address"
      confirmationText={`Are you sure you want to remove wallet address ${formatWalletAddress(walletAddress)} from your account?`}
      confirming={deleting}
      askForTextInput={false}
    />
  );
};

export default DeleteWalletModal;
