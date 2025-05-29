'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatWalletAddress } from '@/utils/getFormattedWalletAddress';
import { BasePosition, WalletComparisonPosition } from './types';

type PositionsModalProps<T extends BasePosition> = {
  isOpen: boolean;
  handleClose: () => void;
  walletAddresses: string[];
  walletHasPositions: boolean;
  walletPositionsLoading: boolean;
  currentWalletAddress: string;
  setCurrentWalletAddress: (s: string) => void;
  onSwitchToAddWallet: () => void;
  onSwitchToMonitor: () => void;
  modalType: 'GENERAL' | 'COMPARISON';
  filteredPositions: T[];
  selectPosition: (p: T) => void;
};

export default function PositionsModal<T extends BasePosition>({
  isOpen,
  modalType,
  handleClose,
  walletAddresses,
  walletHasPositions,
  filteredPositions,
  walletPositionsLoading,
  currentWalletAddress,
  setCurrentWalletAddress,
  selectPosition,
  onSwitchToAddWallet,
  onSwitchToMonitor,
}: PositionsModalProps<T>) {
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-theme-bg-secondary border border-primary-color background-color">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-theme-primary">
            {modalType === 'GENERAL' ? 'Select Position to Monitor' : 'Select Position to Compare'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <h2 className="text-xl font-semibold mb-2 text-primary-color">
            {walletAddresses.length === 1 ? 'One Wallet Address Exists' : `${walletAddresses.length} Wallet Addresses Exist`}
          </h2>
          <p className="text-theme-primary mb-4">
            {modalType === 'GENERAL'
              ? 'I want to monitor only my positions i.e. know when borrow or supply rates change corresponding to my open positions'
              : 'I want to know when compound offers better rates for my positions on other protocols'}
          </p>

          <div className="mb-4 flex justify-end">
            <Button onClick={onSwitchToAddWallet} className="bg-primary-color text-primary-text">
              Add wallet+
            </Button>
          </div>

          {/* Wallet Selector */}
          {walletAddresses.length > 1 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-theme-primary">Your Wallets</h3>
              <div className="flex flex-wrap gap-2">
                {walletAddresses.map((wallet) => (
                  <Button
                    key={wallet}
                    variant={wallet === currentWalletAddress ? 'default' : 'outline'}
                    onClick={() => setCurrentWalletAddress(wallet)}
                    className={wallet === currentWalletAddress ? 'bg-primary-color text-primary-text' : 'text-theme-primary'}
                  >
                    {formatWalletAddress(wallet)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            {walletAddresses.length > 0 && (
              <div className="flex items-center p-2 border-b border-primary-color">
                <span className="text-theme-primary">Wallet address - {formatWalletAddress(currentWalletAddress)}</span>
              </div>
            )}

            {walletAddresses.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-theme-muted">No Wallet Address Added</p>
              </div>
            ) : walletPositionsLoading ? (
              <div className="p-6 text-center">
                <p className="text-theme-muted">Loading...</p>
              </div>
            ) : !walletHasPositions ? (
              <div className="p-6 text-center">
                <p className="text-theme-muted">No active positions found for this wallet address</p>
              </div>
            ) : filteredPositions.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-theme-muted">All positions for this wallet already have alerts configured</p>
              </div>
            ) : (
              <>
                <PositionList<T>
                  modalType={modalType}
                  positions={filteredPositions.filter((p) => p.actionType === 'SUPPLY')}
                  actionType="SUPPLY"
                  selectPosition={selectPosition}
                />
                <PositionList<T>
                  modalType={modalType}
                  positions={filteredPositions.filter((p) => p.actionType === 'BORROW')}
                  actionType="BORROW"
                  selectPosition={selectPosition}
                />
              </>
            )}
          </div>
        </div>

        <div className="pt-4 border-primary-color">
          <p className="text-theme-primary mb-4">I want to monitor various chains and markets to be alerted about the opportunities</p>

          <Button
            onClick={onSwitchToMonitor}
            className="bg-transparent border border-primary-color text-primary-color hover:bg-primary-color hover:text-primary-text"
          >
            Monitor Markets
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
interface PositionListProps<T> {
  modalType: 'GENERAL' | 'COMPARISON';
  positions: T[];
  actionType: 'SUPPLY' | 'BORROW';
  selectPosition: (p: T) => void;
}

function PositionList<T extends BasePosition>({ modalType, positions, actionType, selectPosition }: PositionListProps<T>) {
  if (positions.length === 0) return null;

  const title = actionType === 'SUPPLY' ? 'Supply Positions' : 'Borrow Positions';

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold my-2 text-primary-color">{title}</h3>
      {positions.map((position, idx) => (
        <div
          key={position.id}
          className="flex items-center justify-between p-3 border-b border-primary-color cursor-pointer hover:bg-theme-bg-muted"
          onClick={() => selectPosition(position)}
        >
          <div>
            <span className="text-theme-primary">Position # {idx + 1}</span>
            <div className="text-sm text-theme-muted">
              {position.market} on {position.chain}
              {modalType === 'COMPARISON' ? ` vs ${(position as unknown as WalletComparisonPosition).platform}` : ''} – Current{' '}
              {modalType === 'GENERAL' ? 'APR' : 'APY'}: {position.rate}
            </div>
          </div>
          <Button
            size="sm"
            className="bg-primary-color text-primary-text"
            onClick={(e) => {
              e.stopPropagation();
              selectPosition(position);
            }}
          >
            Add Alert
          </Button>
        </div>
      ))}
    </div>
  );
}
