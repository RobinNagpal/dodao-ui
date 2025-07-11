'use client';

import { ChainImage } from '@/components/alerts/core/ChainImage';
import { PlatformImage } from '@/components/alerts/core/PlatformImage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertWithAllDetails } from '@/types/alerts';
import { formatWalletAddress } from '@/utils/getFormattedWalletAddress';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AssetImage } from '../alerts/core/AssetImage';
import { BasePosition, WalletComparisonPosition } from './types';
import { toSentenceCase } from '@/utils/getSentenceCase';
import { Asset, Chain } from '@/types/alerts';

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
  onDeleteWallet: (walletAddress: string) => void;
  modalType: 'GENERAL' | 'COMPARISON';
  filteredPositions: T[];
  selectPosition: (p: T) => void;
  alerts?: AlertWithAllDetails[];
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
  onDeleteWallet,
  alerts = new Array<AlertWithAllDetails>(),
}: PositionsModalProps<T>) {
  // Function to check if a position has an existing alert
  const hasExistingAlert = (position: T) => {
    if (!alerts || alerts.length === 0) return false;

    if (modalType === 'GENERAL') {
      // For general alerts, check if there's an alert for this position
      return alerts.some(
        (alert: AlertWithAllDetails) =>
          alert.walletAddress === position.walletAddress &&
          alert.selectedChains?.some((chain: Chain) => chain.name === position.chain) &&
          alert.selectedAssets?.some((asset: Asset) => asset.address.toLowerCase() === position.assetAddress.toLowerCase()) &&
          alert.actionType === position.actionType
      );
    } else {
      // For comparison alerts, check if there's a comparison alert for this position
      return alerts.some(
        (alert) =>
          alert.isComparison &&
          alert.walletAddress === position.walletAddress &&
          alert.selectedChains?.some((chain: Chain) => chain.name === position.chain) &&
          alert.selectedAssets?.some((asset: Asset) => asset.address.toLowerCase() === position.assetAddress.toLowerCase()) &&
          alert.actionType === position.actionType &&
          (position as any).platform &&
          alert.compareProtocols?.includes((position as any).platform) &&
          ((position as any).platform === 'MORPHO' ? position.id === alert.marketId : true)
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
            {modalType === 'GENERAL' ? 'Create Compound Alerts' : 'Create Compound Vs Others Alerts'}
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 bg-theme-secondary rounded-lg border border-primary-color">
          <div className="text-xl font-semibold">General Alert</div>
          <div className="border-primary-color flex items-center gap-x-2">
            <p className="text-theme-primary">Monitor various chains and markets to be alerted about the opportunities</p>

            <Button
              onClick={onSwitchToMonitor}
              className="bg-transparent border border-primary-color text-primary-color hover:bg-primary-color hover:text-primary-text"
            >
              Monitor Markets
            </Button>
          </div>
        </div>
        <hr></hr>

        <div className="p-5 bg-theme-secondary rounded-lg border border-primary-color">
          <div className="text-xl font-semibold">Position Based Alert</div>
          <div className="py-4">
            <p className="font-semibold mb-2 text-primary-color">
              {walletAddresses.length === 1 ? 'One Wallet Address Exists' : `${walletAddresses.length} Wallet Addresses Exist`}
            </p>
            <p className="text-theme-primary mb-4">
              {modalType === 'GENERAL'
                ? 'Monitor change in Supply/Borrow rates for your open Compound positions.'
                : 'Monitor when Compound offers better rates for your positions on other lending-borrowing platforms.'}
            </p>

            <div className="flex justify-end">
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
                <div className="flex items-center justify-between p-2 border-b border-primary-color">
                  <span className="text-theme-primary">Wallet address - {formatWalletAddress(currentWalletAddress)}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteWallet(currentWalletAddress)}
                    className="border-red-500 text-red-500 hover-border-body"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Remove
                  </Button>
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
                  <p className="text-theme-muted">
                    {modalType === 'GENERAL'
                      ? 'No active positions found for this wallet address'
                      : 'No active positions found for this wallet address on any of the supported platforms'}
                  </p>
                </div>
              ) : filteredPositions.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-theme-muted">
                    {modalType === 'GENERAL'
                      ? 'No positions found for this wallet address'
                      : 'No positions found for this wallet address on any of the supported platforms'}
                  </p>
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
  const sortedPositions = [...positions].sort((a, b) => {
    // false → 0, true → 1, so (0 - 1) = -1 means "a" (non-disabled) runs before "b" (disabled)
    return Number(a.disable) - Number(b.disable);
  });

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold my-2 text-primary-color">{title}</h3>
      {sortedPositions.map((position, idx) => (
        <div key={position.id} className="flex items-center justify-between gap-x-2 p-3 border-b border-primary-color hover:bg-theme-bg-muted">
          <div className={`${position.disable ? 'text-gray-500' : 'text-theme-muted '}`}>
            <div className="flex items-center gap-x-2">
              {modalType === 'COMPARISON' && <PlatformImage platform={(position as unknown as WalletComparisonPosition).platform} />}
              {modalType === 'COMPARISON' ? `${toSentenceCase((position as unknown as WalletComparisonPosition).platform)} - ` : ''}
              <span className={`${position.disable ? 'text-gray-500' : 'text-theme-primary'}`}>Position # {idx + 1}</span>
            </div>
            <div className="">
              <AssetImage chain={position.chain} assetAddress={position.assetAddress} assetSymbol={position.assetSymbol} />
              <span className="mx-2">{position.assetSymbol} on </span>
              <ChainImage chain={position.chain} />
              <span className="ml-2 mr-1">({position.chain})</span>– Current {modalType === 'GENERAL' ? 'APR' : 'APY'}: {position.rate}
            </div>
          </div>

          {position.disable && <div className="text-sm text-right">No corresponding Compound Market for this chain and asset</div>}

          {!position.disable && (
            <>
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
                  Edit Alert
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-primary-color text-primary-text"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectPosition(position);
                  }}
                  disabled={position.disable}
                >
                  Add Alert
                </Button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
