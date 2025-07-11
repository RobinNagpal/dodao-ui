'use client';

import { AlertWithAllDetails, type Channel } from '@/types/alerts';
import { useCompoundUserPositions } from '@/utils/getCompoundUserPositions';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AddWalletModal from '../modals/AddWalletModal';
import ConfigurePositionModal from '../modals/ConfigurePositionModal';
import InitialModal from '../modals/InitialModal';
import MonitorMarketsModal from '../modals/MonitorMarketsModal';
import PositionsModal from '../modals/PositionsModal';
import DeleteWalletModal from '../modals/DeleteWalletModal';
import { WalletPosition } from '../modals/types';

interface CreateAlertModalsProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertsUpdated?: () => void;
}

export default function CreateAlertModals({ isOpen, onClose, onAlertsUpdated }: CreateAlertModalsProps) {
  const { data } = useSession();
  const session = data as DoDAOSession;
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();
  const fetchPositions = useCompoundUserPositions();

  // Modal state
  const [currentModal, setCurrentModal] = useState<'monitorMarkets' | 'positions' | 'configurePosition' | 'addWallet' | 'deleteWallet'>('positions');
  const [walletAddresses, setWalletAddresses] = useState<string[]>([]);
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>('');
  const [walletHasPositions, setWalletHasPositions] = useState<boolean>(false);

  // Delete wallet state
  const [walletToDelete, setWalletToDelete] = useState<string | null>(null);

  // Monitor markets state
  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: '' }]);

  // Fetch existing alerts
  const {
    data: alertsData,
    loading: alertsLoading,
    error: alertsError,
    reFetchData: reFetchAlerts,
  } = useFetchData<AlertWithAllDetails[]>(`${baseUrl}/api/alerts`, { skipInitialFetch: !session?.userId }, 'Failed to load alerts');

  // Fetch user's wallet addresses
  const {
    data: walletData,
    loading: loadingWallets,
    error: walletError,
    reFetchData: reFetchWallets,
  } = useFetchData<{ walletAddresses: string[] }>(`${baseUrl}/api/user/wallet/get`, { skipInitialFetch: !isOpen }, 'Failed to load wallet addresses');

  // Delete wallet hook
  const { loading: deleting, deleteData: deleteWallet } = useDeleteData<{ success: boolean }, { walletAddress: string }>({
    successMessage: 'Wallet address removed successfully',
    errorMessage: 'Failed to remove wallet address',
  });

  const [allPositions, setAllPositions] = useState<WalletPosition[]>([]);
  const [walletPositionsLoading, setWalletPositionsLoading] = useState(false);

  // Filtered positions based on current wallet address and existing alerts
  const [filteredPositions, setFilteredPositions] = useState<WalletPosition[]>([]);

  // Selected position state
  const [selectedPosition, setSelectedPosition] = useState<WalletPosition | null>(null);
  const [positionChannels, setPositionChannels] = useState<{ [positionId: string]: Channel[] }>({});

  // Validation errors
  const [errors, setErrors] = useState<{
    chains?: string;
    markets?: string;
    conditions?: string[];
    channels?: string[];
    [positionId: string]: any;
  }>({});

  // Set initial modal state based on wallet addresses
  useEffect(() => {
    if (isOpen && walletData) {
      const userWallets = walletData.walletAddresses ?? [];

      setWalletAddresses(userWallets);
      setCurrentWalletAddress(userWallets[0]);
      setCurrentModal('positions');
    }
  }, [isOpen, walletData]);

  useEffect(() => {
    if (walletAddresses.length === 0 || allPositions.length > 0) {
      return;
    }

    setWalletPositionsLoading(true);
    setAllPositions([]);

    (async () => {
      try {
        console.log('Fetching user positions for wallets:', walletAddresses);
        const result = await fetchPositions(walletAddresses);
        console.log('Fetched positions:', result);
        setAllPositions(result);
      } catch (err) {
        console.error('Error fetching user positions', err);
      } finally {
        setWalletPositionsLoading(false);
      }
    })();
  }, [walletAddresses]);

  // Filter positions based on current wallet address
  useEffect(() => {
    if (!currentWalletAddress) {
      setFilteredPositions([]);
      return;
    }

    // Get positions for the current wallet
    const walletPositions = allPositions.filter((pos) => pos.walletAddress === currentWalletAddress);

    if (walletPositions.length === 0) {
      setWalletHasPositions(false);
      setFilteredPositions([]);
      return;
    }

    setWalletHasPositions(true);
    setFilteredPositions(walletPositions);
  }, [currentWalletAddress, allPositions]);

  // Initialize email field with username when component mounts
  useEffect(() => {
    if (session?.username) {
      setChannels((ch) => ch.map((channel) => (channel.channelType === 'EMAIL' ? { ...channel, email: session.username } : channel)));

      // Initialize channels for positions
      const updatedChannels = { ...positionChannels };
      allPositions.forEach((position) => {
        if (!updatedChannels[position.id]) {
          updatedChannels[position.id] = [{ channelType: 'EMAIL', email: session.username }];
        } else {
          updatedChannels[position.id] = updatedChannels[position.id].map((channel) =>
            channel.channelType === 'EMAIL' ? { ...channel, email: session.username } : channel
          );
        }
      });
      setPositionChannels(updatedChannels);
    }
  }, [session?.username, allPositions]);

  // Handle close and reset
  const handleClose = () => {
    setCurrentModal('positions');
    setSelectedPosition(null);
    onClose();
  };

  // Position functions
  const selectPosition = (position: WalletPosition) => {
    setSelectedPosition(position);
    setCurrentModal('configurePosition');
  };

  const updatePosition = (positionId: string, updates: Partial<WalletPosition>) => {
    if (selectedPosition && selectedPosition.id === positionId) {
      setSelectedPosition({ ...selectedPosition, ...updates } as WalletPosition);
    }
  };

  const handleWalletAdded = async (newWalletAddress: string) => {
    setWalletAddresses((prev) => [...prev, newWalletAddress]);
    setCurrentWalletAddress(newWalletAddress);
    setWalletPositionsLoading(true);
    setCurrentModal('positions');

    setWalletHasPositions(false);
    try {
      console.log('Fetching user positions for wallet:', newWalletAddress);
      const newPositions = await fetchPositions([newWalletAddress]);
      console.log('Fetched positions:', newPositions);

      setAllPositions((prev) => [...prev, ...newPositions]);

      setWalletHasPositions((prevHas) => prevHas || newPositions.length > 0);
    } catch (err) {
      console.error('Error fetching user positions', err);
      showNotification({
        type: 'error',
        heading: 'Fetch Error',
        message: 'Could not load positions for that wallet.',
      });
    } finally {
      setWalletPositionsLoading(false);
    }
  };

  // Handle wallet deletion
  const handleDeleteWallet = (walletAddress: string) => {
    setWalletToDelete(walletAddress);
    setCurrentModal('deleteWallet');
  };

  const handleDeleteWalletClose = () => {
    setWalletToDelete(null);
    setCurrentModal('positions');
  };

  const handleDeleteWalletSuccess = async () => {
    if (walletToDelete) {
      try {
        // Reset delete state
        setWalletToDelete(null);

        await reFetchWallets();

        // Refetch alerts in the parent component since wallet deletion archives associated alerts
        if (onAlertsUpdated) {
          onAlertsUpdated();
        }

        // Close the entire modal after successful deletion
        onClose();
      } catch (error) {
        console.error('Error handling wallet deletion success:', error);
        setWalletToDelete(null);
        // Go back to positions modal on error
        setCurrentModal('positions');
      }
    }
  };

  // Render the appropriate modal based on current state
  return (
    <>
      <AddWalletModal
        isOpen={isOpen && currentModal === 'addWallet'}
        handleClose={handleClose}
        onWalletAdded={handleWalletAdded}
        onSwitchToPositions={() => setCurrentModal('positions')}
      />

      <MonitorMarketsModal
        isOpen={isOpen && currentModal === 'monitorMarkets'}
        modalType="MARKET"
        handleClose={handleClose}
        channels={channels}
        setChannels={setChannels}
        errors={errors}
        setErrors={setErrors}
        onSwitchModal={() => setCurrentModal('positions')}
      />

      <PositionsModal<WalletPosition>
        isOpen={isOpen && currentModal === 'positions'}
        modalType="GENERAL"
        handleClose={handleClose}
        walletAddresses={walletAddresses}
        walletHasPositions={walletHasPositions}
        filteredPositions={filteredPositions}
        walletPositionsLoading={walletPositionsLoading}
        currentWalletAddress={currentWalletAddress}
        setCurrentWalletAddress={setCurrentWalletAddress}
        selectPosition={selectPosition}
        onSwitchToAddWallet={() => setCurrentModal('addWallet')}
        onSwitchToMonitor={() => setCurrentModal('monitorMarkets')}
        onDeleteWallet={handleDeleteWallet}
        alerts={alertsData}
      />

      <ConfigurePositionModal<WalletPosition>
        isOpen={isOpen && currentModal === 'configurePosition'}
        modalType="GENERAL"
        selectedPosition={selectedPosition}
        handleClose={handleClose}
        updatePosition={updatePosition}
        positionChannels={positionChannels}
        setPositionChannels={setPositionChannels}
        errors={errors}
        setErrors={setErrors}
        onSwitchToPositions={() => setCurrentModal('positions')}
        onCreate={reFetchAlerts}
      />

      <DeleteWalletModal
        open={isOpen && currentModal === 'deleteWallet'}
        walletAddress={walletToDelete}
        baseUrl={baseUrl}
        deleting={deleting}
        onClose={handleDeleteWalletClose}
        onDeleteSuccess={handleDeleteWalletSuccess}
        deleteWallet={deleteWallet}
      />
    </>
  );
}
