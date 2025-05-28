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
import {
  AlertTypeCard,
  MarketSelectionCard,
  ConditionSettingsCard,
  DeliveryChannelsCard,
  NotificationFrequencySection,
  CompareThresholdCard,
} from '@/components/alerts';
import { type Channel, type ConditionType, type NotificationFrequency, type SeverityLevel, severityOptions, type GeneralComparisonRow } from '@/types/alerts';
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
import { CompareCompoundAlertPayload, CompareCompoundAlertResponse } from '@/app/api/alerts/create/compare-compound/route';
import { PersonalizedComparisonAlertPayload, PersonalizedComparisonAlertResponse } from '@/app/api/alerts/create/personalized-comparison/route';

export interface PersonalizedComparisonPosition {
  id: string;
  walletAddress: string;
  platform: string;
  chain: string;
  market: string;
  rate: string;
  actionType: 'SUPPLY' | 'BORROW';
  notificationFrequency: NotificationFrequency;
  conditions: Array<{
    id: string;
    conditionType: ConditionType;
    severity: SeverityLevel;
    thresholdValue?: string;
  }>;
}

interface CreateComparisonModalsProps {
  isOpen: boolean;
  onClose: () => void;
}

// Extended PersonalizedComparisonPosition type to include wallet address
interface WalletComparisonPosition extends PersonalizedComparisonPosition {
  walletAddress: string;
}

export default function CreateComparisonModals({ isOpen, onClose }: CreateComparisonModalsProps) {
  const { data } = useSession();
  const session = data as DoDAOSession;
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  // Modal state
  const [currentModal, setCurrentModal] = useState<'initial' | 'generalComparison' | 'personalizedPositions' | 'configurePosition' | 'addWallet'>('initial');
  const [newWalletAddress, setNewWalletAddress] = useState<string>('');
  const [walletAddresses, setWalletAddresses] = useState<string[]>([]);
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>('');
  const [walletHasPositions, setWalletHasPositions] = useState<boolean>(true);

  // General comparison state
  const [alertType, setAlertType] = useState<'borrow' | 'supply'>('borrow');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('ONCE_PER_ALERT');
  const [thresholds, setThresholds] = useState<GeneralComparisonRow[]>([
    {
      platform: '',
      chain: '',
      market: '',
      threshold: '',
      severity: 'NONE',
      frequency: 'ONCE_PER_ALERT',
    },
  ]);
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
  } = useFetchData<{ walletAddresses: string[] }>(`${baseUrl}/api/user/wallet/get`, { skipInitialFetch: !isOpen }, 'Failed to load wallet addresses');

  // All hardcoded comparison positions with wallet addresses
  const [allComparisonPositions, setAllComparisonPositions] = useState<WalletComparisonPosition[]>([
    // Wallet 1 positions - 0x1234...
    {
      id: 'compare-supply-1',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      platform: 'Aave',
      chain: 'Ethereum',
      market: 'WETH',
      rate: '4.29%',
      actionType: 'SUPPLY',
      notificationFrequency: 'ONCE_PER_ALERT',
      conditions: [
        {
          id: 'condition-1',
          conditionType: 'RATE_DIFF_ABOVE',
          severity: 'NONE',
          thresholdValue: '',
        },
      ],
    },
    {
      id: 'compare-borrow-1',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      platform: 'Spark',
      chain: 'Ethereum',
      market: 'USDC',
      rate: '2.19%',
      actionType: 'BORROW',
      notificationFrequency: 'ONCE_PER_ALERT',
      conditions: [
        {
          id: 'condition-2',
          conditionType: 'RATE_DIFF_BELOW',
          severity: 'NONE',
          thresholdValue: '',
        },
      ],
    },
    // Wallet 2 positions - 0x5678...
    {
      id: 'compare-supply-2',
      walletAddress: '0x5678901234abcdef5678901234abcdef56789012',
      platform: 'Morpho',
      chain: 'Base',
      market: 'ETH',
      rate: '5.12%',
      actionType: 'SUPPLY',
      notificationFrequency: 'ONCE_PER_ALERT',
      conditions: [
        {
          id: 'condition-3',
          conditionType: 'RATE_DIFF_ABOVE',
          severity: 'NONE',
          thresholdValue: '',
        },
      ],
    },
    {
      id: 'compare-borrow-2',
      walletAddress: '0x5678901234abcdef5678901234abcdef56789012',
      platform: 'Aave',
      chain: 'Polygon',
      market: 'USDT',
      rate: '3.45%',
      actionType: 'BORROW',
      notificationFrequency: 'ONCE_PER_ALERT',
      conditions: [
        {
          id: 'condition-4',
          conditionType: 'RATE_DIFF_BELOW',
          severity: 'NONE',
          thresholdValue: '',
        },
      ],
    },
  ]);

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

  // Post data for adding a wallet address
  const { postData: postWalletAddress, loading: addingWallet } = usePostData<any, { walletAddress: string }>({
    successMessage: 'Wallet address added successfully',
    errorMessage: 'Failed to add wallet address',
    redirectPath: undefined,
  });

  // Post data hooks
  const { postData: postGeneralComparisonAlert, loading: creatingGeneralAlert } = usePostData<CompareCompoundAlertResponse, CompareCompoundAlertPayload>({
    successMessage: 'General comparison alert created successfully',
    errorMessage: 'Failed to create general comparison alert',
    redirectPath: '/alerts/compare-compound',
  });

  const { postData: postPersonalizedComparisonAlert, loading: creatingPersonalizedAlert } = usePostData<
    PersonalizedComparisonAlertResponse,
    PersonalizedComparisonAlertPayload
  >({
    successMessage: 'Personalized comparison alert created successfully',
    errorMessage: 'Failed to create personalized comparison alert',
    redirectPath: '/alerts/compare-compound',
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
      setCurrentModal('personalizedPositions');
    }
  }, [isOpen, walletData]);

  // Filter positions based on current wallet address and existing alerts
  useEffect(() => {
    if (!currentWalletAddress || !alertsData) {
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

    // Filter out positions that already have comparison alerts
    const existingAlerts = Array.isArray(alertsData) ? alertsData : [];
    const positionsWithoutAlerts = walletPositions.filter((position) => {
      // Check if there's already a comparison alert for this position
      const normalizedMarket = position.market === 'ETH' ? 'WETH' : position.market;
      return !existingAlerts.some(
        (alert) =>
          alert.isComparison &&
          alert.walletAddress === position.walletAddress &&
          alert.selectedChains?.some((chain: any) => chain.name === position.chain) &&
          alert.selectedAssets?.some((asset: any) => asset.symbol === normalizedMarket) &&
          alert.actionType === position.actionType &&
          alert.compareProtocols?.includes(position.platform)
      );
    });

    setFilteredComparisonPositions(positionsWithoutAlerts);
  }, [currentWalletAddress, alertsData, allComparisonPositions]);

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
      setCurrentModal('personalizedPositions');
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
    setCurrentModal('personalizedPositions');
  };

  // General comparison functions
  const togglePlatform = (platform: string) => setSelectedPlatforms((ps) => (ps.includes(platform) ? ps.filter((p) => p !== platform) : [...ps, platform]));
  const toggleChain = (chain: string) => setSelectedChains((cs) => (cs.includes(chain) ? cs.filter((c) => c !== chain) : [...cs, chain]));
  const toggleMarket = (market: string) => setSelectedMarkets((ms) => (ms.includes(market) ? ms.filter((m) => m !== market) : [...ms, market]));

  const addThreshold = () =>
    setThresholds((ts) => [...ts, { platform: '', chain: '', market: '', threshold: '', severity: 'NONE', frequency: 'ONCE_PER_ALERT' }]);
  const updateThreshold = (i: number, field: keyof GeneralComparisonRow, val: string) =>
    setThresholds((ts) => ts.map((t, idx) => (idx === i ? { ...t, [field]: val } : t)));
  const removeThreshold = (i: number) => setThresholds((ts) => ts.filter((_, idx) => idx !== i));

  const addChannel = () => setChannels((ch) => [...ch, { channelType: 'EMAIL', email: session?.username || '' }]);
  const updateChannel = (i: number, field: keyof Channel, val: string) => setChannels((ch) => ch.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));
  const removeChannel = (i: number) => setChannels((ch) => ch.filter((_, idx) => idx !== i));

  // Position functions
  const selectPosition = (position: WalletComparisonPosition) => {
    setSelectedPosition(position);
    setCurrentModal('configurePosition');
  };

  const updatePosition = (positionId: string, updates: Partial<PersonalizedComparisonPosition>) => {
    if (selectedPosition && selectedPosition.id === positionId) {
      setSelectedPosition({ ...selectedPosition, ...updates } as WalletComparisonPosition);
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
      if (!condition.thresholdValue) {
        conditionErrors[index] = 'Threshold value is required';
      } else if (isNaN(Number(condition.thresholdValue))) {
        conditionErrors[index] = 'Threshold value must be a valid number';
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

  const handleCreatePersonalizedComparisonAlert = async () => {
    if (!selectedPosition || !validatePositionAlert()) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors before submitting',
      });
      return;
    }

    // Prepare the payload
    const payload: PersonalizedComparisonAlertPayload = {
      walletAddress: selectedPosition.walletAddress,
      category: 'PERSONALIZED' as AlertCategory,
      actionType: selectedPosition.actionType as AlertActionType,
      isComparison: true,
      selectedChains: [selectedPosition.chain],
      selectedMarkets: [selectedPosition.market],
      compareProtocols: [selectedPosition.platform],
      notificationFrequency: selectedPosition.notificationFrequency as NotificationFrequency,
      conditions: selectedPosition.conditions.map((condition) => ({
        type: condition.conditionType as PrismaConditionType,
        value: condition.thresholdValue!,
        severity: condition.severity as SeverityLevel,
      })),
      deliveryChannels: (positionChannels[selectedPosition.id] || []).map((c) => ({
        type: c.channelType as DeliveryChannelType,
        email: c.channelType === 'EMAIL' ? c.email : undefined,
        webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
      })),
    };

    const success = await postPersonalizedComparisonAlert(`${baseUrl}/api/alerts/create/personalized-comparison`, payload);

    if (success) {
      handleClose();
    }
  };

  // Validation and submission for general comparison alerts
  const validateGeneralComparisonAlert = () => {
    const newErrors: {
      platforms?: string;
      chains?: string;
      markets?: string;
      thresholds?: string[];
      channels?: string[];
    } = {};

    // Validate platforms
    if (selectedPlatforms.length === 0) {
      newErrors.platforms = 'Please select at least one platform to compare with';
    }

    // Validate chains
    if (selectedChains.length === 0) {
      newErrors.chains = 'Please select at least one chain';
    }

    // Validate markets
    if (selectedMarkets.length === 0) {
      newErrors.markets = 'Please select at least one market';
    }

    // Validate thresholds
    const thresholdErrors: string[] = [];
    thresholds.forEach((t, index) => {
      if (!t.threshold || isNaN(Number(t.threshold))) {
        thresholdErrors[index] = 'Threshold must be a valid number';
      }
    });

    if (thresholdErrors.some((error) => error)) {
      newErrors.thresholds = thresholdErrors;
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

  const handleCreateGeneralComparisonAlert = async () => {
    if (!validateGeneralComparisonAlert()) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors before submitting',
      });
      return;
    }

    // Prepare the payload
    const payload: CompareCompoundAlertPayload = {
      category: 'GENERAL' as AlertCategory,
      actionType: alertType.toUpperCase() as AlertActionType,
      isComparison: true,
      selectedChains,
      selectedMarkets,
      compareProtocols: selectedPlatforms,
      notificationFrequency,
      conditions: thresholds.map((t) => ({
        type: alertType === 'supply' ? ('RATE_DIFF_ABOVE' as PrismaConditionType) : ('RATE_DIFF_BELOW' as PrismaConditionType),
        value: t.threshold,
        severity: t.severity as PrismaSeverityLevel,
      })),
      deliveryChannels: channels.map((c) => ({
        type: c.channelType as DeliveryChannelType,
        email: c.channelType === 'EMAIL' ? c.email : undefined,
        webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
      })),
    };

    const success = await postGeneralComparisonAlert(`${baseUrl}/api/alerts/create/compare-compound`, payload);

    if (success) {
      handleClose();
    }
  };

  // Get contextual message for condition type
  const getComparisonMessage = (position: WalletComparisonPosition) => {
    if (position.actionType === 'SUPPLY') {
      return `Example: If ${position.platform} offers ${position.rate} APR and you set 1.2% threshold, you'll be alerted when Compound's supply APR reaches ${(
        parseFloat(position.rate.replace('%', '')) + 1.2
      ).toFixed(1)}% (${position.platform} rate + your threshold)`;
    } else {
      return `Example: If ${position.platform} charges ${
        position.rate
      } APR and you set 0.5% threshold, you'll be alerted when Compound's borrow APR drops to ${(parseFloat(position.rate.replace('%', '')) - 0.5).toFixed(
        1
      )}% (${position.platform} rate - your threshold)`;
    }
  };

  // Render the appropriate modal based on current state
  return (
    <>
      {/* Initial Modal - No Wallet Addresses */}
      <Dialog open={isOpen && currentModal === 'initial'} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-theme-bg-secondary border border-primary-color">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-theme-primary">Create Comparison Alert</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <h2 className="text-xl font-semibold mb-4 text-primary-color">No wallet address exists</h2>

            <div className="mb-6 p-4 border border-primary-color rounded-lg">
              <p className="text-theme-primary mb-4">I want to know when compound offers better rates for my positions on other protocols</p>

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
              <p className="text-theme-primary mb-4">I want to monitor various chains and markets to be alerted when Compound outperforms other platforms</p>

              <Button
                onClick={() => setCurrentModal('generalComparison')}
                className="bg-transparent border border-primary-color text-primary-color hover:bg-primary-color hover:text-primary-text"
              >
                Monitor Compound vs Others
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
            <p className="text-theme-primary mb-4">Enter a wallet address to monitor comparison opportunities for positions from this wallet</p>

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
            <Button onClick={() => setCurrentModal('personalizedPositions')} className="border hover-border-primary">
              Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* General Comparison Modal */}
      <Dialog open={isOpen && currentModal === 'generalComparison'} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-theme-bg-secondary border border-primary-color">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-theme-primary">Create General Comparison Alert</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <AlertTypeCard
              alertType={alertType}
              setAlertType={setAlertType}
              supplyLabel="Supply Comparison (Alert when Compound offers higher rates)"
              borrowLabel="Borrow Comparison (Alert when Compound offers lower rates)"
            />

            <MarketSelectionCard
              selectedChains={selectedChains}
              toggleChain={toggleChain}
              selectedMarkets={selectedMarkets}
              toggleMarket={toggleMarket}
              selectedPlatforms={selectedPlatforms}
              togglePlatform={togglePlatform}
              errors={errors}
              showPlatforms={true}
              title="Market Selection"
              description="Select the platforms to compare with and the markets you want to monitor."
            />

            <CompareThresholdCard
              thresholds={thresholds}
              addThreshold={addThreshold}
              updateThreshold={updateThreshold}
              removeThreshold={removeThreshold}
              notificationFrequency={notificationFrequency}
              setNotificationFrequency={setNotificationFrequency}
              errors={errors}
              alertType={alertType}
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
              onClick={() => (walletAddresses.length > 0 ? setCurrentModal('personalizedPositions') : setCurrentModal('initial'))}
              className="border hover-border-primary mr-2"
            >
              Back
            </Button>
            <Button className="border text-primary-color hover-border-body" onClick={handleCreateGeneralComparisonAlert} disabled={creatingGeneralAlert}>
              {creatingGeneralAlert ? 'Creating...' : 'Create Comparison Alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Personalized Positions Modal */}
      <Dialog open={isOpen && currentModal === 'personalizedPositions'} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-theme-bg-secondary border border-primary-color">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-theme-primary">Select Position to Compare</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <h2 className="text-xl font-semibold mb-2 text-primary-color">
              {walletAddresses.length === 1 ? 'One Wallet Address Exists' : `${walletAddresses.length} Wallet Addresses Exist`}
            </h2>
            <p className="text-theme-primary mb-4">I want to know when compound offers better rates for my positions on other protocols</p>

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
                  <p className="text-theme-muted">No active positions found for this wallet address on other platforms</p>
                </div>
              ) : filteredComparisonPositions.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-theme-muted">All comparison positions for this wallet already have alerts configured</p>
                </div>
              ) : (
                <>
                  {/* Supply Positions */}
                  {filteredComparisonPositions.filter((p) => p.actionType === 'SUPPLY').length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2 text-theme-primary">Supply Positions to Compare</h3>
                      {filteredComparisonPositions
                        .filter((p) => p.actionType === 'SUPPLY')
                        .map((position) => (
                          <div
                            key={position.id}
                            className="flex items-center justify-between p-3 border-b border-primary-color cursor-pointer hover:bg-theme-bg-muted"
                            onClick={() => selectPosition(position)}
                          >
                            <div>
                              <span className="text-theme-primary">Position {position.id.split('-')[2]}</span>
                              <div className="text-sm text-theme-muted">
                                {position.market} on {position.chain} vs {position.platform} - Current {position.platform} APR: {position.rate}
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
                  {filteredComparisonPositions.filter((p) => p.actionType === 'BORROW').length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-theme-primary">Borrow Positions to Compare</h3>
                      {filteredComparisonPositions
                        .filter((p) => p.actionType === 'BORROW')
                        .map((position) => (
                          <div
                            key={position.id}
                            className="flex items-center justify-between p-3 border-b border-primary-color cursor-pointer hover:bg-theme-bg-muted"
                            onClick={() => selectPosition(position)}
                          >
                            <div>
                              <span className="text-theme-primary">Position {position.id.split('-')[2]}</span>
                              <div className="text-sm text-theme-muted">
                                {position.market} on {position.chain} vs {position.platform} - Current {position.platform} APR: {position.rate}
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
            <p className="text-theme-primary mb-4">I want to monitor various chains and markets to be alerted when Compound outperforms other platforms</p>

            <Button
              onClick={() => setCurrentModal('generalComparison')}
              className="bg-transparent border border-primary-color text-primary-color hover:bg-primary-color hover:text-primary-text"
            >
              Monitor Compound vs Others
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure Position Modal */}
      <Dialog open={isOpen && currentModal === 'configurePosition' && !!selectedPosition} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-theme-bg-secondary border border-primary-color">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-theme-primary">
              Configure Comparison Alert for {selectedPosition?.market} on {selectedPosition?.chain} vs {selectedPosition?.platform}
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
                    <span className="text-theme-primary">
                      Current {selectedPosition.platform} APR: {selectedPosition.rate}
                    </span>
                  </div>
                </div>

                <div className="border-t border-theme-primary pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-theme-primary">Rate Difference Thresholds</h4>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!selectedPosition) return;
                        const newCondition = {
                          id: `condition-${Date.now()}`,
                          conditionType: selectedPosition.actionType === 'SUPPLY' ? ('RATE_DIFF_ABOVE' as ConditionType) : ('RATE_DIFF_BELOW' as ConditionType),
                          severity: 'NONE' as SeverityLevel,
                          thresholdValue: '',
                        };
                        updatePosition(selectedPosition.id, {
                          conditions: [...selectedPosition.conditions, newCondition],
                        });
                      }}
                      className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary"
                    >
                      <Plus size={16} className="mr-1" /> Add Threshold
                    </Button>
                  </div>

                  <p className="text-sm text-theme-muted mb-4">
                    Set the minimum rate difference required to trigger an alert. You’ll be notified when Compound becomes competitively better by your
                    specified threshold.
                  </p>

                  {/* Contextual Message */}
                  <div className="mb-6 p-3 bg-theme-secondary rounded-lg border border-theme-primary">
                    <p className="text-sm text-theme-muted">
                      <span className="text-primary-color font-medium">How thresholds work:</span> {getComparisonMessage(selectedPosition)}
                    </p>
                  </div>

                  {/* Render each condition */}
                  {selectedPosition.conditions.map((condition, index) => (
                    <div key={condition.id} className="mb-6">
                      <div className="border-t border-primary-color pt-4">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-1 flex items-center text-theme-muted">
                            <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-primary-color">
                              {index + 1}
                            </Badge>
                          </div>

                          {/* Threshold Value */}
                          <div className="col-span-5 flex flex-col">
                            <div className="flex items-center">
                              <Input
                                type="text"
                                placeholder={selectedPosition.actionType === 'SUPPLY' ? 'Threshold (e.g., 1.2)' : 'Threshold (e.g., 0.5)'}
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
                              <span className="ml-2 text-theme-muted whitespace-nowrap flex-shrink-0">APR difference</span>
                            </div>
                            {errors[selectedPosition.id]?.conditions && errors[selectedPosition.id].conditions[index] && (
                              <div className="mt-1 flex items-center text-red-500 text-sm">
                                <AlertCircle size={14} className="mr-1" />
                                <span>{errors[selectedPosition.id].conditions[index]}</span>
                              </div>
                            )}
                          </div>

                          {/* Severity */}
                          <div className="col-span-5 flex items-center">
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
            <Button onClick={() => setCurrentModal('personalizedPositions')} className="border hover-border-primary mr-2">
              Back
            </Button>
            <Button
              className="border text-primary-color hover-border-body"
              onClick={handleCreatePersonalizedComparisonAlert}
              disabled={creatingPersonalizedAlert}
            >
              {creatingPersonalizedAlert ? 'Creating...' : 'Create Comparison Alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
