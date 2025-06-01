'use client';

import { AlertResponse } from '@/app/api/alerts/route';
import { PlatformImage } from '@/components/alerts/core/PlatformImage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatWalletAddress } from '@/utils/getFormattedWalletAddress';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AssetImage } from '../alerts/core/AssetImage';
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
  alerts?: AlertResponse[];
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
  alerts = new Array<AlertResponse>(),
}: PositionsModalProps<T>) {
  // Function to check if a position has an existing alert
  const hasExistingAlert = (position: T) => {
    if (!alerts || alerts.length === 0) return false;

    // Normalize ETH to WETH for comparison
    const normalizedMarket = position.assetSymbol === 'ETH' ? 'WETH' : position.assetSymbol;

    if (modalType === 'GENERAL') {
      // For general alerts, check if there's an alert for this position
      return alerts.some(
        (alert: AlertResponse) =>
          alert.walletAddress === position.walletAddress &&
          alert.selectedChains?.some((chain: any) => chain.name === position.chain) &&
          alert.selectedAssets?.some((asset: any) => asset.symbol === normalizedMarket) &&
          alert.actionType === position.actionType
      );
    } else {
      // For comparison alerts, check if there's a comparison alert for this position
      return alerts.some(
        (alert) =>
          alert.isComparison &&
          alert.walletAddress === position.walletAddress &&
          alert.selectedChains?.some((chain: any) => chain.name === position.chain) &&
          alert.selectedAssets?.some((asset: any) => asset.symbol === normalizedMarket) &&
          alert.actionType === position.actionType &&
          (position as any).platform &&
          alert.compareProtocols?.includes((position as any).platform)
      );
    }
  };

  // Function to get the alert ID for a position
  const getAlertId = (position: T) => {
    if (!alerts || alerts.length === 0) return undefined;

    const normalizedMarket = position.assetSymbol === 'ETH' ? 'WETH' : position.assetSymbol;

    if (modalType === 'GENERAL') {
      const existingAlert = alerts.find(
        (alert) =>
          alert.walletAddress === position.walletAddress &&
          alert.selectedChains?.some((chain: any) => chain.name === position.chain) &&
          alert.selectedAssets?.some((asset: any) => asset.symbol === normalizedMarket) &&
          alert.actionType === position.actionType
      );
      return existingAlert?.id;
    } else {
      const existingAlert = alerts.find(
        (alert) =>
          alert.isComparison &&
          alert.walletAddress === position.walletAddress &&
          alert.selectedChains?.some((chain: any) => chain.name === position.chain) &&
          alert.selectedAssets?.some((asset: any) => asset.symbol === normalizedMarket) &&
          alert.actionType === position.actionType &&
          (position as any).platform &&
          alert.compareProtocols?.includes((position as any).platform)
      );
      return existingAlert?.id;
    }
  };
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
              <Plus size={20} className="mr-2" /> Add wallet
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
                <p className="text-theme-muted">No positions found for this wallet</p>
              </div>
            ) : (
              <>
                <PositionList<T>
                  modalType={modalType}
                  positions={filteredPositions.filter((p) => p.actionType === 'SUPPLY')}
                  actionType="SUPPLY"
                  selectPosition={selectPosition}
                  hasExistingAlert={hasExistingAlert}
                  getAlertId={getAlertId}
                />
                <PositionList<T>
                  modalType={modalType}
                  positions={filteredPositions.filter((p) => p.actionType === 'BORROW')}
                  actionType="BORROW"
                  selectPosition={selectPosition}
                  hasExistingAlert={hasExistingAlert}
                  getAlertId={getAlertId}
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
  hasExistingAlert: (p: T) => boolean;
  getAlertId: (p: T) => string | undefined;
}

function PositionList<T extends BasePosition>({ modalType, positions, actionType, selectPosition, hasExistingAlert, getAlertId }: PositionListProps<T>) {
  const router = useRouter();
  if (positions.length === 0) return null;

  const title = actionType === 'SUPPLY' ? 'Supply Positions' : 'Borrow Positions';

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold my-2 text-primary-color">{title}</h3>
      {positions.map((position, idx) => (
        <div key={position.id} className="flex items-center justify-between gap-x-2 p-3 border-b border-primary-color hover:bg-theme-bg-muted">
          <div className="flex gap-x-2 items-center">
            <div>
              <div className="flex items-center gap-x-2">
                {modalType === 'COMPARISON' && <PlatformImage platform={(position as unknown as WalletComparisonPosition).platform} />}
                {modalType === 'COMPARISON' ? `${(position as unknown as WalletComparisonPosition).platform} - ` : ''}
                <span className="text-theme-primary">Position # {idx + 1}</span>
              </div>
              <div className="flex gap-x-2">
                <AssetImage chain={position.chain} assetAddress={position.assetAddress} assetSymbol={position.assetSymbol} />
                <div className="text-sm text-theme-muted">
                  {position.assetSymbol} on {position.chain}– Current {modalType === 'GENERAL' ? 'APR' : 'APY'}: {position.rate}
                </div>
              </div>
            </div>
          </div>

          {hasExistingAlert(position) ? (
            <Button
              size="sm"
              className="bg-primary-color text-primary-text"
              onClick={(e) => {
                e.stopPropagation();
                const alertId = getAlertId(position);
                if (alertId) {
                  router.push(`/alerts/edit/${alertId}`);
                }
              }}
            >
              Edit
            </Button>
          ) : (
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
          )}
        </div>
      ))}
    </div>
  );
}
