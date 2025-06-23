'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { AlertWithAllDetails, type Channel } from '@/types/alerts';
import { useAaveUserPositions } from '@/utils/getAaveUserPositions';
import { useSparkUserPositions } from '@/utils/getSparkUserPositions';
import { useMorphoUserPositions } from '@/utils/geMorphoUserPositions';
import InitialModal from '../modals/InitialModal';
import AddWalletModal from '../modals/AddWalletModal';
import MonitorMarketsModal from '../modals/MonitorMarketsModal';
import PositionsModal from '../modals/PositionsModal';
import ConfigurePositionModal from '../modals/ConfigurePositionModal';
import { WalletComparisonPosition } from '../modals/types';
import DeleteWalletModal from '../modals/DeleteWalletModal';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';

interface CreateComparisonModalsProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertsUpdated?: () => void;
}

export default function CreateComparisonModals({ isOpen, onClose, onAlertsUpdated }: CreateComparisonModalsProps) {
  const { data } = useSession();
  const session = data as DoDAOSession;
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();
  const fetchAavePositions = useAaveUserPositions();
  const fetchSparkPositions = useSparkUserPositions();
  const fetchMorphoPositions = useMorphoUserPositions();

  // Modal state
  const [currentModal, setCurrentModal] = useState<'generalComparison' | 'personalizedPositions' | 'configurePosition' | 'addWallet' | 'deleteWallet'>(
    'personalizedPositions'
  );
  const [walletAddresses, setWalletAddresses] = useState<string[]>([]);
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>('');
  const [walletHasPositions, setWalletHasPositions] = useState<boolean>(true);

  // Delete wallet state
  const [walletToDelete, setWalletToDelete] = useState<string | null>(null);

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

  const [allComparisonPositions, setAllComparisonPositions] = useState<WalletComparisonPosition[]>([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Filtered positions based on current wallet address and existing alerts
  const [filteredComparisonPositions, setFilteredComparisonPositions] = useState<WalletComparisonPosition[]>([]);

  // Selected position state
  const [selectedPosition, setSelectedPosition] = useState<WalletComparisonPosition | null>(null);
  const [positionChannels, setPositionChannels] = useState<{ [positionId: string]: Channel[] }>({});

  // Validation errors
  const [errors, setErrors] = useState<{
    platforms?: string;
    chains?: string;
    markets?: string;
    thresholds?: string[];
    channels?: string[];
    [positionId: string]: any;
  }>({});

  // Set initial modal state based on wallet addresses
  useEffect(() => {
    if (isOpen && walletData) {
      const userWallets = walletData.walletAddresses || [];

      setWalletAddresses(userWallets);
      setCurrentWalletAddress(userWallets[0]);
      setCurrentModal('personalizedPositions');
    }
  }, [isOpen, walletData]);

  useEffect(() => {
    if (walletAddresses.length === 0 || allComparisonPositions.length > 0) {
      return;
    }

    setComparisonLoading(true);
    setAllComparisonPositions([]);

    (async () => {
      try {
        // fetch both protocols in parallel
        const [aave, spark, morpho] = await Promise.all([
          fetchAavePositions(walletAddresses),
          fetchSparkPositions(walletAddresses),
          fetchMorphoPositions(walletAddresses),
        ]);

        // merge into one array
        const positions = [...aave, ...spark, ...morpho];
        console.log('All Comparison positions: ', positions);
        setAllComparisonPositions(positions);
      } catch (err) {
        console.error('Error fetching comparison positions', err);
      } finally {
        setComparisonLoading(false);
      }
    })();
  }, [walletAddresses]);

  // Filter positions based on current wallet address
  useEffect(() => {
    if (!currentWalletAddress) {
      setFilteredComparisonPositions([]);
      return;
    }

    // Get positions for the current wallet
    const walletPositions = allComparisonPositions.filter((pos) => pos.walletAddress === currentWalletAddress);

    if (walletPositions.length === 0) {
      setWalletHasPositions(false);
      setFilteredComparisonPositions([]);
      return;
    }

    setWalletHasPositions(true);
    setFilteredComparisonPositions(walletPositions);
  }, [currentWalletAddress, allComparisonPositions]);

  // Initialize email field with username when component mounts
  useEffect(() => {
    if (session?.username) {
      setChannels((ch) => ch.map((channel) => (channel.channelType === 'EMAIL' ? { ...channel, email: session.username } : channel)));

      // Initialize channels for positions
      const updatedChannels = { ...positionChannels };
      allComparisonPositions.forEach((position) => {
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
  }, [session?.username, allComparisonPositions]);

  // Handle close and reset
  const handleClose = () => {
    setCurrentModal('personalizedPositions');
    setSelectedPosition(null);
    onClose();
  };

  const handleWalletAdded = async (newWalletAddress: string) => {
    setWalletAddresses((prev) => [...prev, newWalletAddress]);
    setCurrentWalletAddress(newWalletAddress);
    setCurrentModal('personalizedPositions');

    setWalletHasPositions(false);

    try {
      const [aave, spark, morpho] = await Promise.all([
        fetchAavePositions(walletAddresses),
        fetchSparkPositions(walletAddresses),
        fetchMorphoPositions(walletAddresses),
      ]);

      // merge into one array
      setAllComparisonPositions([...aave, ...spark, ...morpho]);

      setWalletHasPositions((prevHas) => prevHas || allComparisonPositions.length > 0);
    } catch (err) {
      console.error('Error fetching user positions', err);
      showNotification({
        type: 'error',
        heading: 'Fetch Error',
        message: 'Could not load positions for that wallet.',
      });
    } finally {
      setComparisonLoading(false);
    }
  };

  // Position functions
  const selectPosition = (position: WalletComparisonPosition) => {
    setSelectedPosition(position);
    setCurrentModal('configurePosition');
  };

  const updatePosition = (positionId: string, updates: Partial<WalletComparisonPosition>) => {
    if (selectedPosition && selectedPosition.id === positionId) {
      setSelectedPosition({ ...selectedPosition, ...updates } as WalletComparisonPosition);
    }
  };

  // Handle wallet deletion
  const handleDeleteWallet = (walletAddress: string) => {
    setWalletToDelete(walletAddress);
    setCurrentModal('deleteWallet');
  };

  const handleDeleteWalletClose = () => {
    setWalletToDelete(null);
    setCurrentModal('personalizedPositions');
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
        setCurrentModal('personalizedPositions');
      }
    }
  };

  return (
    <>
      <AddWalletModal
        isOpen={isOpen && currentModal === 'addWallet'}
        handleClose={handleClose}
        onWalletAdded={handleWalletAdded}
        onSwitchToPositions={() => setCurrentModal('personalizedPositions')}
      />

      <MonitorMarketsModal
        isOpen={isOpen && currentModal === 'generalComparison'}
        modalType="COMPARISON"
        handleClose={handleClose}
        channels={channels}
        setChannels={setChannels}
        errors={errors}
        setErrors={setErrors}
        onSwitchModal={() => setCurrentModal('personalizedPositions')}
      />

      <PositionsModal<WalletComparisonPosition>
        isOpen={isOpen && currentModal === 'personalizedPositions'}
        modalType="COMPARISON"
        handleClose={handleClose}
        walletAddresses={walletAddresses}
        walletHasPositions={walletHasPositions}
        filteredPositions={filteredComparisonPositions}
        walletPositionsLoading={comparisonLoading}
        currentWalletAddress={currentWalletAddress}
        setCurrentWalletAddress={setCurrentWalletAddress}
        selectPosition={selectPosition}
        onSwitchToAddWallet={() => setCurrentModal('addWallet')}
        onSwitchToMonitor={() => setCurrentModal('generalComparison')}
        onDeleteWallet={handleDeleteWallet}
        alerts={alertsData}
      />

      <ConfigurePositionModal<WalletComparisonPosition>
        isOpen={isOpen && currentModal === 'configurePosition'}
        modalType="COMPARISON"
        selectedPosition={selectedPosition}
        handleClose={handleClose}
        updatePosition={updatePosition}
        positionChannels={positionChannels}
        setPositionChannels={setPositionChannels}
        errors={errors}
        setErrors={setErrors}
        onSwitchToPositions={() => setCurrentModal('personalizedPositions')}
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
