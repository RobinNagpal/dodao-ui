'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Channel, type NotificationFrequency } from '@/types/alerts';
import PersonalizedComparisonPositionCard, { type PersonalizedComparisonPosition } from '@/components/alerts/PersonalizedComparisonPositionCard';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { PersonalizedComparisonAlertPayload, PersonalizedComparisonAlertResponse } from '@/app/api/alerts/create/personalized-comparison/route';
import { AlertActionType, AlertCategory, ConditionType, DeliveryChannelType, SeverityLevel as PrismaSeverityLevel } from '@prisma/client';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { AlertBreadcrumb, DeliveryChannelsCard } from '@/components/alerts';

export interface CompareCompoundPageProps {
  session: DoDAOSession;
}

export default function CreatePersonalizedCompareAlertPage({ session }: CompareCompoundPageProps) {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const { postData, loading: isSubmitting } = usePostData<PersonalizedComparisonAlertResponse, PersonalizedComparisonAlertPayload>({
    successMessage: "You'll now be notified when Compound compares favorably with other platforms.",
    errorMessage: "Couldn't create personalized comparison alert",
    redirectPath: '/alerts/compare-compound',
  });

  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    if (session?.username) {
      setChannels((ch) => ch.map((channel) => (channel.channelType === 'EMAIL' ? { ...channel, email: session.username } : channel)));
    }
    setWalletAddress(localStorage.getItem('walletAddress') ?? '');
  }, [session?.username]);

  // Initialize positions with hardcoded data
  const [positions, setPositions] = useState<PersonalizedComparisonPosition[]>([
    {
      id: 'supply-1',
      platform: 'Aave',
      chain: 'Ethereum',
      market: 'wstETH',
      rate: '4.29%',
      actionType: 'SUPPLY',
      notificationFrequency: 'AT_MOST_ONCE_PER_DAY',
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
      id: 'borrow-1',
      platform: 'Spark',
      chain: 'Ethereum',
      market: 'ETH',
      rate: '2.19%',
      actionType: 'BORROW',
      notificationFrequency: 'AT_MOST_ONCE_PER_DAY',
      conditions: [
        {
          id: 'condition-2',
          conditionType: 'RATE_DIFF_BELOW',
          severity: 'NONE',
          thresholdValue: '',
        },
      ],
    },
  ]);

  // Delivery channels
  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: '' }]);

  // Validation errors
  const [errors, setErrors] = useState<{
    positions?: { [positionId: string]: { conditions?: string[] } };
    channels?: string[];
  }>({});

  const addChannel = () => setChannels((chs) => [...chs, { channelType: 'EMAIL', email: '' }]);

  const updateChannel = <K extends keyof Channel>(i: number, field: K, value: Channel[K]) => {
    setChannels((chs) => chs.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));

    // Clear validation error if it exists
    if (errors.channels && errors.channels[i]) {
      const newChannelErrors = [...errors.channels];

      if (field === 'email' && typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newChannelErrors[i] = '';
      } else if (field === 'webhookUrl' && typeof value === 'string') {
        try {
          new URL(value);
          newChannelErrors[i] = '';
        } catch {}
      }

      if (newChannelErrors.every((err) => !err)) {
        setErrors((prev) => ({ ...prev, channels: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, channels: newChannelErrors }));
      }
    }
  };

  const removeChannel = (i: number) => setChannels((chs) => chs.filter((_, idx) => idx !== i));

  // Update position function
  const updatePosition = (positionId: string, updates: Partial<PersonalizedComparisonPosition>) => {
    setPositions((positions) => positions.map((pos) => (pos.id === positionId ? { ...pos, ...updates } : pos)));
  };

  // Clear validation errors when user makes changes
  useEffect(() => {
    if (errors.positions) {
      const newPositionErrors = { ...errors.positions };
      let hasChanges = false;

      positions.forEach((position) => {
        if (newPositionErrors[position.id]?.conditions) {
          const newConditionErrors = [...newPositionErrors[position.id].conditions!];

          position.conditions.forEach((condition, index) => {
            if (condition.thresholdValue && !isNaN(Number(condition.thresholdValue)) && newConditionErrors[index]) {
              newConditionErrors[index] = '';
              hasChanges = true;
            }
          });

          if (hasChanges) {
            if (newConditionErrors.every((err) => !err)) {
              delete newPositionErrors[position.id];
            } else {
              newPositionErrors[position.id] = { conditions: newConditionErrors };
            }
          }
        }
      });

      if (hasChanges) {
        if (Object.keys(newPositionErrors).length === 0) {
          setErrors((prev) => ({ ...prev, positions: undefined }));
        } else {
          setErrors((prev) => ({ ...prev, positions: newPositionErrors }));
        }
      }
    }
  }, [positions, errors.positions]);

  useEffect(() => {
    if (errors.channels) {
      const newChannelErrors = [...errors.channels];
      let hasChanges = false;

      channels.forEach((channel, index) => {
        if (channel.channelType === 'EMAIL') {
          if (channel.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(channel.email) && newChannelErrors[index]) {
            newChannelErrors[index] = '';
            hasChanges = true;
          }
        } else if (channel.channelType === 'WEBHOOK') {
          if (channel.webhookUrl && newChannelErrors[index]) {
            try {
              new URL(channel.webhookUrl);
              newChannelErrors[index] = '';
              hasChanges = true;
            } catch {}
          }
        }
      });

      if (hasChanges) {
        if (newChannelErrors.every((err) => !err)) {
          setErrors((prev) => ({ ...prev, channels: undefined }));
        } else {
          setErrors((prev) => ({ ...prev, channels: newChannelErrors }));
        }
      }
    }
  }, [channels, errors.channels]);

  // Validate form before submission
  const validateForm = () => {
    const newErrors: {
      positions?: { [positionId: string]: { conditions?: string[] } };
      channels?: string[];
    } = {};

    // Validate position conditions
    const positionErrors: { [positionId: string]: { conditions?: string[] } } = {};

    positions.forEach((position) => {
      const conditionErrors: string[] = [];

      position.conditions.forEach((condition, index) => {
        if (!condition.thresholdValue) {
          conditionErrors[index] = 'Threshold value is required';
        } else if (isNaN(Number(condition.thresholdValue))) {
          conditionErrors[index] = 'Threshold value must be a valid number';
        }
      });

      if (conditionErrors.some((error) => error)) {
        positionErrors[position.id] = { conditions: conditionErrors };
      }
    });

    if (Object.keys(positionErrors).length > 0) {
      newErrors.positions = positionErrors;
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

  // submit: create alerts for each position
  const handleCreateAlert = async () => {
    // Validate form before submission
    if (!validateForm()) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors in the form before submitting',
      });
      return;
    }

    // Create and submit alerts for each position
    for (const position of positions) {
      const payload: PersonalizedComparisonAlertPayload = {
        walletAddress: walletAddress,
        category: 'PERSONALIZED' as AlertCategory,
        actionType: position.actionType as AlertActionType,
        isComparison: true,
        selectedChains: [position.chain],
        selectedMarkets: [position.market],
        compareProtocols: [position.platform],
        notificationFrequency: position.notificationFrequency as NotificationFrequency,
        conditions: position.conditions.map((condition) => ({
          type: condition.conditionType as ConditionType,
          value: condition.thresholdValue!,
          severity: condition.severity as PrismaSeverityLevel,
        })),
        deliveryChannels: channels.map((c) => ({
          type: c.channelType as DeliveryChannelType,
          email: c.channelType === 'EMAIL' ? c.email : undefined,
          webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
        })),
      };

      await postData(`${baseUrl}/api/alerts/create/personalized-comparison`, payload);
    }
  };

  // Group positions by action type
  const supplyPositions = positions.filter((pos) => pos.actionType === 'SUPPLY');
  const borrowPositions = positions.filter((pos) => pos.actionType === 'BORROW');

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-theme-muted">Please log in to create an alert.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-2 py-8">
      {/* Breadcrumb */}
      <AlertBreadcrumb currentPage="Personalized Comparison Alert" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-theme-primary">Get Alerts When Compound Beats Your Other Rates</h1>
        <p className="text-theme-muted">Stay updated when Compound outperforms Aave, Spark, or Morpho on any of your positions.</p>
      </div>

      {/* Supply Positions */}
      {supplyPositions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-theme-primary">Supply Positions</h2>
          <p className="text-sm text-theme-muted mb-6">Set alert conditions for each of your supply positions.</p>
          {supplyPositions.map((position) => (
            <PersonalizedComparisonPositionCard
              key={position.id}
              position={position}
              updatePosition={updatePosition}
              errors={errors.positions?.[position.id]}
            />
          ))}
        </div>
      )}

      {/* Borrow Positions */}
      {borrowPositions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-theme-primary">Borrow Positions</h2>
          <p className="text-sm text-theme-muted mb-6">Set alert conditions for each of your borrow positions.</p>
          {borrowPositions.map((position) => (
            <PersonalizedComparisonPositionCard
              key={position.id}
              position={position}
              updatePosition={updatePosition}
              errors={errors.positions?.[position.id]}
            />
          ))}
        </div>
      )}

      {/* Delivery Channels */}
      <DeliveryChannelsCard
        channels={channels}
        addChannel={addChannel}
        updateChannel={updateChannel}
        removeChannel={removeChannel}
        errors={errors}
        session={session}
      />

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button onClick={() => router.push('/alerts/create')} className="border hover-border-primary">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <Button onClick={handleCreateAlert} className="border text-primary-color hover-border-body" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Personalized Alerts'}
        </Button>
      </div>
    </div>
  );
}
