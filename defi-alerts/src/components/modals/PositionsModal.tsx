'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatWalletAddress } from '@/utils/getFormattedWalletAddress';
import { BasePosition, WalletComparisonPosition } from './types';
import Image from 'next/image';
import { useState } from 'react';

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
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-6xl max-h-[90vh] overflow-y-auto bg-theme-bg-secondary border border-primary-color background-color">
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

// Platform Image component with error handling
function PlatformImage({ platform }: { platform: string }) {
  const [imageError, setImageError] = useState(false);

  let imageUrl = '';
  if (platform === 'AAVE') imageUrl = '/aave1.svg';
  else if (platform === 'SPARK') imageUrl = '/spark.svg';
  else if (platform === 'MORPHO') imageUrl = '/morpho1.svg';

  if (imageError) {
    // Fallback to a colored div with the first letter of the platform
    return (
      <div 
        className="flex items-center justify-center bg-primary-color text-primary-text rounded-full"
        style={{ width: '20px', height: '20px', fontSize: '10px' }}
      >
        {platform.charAt(0)}
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={`${platform} logo`}
      width={20}
      height={20}
      onError={() => setImageError(true)}
    />
  );
}

// Asset Image component with error handling
function AssetImage({ chain, assetAddress, assetSymbol }: { chain: string; assetAddress: string; assetSymbol: string }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.toLowerCase()}/assets/${assetAddress}/logo.png`;

  if (imageError) {
    // Fallback to a colored div with the first letter of the token symbol
    return (
      <div 
        className="flex items-center justify-center bg-primary-color text-primary-text rounded-full"
        style={{ width: '20px', height: '20px', fontSize: '10px' }}
      >
        {assetSymbol.charAt(0)}
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={assetSymbol}
      width={20}
      height={20}
      onError={() => setImageError(true)}
    />
  );
}

function PositionList<T extends BasePosition>({ modalType, positions, actionType, selectPosition }: PositionListProps<T>) {
  if (positions.length === 0) return null;

  const title = actionType === 'SUPPLY' ? 'Supply Positions' : 'Borrow Positions';

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold my-2 text-primary-color">{title}</h3>
      {positions.map((position, idx) => (
        <div key={position.id} className="flex items-center justify-between gap-x-2 p-3 border-b border-primary-color hover:bg-theme-bg-muted">
          <div className="flex gap-x-2 items-center">
            {modalType === 'COMPARISON' && (
              <PlatformImage platform={(position as unknown as WalletComparisonPosition).platform} />
            )}
            <div>
              <span className="text-theme-primary">Position # {idx + 1}</span>
              <div className="flex gap-x-2">
                <AssetImage 
                  chain={position.chain}
                  assetAddress={position.assetAddress}
                  assetSymbol={position.assetSymbol}
                />
                <div className="text-sm text-theme-muted">
                  {position.assetSymbol} on {position.chain}
                  {modalType === 'COMPARISON' ? ` - ${(position as unknown as WalletComparisonPosition).platform}` : ''} – Current{' '}
                  {modalType === 'GENERAL' ? 'APR' : 'APY'}: {position.rate}
                </div>
              </div>
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
