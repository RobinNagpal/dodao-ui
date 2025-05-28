// src/components/alerts/modals/InitialModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { utils } from 'ethers';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';

interface InitialModalProps {
  isOpen: boolean;
  handleClose: () => void;
  onWalletAdded: (newAddr: string) => void;
  onSwitchToMonitor: () => void;
}

export default function InitialModal({ isOpen, handleClose, onWalletAdded, onSwitchToMonitor }: InitialModalProps) {
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

  // When modal closes, clear errors/input
  useEffect(() => {
    if (!isOpen) {
      setNewWalletAddress('');
      setErrorMsg('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-theme-bg-secondary border border-primary-color background-color">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-theme-primary">Create Alert</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <h2 className="text-xl font-semibold mb-4 text-primary-color">No wallet address exists</h2>

          <div className="mb-6 p-4 border border-primary-color rounded-lg">
            <p className="text-theme-primary mb-4">
              I want to monitor only my positions i.e. know when borrow or supply rates change corresponding to my open positions
            </p>

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

          <div className="p-4 border border-primary-color rounded-lg">
            <p className="text-theme-primary mb-4">I want to monitor various chains and markets to be alerted about the opportunities</p>

            <Button
              onClick={onSwitchToMonitor}
              className="bg-transparent border border-primary-color text-primary-color hover:bg-primary-color hover:text-primary-text"
            >
              Monitor Markets
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
