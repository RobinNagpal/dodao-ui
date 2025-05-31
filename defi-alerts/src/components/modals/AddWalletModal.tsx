// src/components/alerts/modals/AddWalletModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { utils } from 'ethers';

interface AddWalletModalProps {
  isOpen: boolean;
  handleClose: () => void;
  onWalletAdded: (addr: string) => void;
  onSwitchToPositions: () => void;
}

export default function AddWalletModal({ isOpen, handleClose, onSwitchToPositions, onWalletAdded }: AddWalletModalProps) {
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const baseUrl = getBaseUrl();
  const {
    postData: postWalletAddress,
    loading: addingWallet,
    error: addWalletError,
  } = usePostData<any, { walletAddress: string }>({
    successMessage: 'Wallet address added successfully',
    errorMessage: 'Failed to add wallet address',
  });

  // When modal closes, clear errors/input
  useEffect(() => {
    if (!isOpen) {
      setNewWalletAddress('');
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleAddWallet = async () => {
    const addr = newWalletAddress.trim();
    if (!utils.isAddress(addr)) {
      setErrorMsg('Invalid wallet address');
      return;
    }
    setErrorMsg('');
    const success = await postWalletAddress(`${baseUrl}/api/user/wallet`, { walletAddress: newWalletAddress });

    if (success) {
      onWalletAdded(addr);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-6xl max-h-[90vh] overflow-y-auto bg-theme-bg-secondary border border-primary-color background-color">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-theme-primary">Add Wallet Address</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-theme-primary mb-4">Enter a wallet address to monitor its positions</p>

          <div className="flex gap-2">
            <Input
              placeholder="0x... (wallet address)"
              value={newWalletAddress}
              onChange={(e) => setNewWalletAddress(e.target.value)}
              className="border-theme-primary"
            />
            <Button onClick={handleAddWallet} className="bg-primary-color text-primary-text" disabled={addingWallet}>
              Add +
            </Button>
          </div>
          <p className="text-red-500 text-sm p-2">{errorMsg || addWalletError}</p>
        </div>

        <DialogFooter>
          <Button onClick={onSwitchToPositions} className="border hover-border-primary">
            Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
