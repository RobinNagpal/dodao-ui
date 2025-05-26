'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertCircle, Info, X } from 'lucide-react';
import { AlertTypeCard, MarketSelectionCard, ConditionSettingsCard, DeliveryChannelsCard, NotificationFrequencySection } from '@/components/alerts';
import { type Channel, type ConditionType, type NotificationFrequency, type SeverityLevel, severityOptions } from '@/types/alerts';
import { type PersonalizedPosition } from '@/components/alerts/PersonalizedPositionCard';
import {
  AlertCategory,
  AlertActionType,
  NotificationFrequency as PrismaNotificationFrequency,
  ConditionType as PrismaConditionType,
  SeverityLevel as PrismaSeverityLevel,
  DeliveryChannelType,
} from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { utils } from 'ethers';

interface CreateAlertModalsProps {
  isOpen: boolean;
  onClose: () => void;
}

// Extended PersonalizedPosition type to include wallet address
interface WalletPosition extends PersonalizedPosition {
  walletAddress: string;
}

// Get contextual message for condition type
const getConditionMessage = (conditionType: ConditionType) => {
  switch (conditionType) {
    case 'APR_RISE_ABOVE':
      return 'Alert when APR exceeds your threshold (e.g., alert when APR goes above 5%)';
    case 'APR_FALLS_BELOW':
      return 'Alert when APR drops under your threshold (e.g., alert when APR goes below 2%)';
    case 'APR_OUTSIDE_RANGE':
      return 'Alert when APR moves outside your specified range (e.g., alert when APR is below 3% or above 6%)';
    default:
      return 'Select a condition type to see its description';
  }
};

export default function CreateAlertModals({ isOpen, onClose }: CreateAlertModalsProps) {
  const { data } = useSession();
  const session = data as DoDAOSession;
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  // Modal state
  const [currentModal, setCurrentModal] = useState<'initial' | 'monitorMarkets' | 'positions' | 'configurePosition' | 'addWallet'>('initial');
  const [newWalletAddress, setNewWalletAddress] = useState<string>('');
  const [walletAddresses, setWalletAddresses] = useState<string[]>([]);
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>('');
  const [walletHasPositions, setWalletHasPositions] = useState<boolean>(true);

  // Monitor markets state
  const [alertType, setAlertType] = useState<'borrow' | 'supply'>('borrow');
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('ONCE_PER_ALERT');
  const [conditions, setConditions] = useState<any[]>([{ conditionType: 'APR_RISE_ABOVE', thresholdValue: '', severity: 'NONE' }]);
  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: '' }]);

  // Fetch existing alerts
  const {
    data: alertsData,
    loading: alertsLoading,
    error: alertsError,
  } = useFetchData<any[]>(`${baseUrl}/api/alerts`, { skipInitialFetch: !session?.userId }, 'Failed to load alerts');

  // Fetch user's wallet addresses
  const {
    data: walletData,
    loading: loadingWallets,
    error: walletError,
  } = useFetchData<{ walletAddresses: string[] }>(
    `${baseUrl}/api/user/wallet/get`,
    { skipInitialFetch: !isOpen || !session?.userId },
    'Failed to load wallet addresses'
  );

  // All hardcoded positions with wallet addresses
  const [allPositions, setAllPositions] = useState<WalletPosition[]>([
    // Wallet 1 positions - 0x1234...
    {
      id: 'supply-1',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'Polygon',
      market: 'USDT',
      rate: '7.8%',
      actionType: 'SUPPLY',
      notificationFrequency: 'ONCE_PER_ALERT',
      conditions: [
        {
          id: 'condition-1',
          conditionType: 'APR_RISE_ABOVE',
          severity: 'NONE',
          thresholdValue: '',
        },
      ],
    },
    {
      id: 'supply-2',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'Polygon',
      market: 'USDC.e',
      rate: '6.2%',
      actionType: 'SUPPLY',
      notificationFrequency: 'ONCE_PER_ALERT',
      conditions: [
        {
          id: 'condition-2',
          conditionType: 'APR_FALLS_BELOW',
          severity: 'NONE',
          thresholdValue: '',
        },
      ],
    },
    {
      id: 'borrow-1',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'Base',
      market: 'ETH',
      rate: '3.8%',
      actionType: 'BORROW',
      notificationFrequency: 'ONCE_PER_ALERT',
      conditions: [
        {
          id: 'condition-3',
          conditionType: 'APR_FALLS_BELOW',
          severity: 'NONE',
          thresholdValue: '',
        },
      ],
    },
    // Wallet 2 positions - 0x5678...
    {
      id: 'supply-3',
      walletAddress: '0x5678901234abcdef5678901234abcdef56789012',
      chain: 'Ethereum',
      market: 'ETH',
      rate: '5.2%',
      actionType: 'SUPPLY',
      notificationFrequency: 'ONCE_PER_ALERT',
      conditions: [
        {
          id: 'condition-4',
          conditionType: 'APR_RISE_ABOVE',
          severity: 'NONE',
          thresholdValue: '',
        },
      ],
    },
    {
      id: 'borrow-2',
      walletAddress: '0x5678901234abcdef5678901234abcdef56789012',
      chain: 'Ethereum',
      market: 'USDC',
      rate: '4.1%',
      actionType: 'BORROW',
      notificationFrequency: 'ONCE_PER_ALERT',
      conditions: [
        {
          id: 'condition-5',
          conditionType: 'APR_FALLS_BELOW',
          severity: 'NONE',
          thresholdValue: '',
        },
      ],
    },
  ]);

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

  // Post data for adding a wallet address
  const { postData: postWalletAddress, loading: addingWallet } = usePostData<any, { walletAddress: string }>({
    successMessage: 'Wallet address added successfully',
    errorMessage: 'Failed to add wallet address',
    redirectPath: undefined,
  });

  // Post data hooks
  const { postData: postMarketAlert, loading: creatingMarketAlert } = usePostData<any, any>({
    successMessage: 'Market alert created successfully',
    errorMessage: 'Failed to create market alert',
    redirectPath: '/alerts',
  });

  const { postData: postPositionAlert, loading: creatingPositionAlert } = usePostData<any, any>({
    successMessage: 'Personalized alert created successfully',
    errorMessage: 'Failed to create personalized alert',
    redirectPath: '/alerts',
  });

  // Format a wallet address for display
  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Set initial modal state based on wallet addresses
  useEffect(() => {
    if (isOpen && walletData) {
      const userWallets = walletData.walletAddresses || [];

      setWalletAddresses(userWallets);
      setCurrentWalletAddress(userWallets[0]);
      setCurrentModal('positions');
    }
  }, [isOpen, walletData]);

  // Filter positions based on current wallet address and existing alerts
  useEffect(() => {
    if (!currentWalletAddress || !alertsData) {
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

    // Filter out positions that already have alerts
    const existingAlerts = Array.isArray(alertsData) ? alertsData : [];
    const positionsWithoutAlerts = walletPositions.filter((position) => {
      // Check if there's already an alert for this position
      const normalizedMarket = position.market === 'ETH' ? 'WETH' : position.market;
      return !existingAlerts.some(
        (alert) =>
          alert.walletAddress === position.walletAddress &&
          alert.selectedChains?.some((chain: any) => chain.name === position.chain) &&
          alert.selectedAssets?.some((asset: any) => asset.symbol === normalizedMarket) &&
          alert.actionType === position.actionType
      );
    });

    setFilteredPositions(positionsWithoutAlerts);
  }, [currentWalletAddress, alertsData, allPositions]);

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
    setCurrentModal('initial');
    setNewWalletAddress('');
    setSelectedPosition(null);
    onClose();
  };

  // Handle adding a new wallet address
  const handleAddWallet = async () => {
    if (!utils.isAddress(newWalletAddress.trim())) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please enter a wallet address',
      });
      return;
    }

    const success = await postWalletAddress(`${baseUrl}/api/user/wallet`, { walletAddress: newWalletAddress });

    if (success) {
      // Update local state
      setWalletAddresses((prev) => [...prev, newWalletAddress]);
      setCurrentWalletAddress(newWalletAddress);
      setCurrentModal('positions');
      setNewWalletAddress('');

      setWalletHasPositions(false);
    }
  };

  // Switch to add wallet modal
  const handleSwitchToAddWallet = () => {
    setNewWalletAddress('');
    setCurrentModal('addWallet');
  };

  // Switch to a different wallet
  const handleSwitchWallet = (walletAddress: string) => {
    setCurrentWalletAddress(walletAddress);
    setCurrentModal('positions');
  };

  // Market monitoring functions
  const toggleChain = (chain: string) => setSelectedChains((cs) => (cs.includes(chain) ? cs.filter((c) => c !== chain) : [...cs, chain]));
  const toggleMarket = (market: string) => setSelectedMarkets((ms) => (ms.includes(market) ? ms.filter((m) => m !== market) : [...ms, market]));
  const updateCondition = (i: number, field: keyof any, val: string) => setConditions((cs) => cs.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));
  const addCondition = () => setConditions((cs) => [...cs, { conditionType: 'APR_RISE_ABOVE', severity: 'NONE' }]);
  const removeCondition = (i: number) => setConditions((cs) => cs.filter((_, idx) => idx !== i));
  const addChannel = () => setChannels((ch) => [...ch, { channelType: 'EMAIL', email: session?.username || '' }]);
  const updateChannel = (i: number, field: keyof Channel, val: string) => setChannels((ch) => ch.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));
  const removeChannel = (i: number) => setChannels((ch) => ch.filter((_, idx) => idx !== i));

  // Position functions
  const selectPosition = (position: WalletPosition) => {
    setSelectedPosition(position);
    setCurrentModal('configurePosition');
  };

  const updatePosition = (positionId: string, updates: Partial<PersonalizedPosition>) => {
    if (selectedPosition && selectedPosition.id === positionId) {
      setSelectedPosition({ ...selectedPosition, ...updates } as WalletPosition);
    }
  };

  // Position channel functions
  const addPositionChannel = () => {
    if (!selectedPosition) return;

    setPositionChannels((prev) => ({
      ...prev,
      [selectedPosition.id]: [...(prev[selectedPosition.id] || []), { channelType: 'EMAIL', email: session?.username || '' }],
    }));
  };

  const updatePositionChannel = (idx: number, field: keyof Channel, val: string) => {
    if (!selectedPosition) return;

    setPositionChannels((prev) => ({
      ...prev,
      [selectedPosition.id]: (prev[selectedPosition.id] || []).map((ch, i) => (i === idx ? { ...ch, [field]: val } : ch)),
    }));
  };

  const removePositionChannel = (idx: number) => {
    if (!selectedPosition) return;

    setPositionChannels((prev) => ({
      ...prev,
      [selectedPosition.id]: (prev[selectedPosition.id] || []).filter((_, i) => i !== idx),
    }));
  };

  // Position alert validation and submission
  const validatePositionAlert = () => {
    if (!selectedPosition) return false;

    const positionErrors: {
      conditions?: string[];
      channels?: string[];
    } = {};

    // Validate conditions
    const conditionErrors: string[] = [];
    selectedPosition.conditions.forEach((condition, index) => {
      if (condition.conditionType === 'APR_OUTSIDE_RANGE') {
        if (!condition.thresholdLow || !condition.thresholdHigh) {
          conditionErrors[index] = 'Both min and max thresholds are required';
        } else if (isNaN(Number(condition.thresholdLow)) || isNaN(Number(condition.thresholdHigh))) {
          conditionErrors[index] = 'Min and max thresholds must be valid numbers';
        }
      } else {
        if (!condition.thresholdValue) {
          conditionErrors[index] = 'Threshold value is required';
        } else if (isNaN(Number(condition.thresholdValue))) {
          conditionErrors[index] = 'Threshold value must be a valid number';
        }
      }
    });

    if (conditionErrors.some((error) => error)) {
      positionErrors.conditions = conditionErrors;
    }

    // Validate channels
    const channels = positionChannels[selectedPosition.id] || [];
    const channelErrors: string[] = [];
    channels.forEach((channel, index) => {
      if (channel.channelType === 'EMAIL') {
        if (!channel.email) {
          channelErrors[index] = 'Email address is required';
        } else {
          const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRx.test(channel.email)) {
            channelErrors[index] = 'Invalid email address';
          }
        }
      } else if (channel.channelType === 'WEBHOOK') {
        if (!channel.webhookUrl) {
          channelErrors[index] = 'Webhook URL is required';
        } else {
          try {
            new URL(channel.webhookUrl);
          } catch {
            channelErrors[index] = 'Invalid webhook URL';
          }
        }
      }
    });

    if (channelErrors.some((error) => error)) {
      positionErrors.channels = channelErrors;
    }

    setErrors((prev) => ({
      ...prev,
      [selectedPosition.id]: positionErrors,
    }));

    return Object.keys(positionErrors).length === 0;
  };

  const handleCreatePositionAlert = async () => {
    if (!selectedPosition || !validatePositionAlert()) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors before submitting',
      });
      return;
    }

    // Prepare the payload
    const payload = {
      walletAddress: selectedPosition.walletAddress,
      category: 'PERSONALIZED',
      actionType: selectedPosition.actionType,
      selectedChains: [selectedPosition.chain],
      selectedMarkets: [selectedPosition.market],
      compareProtocols: [],
      notificationFrequency: selectedPosition.notificationFrequency,
      conditions: selectedPosition.conditions.map((condition) =>
        condition.conditionType === 'APR_OUTSIDE_RANGE'
          ? {
              type: condition.conditionType,
              min: condition.thresholdLow,
              max: condition.thresholdHigh,
              severity: condition.severity,
            }
          : {
              type: condition.conditionType,
              value: condition.thresholdValue,
              severity: condition.severity,
            }
      ),
      deliveryChannels: (positionChannels[selectedPosition.id] || []).map((c) => ({
        type: c.channelType,
        email: c.channelType === 'EMAIL' ? c.email : undefined,
        webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
      })),
    };

    const success = await postPositionAlert(`${baseUrl}/api/alerts/create/personalized-market`, payload);

    if (success) {
      handleClose();
    }
  };

  // Validation and submission for market alerts
  const validateMarketAlert = () => {
    const newErrors: {
      chains?: string;
      markets?: string;
      conditions?: string[];
      channels?: string[];
    } = {};

    // Validate chains
    if (selectedChains.length === 0) {
      newErrors.chains = 'Please select at least one chain';
    }

    // Validate markets
    if (selectedMarkets.length === 0) {
      newErrors.markets = 'Please select at least one market';
    }

    // Validate conditions
    const conditionErrors: string[] = [];
    conditions.forEach((cond, index) => {
      if (cond.conditionType === 'APR_OUTSIDE_RANGE') {
        if (!cond.thresholdLow || !cond.thresholdHigh) {
          conditionErrors[index] = 'Both min and max thresholds are required';
        } else if (isNaN(Number(cond.thresholdLow)) || isNaN(Number(cond.thresholdHigh))) {
          conditionErrors[index] = 'Min and max thresholds must be valid numbers';
        }
      } else {
        if (!cond.thresholdValue) {
          conditionErrors[index] = 'Threshold value is required';
        } else if (isNaN(Number(cond.thresholdValue))) {
          conditionErrors[index] = 'Threshold value must be a valid number';
        }
      }
    });

    if (conditionErrors.some((error) => error)) {
      newErrors.conditions = conditionErrors;
    }

    // Validate channels
    const channelErrors: string[] = [];
    channels.forEach((channel, index) => {
      if (channel.channelType === 'EMAIL') {
        if (!channel.email) {
          channelErrors[index] = 'Email address is required';
        } else {
          const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRx.test(channel.email)) {
            channelErrors[index] = 'Invalid email address';
          }
        }
      } else if (channel.channelType === 'WEBHOOK') {
        if (!channel.webhookUrl) {
          channelErrors[index] = 'Webhook URL is required';
        } else {
          try {
            new URL(channel.webhookUrl);
          } catch {
            channelErrors[index] = 'Invalid webhook URL';
          }
        }
      }
    });

    if (channelErrors.some((error) => error)) {
      newErrors.channels = channelErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateMarketAlert = async () => {
    if (!validateMarketAlert()) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors before submitting',
      });
      return;
    }

    // Prepare the payload
    const payload = {
      actionType: alertType.toUpperCase(),
      selectedChains,
      selectedMarkets,
      notificationFrequency,
      conditions: conditions.map((c) => ({
        type: c.conditionType,
        value: c.thresholdValue,
        min: c.thresholdLow,
        max: c.thresholdHigh,
        severity: c.severity,
      })),
      deliveryChannels: channels.map((c) => ({
        type: c.channelType,
        email: c.channelType === 'EMAIL' ? c.email : undefined,
        webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
      })),
    };

    const success = await postMarketAlert(`${baseUrl}/api/alerts/create/compound-market`, payload);

    if (success) {
      handleClose();
    }
  };

  // Render the appropriate modal based on current state
  return (
    <>
      {/* Initial Modal - No Wallet Addresses */}
      <Dialog open={isOpen && currentModal === 'initial'} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-theme-bg-secondary border border-primary-color">
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
            </div>

            <div className="p-4 border border-primary-color rounded-lg">
              <p className="text-theme-primary mb-4">I want to monitor various chains and markets to be alerted about the opportunities</p>

              <Button
                onClick={() => setCurrentModal('monitorMarkets')}
                className="bg-transparent border border-primary-color text-primary-color hover:bg-primary-color hover:text-primary-text"
              >
                Monitor Markets
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Wallet Modal */}
      <Dialog open={isOpen && currentModal === 'addWallet'} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-theme-bg-secondary border border-primary-color">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-theme-primary">Add Wallet Address</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-theme-primary mb-4">Enter a wallet address to monitor positions from this wallet</p>

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
          </div>

          <DialogFooter>
            <Button onClick={() => setCurrentModal('positions')} className="border hover-border-primary">
              Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Monitor Markets Modal */}
      <Dialog open={isOpen && currentModal === 'monitorMarkets'} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-theme-bg-secondary border border-primary-color">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-theme-primary">Create Market Alert</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <AlertTypeCard alertType={alertType} setAlertType={setAlertType} />

            <MarketSelectionCard
              selectedChains={selectedChains}
              toggleChain={toggleChain}
              selectedMarkets={selectedMarkets}
              toggleMarket={toggleMarket}
              errors={errors}
              showPlatforms={false}
            />

            <ConditionSettingsCard
              conditions={conditions}
              addCondition={addCondition}
              updateCondition={updateCondition}
              removeCondition={removeCondition}
              notificationFrequency={notificationFrequency}
              setNotificationFrequency={setNotificationFrequency}
              errors={errors}
            />

            <DeliveryChannelsCard
              channels={channels}
              addChannel={addChannel}
              updateChannel={updateChannel}
              removeChannel={removeChannel}
              errors={errors}
              session={session}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={() => (walletAddresses.length > 0 ? setCurrentModal('positions') : setCurrentModal('initial'))}
              className="border hover-border-primary mr-2"
            >
              Back
            </Button>
            <Button className="border text-primary-color hover-border-body" onClick={handleCreateMarketAlert} disabled={creatingMarketAlert}>
              {creatingMarketAlert ? 'Creating...' : 'Create Alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Positions Modal */}
      <Dialog open={isOpen && currentModal === 'positions'} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-theme-bg-secondary border border-primary-color">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-theme-primary">Select Position to Monitor</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <h2 className="text-xl font-semibold mb-2 text-primary-color">
              {walletAddresses.length === 1 ? 'One Wallet Address Exists' : `${walletAddresses.length} Wallet Addresses Exist`}
            </h2>
            <p className="text-theme-primary mb-4">
              I want to monitor only my positions i.e. know when borrow or supply rates change corresponding to my open positions
            </p>

            <div className="mb-4 flex justify-end">
              <Button onClick={handleSwitchToAddWallet} className="bg-primary-color text-primary-text">
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
                      onClick={() => handleSwitchWallet(wallet)}
                      className={wallet === currentWalletAddress ? 'bg-primary-color text-primary-text' : 'text-theme-primary'}
                    >
                      {formatWalletAddress(wallet)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center p-2 border-b border-primary-color">
                <span className="text-theme-primary">Wallet address - {formatWalletAddress(currentWalletAddress)}</span>
              </div>

              {!walletHasPositions ? (
                <div className="p-6 text-center">
                  <p className="text-theme-muted">No active positions found for this wallet address</p>
                </div>
              ) : filteredPositions.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-theme-muted">All positions for this wallet already have alerts configured</p>
                </div>
              ) : (
                <>
                  {/* Supply Positions */}
                  {filteredPositions.filter((p) => p.actionType === 'SUPPLY').length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2 text-theme-primary">Supply Positions</h3>
                      {filteredPositions
                        .filter((p) => p.actionType === 'SUPPLY')
                        .map((position) => (
                          <div
                            key={position.id}
                            className="flex items-center justify-between p-3 border-b border-primary-color cursor-pointer hover:bg-theme-bg-muted"
                            onClick={() => selectPosition(position)}
                          >
                            <div>
                              <span className="text-theme-primary">Positions {position.id.split('-')[1]}</span>
                              <div className="text-sm text-theme-muted">
                                {position.market} on {position.chain} - Current APR: {position.rate}
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
                              Add
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Borrow Positions */}
                  {filteredPositions.filter((p) => p.actionType === 'BORROW').length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-theme-primary">Borrow Positions</h3>
                      {filteredPositions
                        .filter((p) => p.actionType === 'BORROW')
                        .map((position) => (
                          <div
                            key={position.id}
                            className="flex items-center justify-between p-3 border-b border-primary-color cursor-pointer hover:bg-theme-bg-muted"
                            onClick={() => selectPosition(position)}
                          >
                            <div>
                              <span className="text-theme-primary">Positions {position.id.split('-')[1]}</span>
                              <div className="text-sm text-theme-muted">
                                {position.market} on {position.chain} - Current APR: {position.rate}
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
                              Add
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-primary-color">
            <p className="text-theme-primary mb-4">I want to monitor various chains and markets to be alerted about the opportunities</p>

            <Button
              onClick={() => setCurrentModal('monitorMarkets')}
              className="bg-transparent border border-primary-color text-primary-color hover:bg-primary-color hover:text-primary-text"
            >
              Monitor Markets
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure Position Modal */}
      <Dialog open={isOpen && currentModal === 'configurePosition' && !!selectedPosition} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-theme-bg-secondary border border-primary-color">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-theme-primary">
              Configure Alert for {selectedPosition?.market} on {selectedPosition?.chain}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {selectedPosition && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-primary-color border-primary-color">
                    {selectedPosition.actionType}
                  </Badge>
                  <div>
                    <span className="text-theme-primary">Current APR: {selectedPosition.rate}</span>
                  </div>
                </div>

                <div className="border-t border-theme-primary pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-theme-primary">Condition Settings</h4>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!selectedPosition) return;
                        const newCondition = {
                          id: `condition-${Date.now()}`,
                          conditionType: 'APR_RISE_ABOVE' as ConditionType,
                          severity: 'NONE' as SeverityLevel,
                          thresholdValue: '',
                        };
                        updatePosition(selectedPosition.id, {
                          conditions: [...selectedPosition.conditions, newCondition],
                        });
                      }}
                      className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary"
                    >
                      <Plus size={16} className="mr-1" /> Add Condition
                    </Button>
                  </div>

                  <p className="text-sm text-theme-muted mb-4">
                    Define when you want to be alerted about changes to this position. You will receive an alert if <strong>any</strong> of the following
                    conditions are met.
                  </p>

                  {/* Render each condition */}
                  {selectedPosition.conditions.map((condition, index) => (
                    <div key={condition.id} className="mb-6">
                      <div className="border-t border-primary-color pt-4">
                        {/* Contextual Message */}
                        <div className="mb-4 p-3 bg-theme-secondary rounded-lg border border-theme-primary">
                          <p className="text-sm text-theme-muted">
                            <span className="text-primary-color font-medium">Condition {index + 1}:</span> {getConditionMessage(condition.conditionType)}
                          </p>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-1 flex items-center text-theme-muted">
                            <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-primary-color">
                              {index + 1}
                            </Badge>
                          </div>

                          {/* Type */}
                          <div className="col-span-3">
                            <Select
                              value={condition.conditionType}
                              onValueChange={(value) =>
                                updatePosition(selectedPosition.id, {
                                  conditions: selectedPosition.conditions.map((c, i) => (i === index ? { ...c, conditionType: value as ConditionType } : c)),
                                })
                              }
                            >
                              <SelectTrigger className="w-full hover-border-primary">
                                <SelectValue placeholder="Select condition type" />
                              </SelectTrigger>
                              <SelectContent className="bg-block">
                                <div className="hover-border-primary hover-text-primary">
                                  <SelectItem value="APR_RISE_ABOVE" className="hover:text-primary-color">
                                    APR rises above threshold
                                  </SelectItem>
                                </div>
                                <div className="hover-border-primary hover-text-primary">
                                  <SelectItem value="APR_FALLS_BELOW">APR falls below threshold</SelectItem>
                                </div>
                                <div className="hover-border-primary hover-text-primary">
                                  <SelectItem value="APR_OUTSIDE_RANGE">APR is outside a range</SelectItem>
                                </div>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Thresholds */}
                          {condition.conditionType === 'APR_OUTSIDE_RANGE' ? (
                            <div className="col-span-4 flex flex-col">
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="text"
                                  placeholder="Min (e.g., 3)"
                                  value={condition.thresholdLow || ''}
                                  onChange={(e) =>
                                    updatePosition(selectedPosition.id, {
                                      conditions: selectedPosition.conditions.map((c, i) => (i === index ? { ...c, thresholdLow: e.target.value } : c)),
                                    })
                                  }
                                  className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                                    errors[selectedPosition.id]?.conditions && errors[selectedPosition.id].conditions[index] ? 'border-red-500' : ''
                                  }`}
                                />
                                <Input
                                  type="text"
                                  placeholder="Max (e.g., 6)"
                                  value={condition.thresholdHigh || ''}
                                  onChange={(e) =>
                                    updatePosition(selectedPosition.id, {
                                      conditions: selectedPosition.conditions.map((c, i) => (i === index ? { ...c, thresholdHigh: e.target.value } : c)),
                                    })
                                  }
                                  className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                                    errors[selectedPosition.id]?.conditions && errors[selectedPosition.id].conditions[index] ? 'border-red-500' : ''
                                  }`}
                                />
                                <span className="text-theme-muted whitespace-nowrap flex-shrink-0">APR</span>
                              </div>
                              {errors[selectedPosition.id]?.conditions && errors[selectedPosition.id].conditions[index] && (
                                <div className="mt-1 flex items-center text-red-500 text-sm">
                                  <AlertCircle size={14} className="mr-1" />
                                  <span>{errors[selectedPosition.id].conditions[index]}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="col-span-4 flex flex-col">
                              <div className="flex items-center">
                                <Input
                                  type="text"
                                  placeholder={
                                    condition.conditionType === 'APR_RISE_ABOVE'
                                      ? 'Threshold (e.g., 5.0)'
                                      : condition.conditionType === 'APR_FALLS_BELOW'
                                      ? 'Threshold (e.g., 2.0)'
                                      : 'Threshold value'
                                  }
                                  value={condition.thresholdValue || ''}
                                  onChange={(e) =>
                                    updatePosition(selectedPosition.id, {
                                      conditions: selectedPosition.conditions.map((c, i) => (i === index ? { ...c, thresholdValue: e.target.value } : c)),
                                    })
                                  }
                                  className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                                    errors[selectedPosition.id]?.conditions && errors[selectedPosition.id].conditions[index] ? 'border-red-500' : ''
                                  }`}
                                />
                                <span className="ml-2 text-theme-muted whitespace-nowrap flex-shrink-0">APR</span>
                              </div>
                              {errors[selectedPosition.id]?.conditions && errors[selectedPosition.id].conditions[index] && (
                                <div className="mt-1 flex items-center text-red-500 text-sm">
                                  <AlertCircle size={14} className="mr-1" />
                                  <span>{errors[selectedPosition.id].conditions[index]}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Severity */}
                          <div className="col-span-3 flex items-center">
                            <Select
                              value={condition.severity === 'NONE' ? undefined : condition.severity}
                              onValueChange={(value) =>
                                updatePosition(selectedPosition.id, {
                                  conditions: selectedPosition.conditions.map((c, i) => (i === index ? { ...c, severity: value as SeverityLevel } : c)),
                                })
                              }
                            >
                              <SelectTrigger className="w-full hover-border-primary">
                                <SelectValue placeholder="Severity Level" />
                              </SelectTrigger>
                              <SelectContent className="bg-block">
                                {severityOptions.map((opt) => (
                                  <div key={opt.value} className="hover-border-primary hover-text-primary">
                                    <SelectItem value={opt.value}>{opt.label}</SelectItem>
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" className="h-8 w-8 p-0 ml-1 hover-text-primary">
                                    <Info size={16} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs bg-block p-3 border border-theme-primary">
                                  <p className="text-sm">
                                    Severity level is used for visual indication only. It helps you categorize alerts by importance but does not affect
                                    notification delivery or priority.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          {/* Remove */}
                          {selectedPosition.conditions.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                updatePosition(selectedPosition.id, {
                                  conditions: selectedPosition.conditions.filter((_, i) => i !== index),
                                })
                              }
                              className="col-span-1 text-red-500 h-8 w-8"
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <NotificationFrequencySection
                  notificationFrequency={selectedPosition.notificationFrequency}
                  setNotificationFrequency={(freq) => updatePosition(selectedPosition.id, { notificationFrequency: freq })}
                />

                <div className="mt-8">
                  <DeliveryChannelsCard
                    channels={positionChannels[selectedPosition.id] || []}
                    addChannel={addPositionChannel}
                    updateChannel={updatePositionChannel}
                    removeChannel={removePositionChannel}
                    errors={{ channels: errors[selectedPosition.id]?.channels }}
                    session={session}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setCurrentModal('positions')} className="border hover-border-primary mr-2">
              Back
            </Button>
            <Button className="border text-primary-color hover-border-body" onClick={handleCreatePositionAlert} disabled={creatingPositionAlert}>
              {creatingPositionAlert ? 'Creating...' : 'Create Personalized Alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
