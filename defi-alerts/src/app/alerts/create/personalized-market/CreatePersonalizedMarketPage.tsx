'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowLeft } from 'lucide-react';
import { AlertBreadcrumb, PersonalizedPositionCard, DeliveryChannelsCard } from '@/components/alerts';
import { type PersonalizedPosition } from '@/components/alerts/PersonalizedPositionCard';
import { Button } from '@/components/ui/button';
import { type Channel, type ConditionType } from '@/types/alerts';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import {
  AlertCategory,
  AlertActionType,
  NotificationFrequency,
  ConditionType as PrismaConditionType,
  SeverityLevel,
  DeliveryChannelType,
} from '@prisma/client';
import { CreatePersonalizedAlertPayload, PersonalizedAlertCreationResponse } from '@/app/api/alerts/create/personalized-market/route';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';

interface CreatePersonalizedMarketPageProps {
  session: DoDAOSession;
}

export default function CreatePersonalizedMarketPage({ session }: CreatePersonalizedMarketPageProps) {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const { postData, loading: isSubmitting } = usePostData<PersonalizedAlertCreationResponse, CreatePersonalizedAlertPayload>({
    successMessage: 'Your personalized market alert was saved successfully.',
    errorMessage: "Couldn't create personalized alert",
    redirectPath: '/alerts',
  });

  const [walletAddress, setWalletAddress] = useState<string>('');

  // Validation errors
  const [errors, setErrors] = useState<{
    positions?: { [positionId: string]: { conditions?: string[] } };
    channels?: string[];
  }>({});

  useEffect(() => {
    if (session?.username) {
      setChannels((ch) => ch.map((channel) => (channel.channelType === 'EMAIL' ? { ...channel, email: session.username } : channel)));
    }
    setWalletAddress(localStorage.getItem('walletAddress') ?? '');
  }, [session?.username]);

  // Initialize positions with hardcoded data
  const [positions, setPositions] = useState<PersonalizedPosition[]>([
    {
      id: 'supply-1',
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
  ]);

  // Delivery channels
  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: '' }]);
  const addChannel = () => setChannels((c) => [...c, { channelType: 'EMAIL', email: session?.username || '' }]);
  const updateChannel = (idx: number, field: keyof Channel, val: string) => setChannels((c) => c.map((ch, i) => (i === idx ? { ...ch, [field]: val } : ch)));
  const removeChannel = (idx: number) => setChannels((c) => c.filter((_, i) => i !== idx));

  // Update position function
  const updatePosition = (positionId: string, updates: Partial<PersonalizedPosition>) => {
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
            if (condition.conditionType === 'APR_OUTSIDE_RANGE') {
              if (
                condition.thresholdLow &&
                condition.thresholdHigh &&
                !isNaN(Number(condition.thresholdLow)) &&
                !isNaN(Number(condition.thresholdHigh)) &&
                newConditionErrors[index]
              ) {
                newConditionErrors[index] = '';
                hasChanges = true;
              }
            } else {
              if (condition.thresholdValue && !isNaN(Number(condition.thresholdValue)) && newConditionErrors[index]) {
                newConditionErrors[index] = '';
                hasChanges = true;
              }
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

  // Submit → create alerts for each position
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
      const payload: CreatePersonalizedAlertPayload = {
        walletAddress: walletAddress,
        category: 'PERSONALIZED' as AlertCategory,
        actionType: position.actionType as AlertActionType,
        selectedChains: [position.chain],
        selectedMarkets: [position.market],
        compareProtocols: [],
        notificationFrequency: position.notificationFrequency as NotificationFrequency,
        conditions: position.conditions.map((condition) =>
          condition.conditionType === 'APR_OUTSIDE_RANGE'
            ? {
                type: condition.conditionType as PrismaConditionType,
                min: condition.thresholdLow,
                max: condition.thresholdHigh,
                severity: condition.severity as SeverityLevel,
              }
            : {
                type: condition.conditionType as PrismaConditionType,
                value: condition.thresholdValue,
                severity: condition.severity as SeverityLevel,
              }
        ),
        deliveryChannels: channels.map((c) => ({
          type: c.channelType as DeliveryChannelType,
          email: c.channelType === 'EMAIL' ? c.email : undefined,
          webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
        })),
      };

      await postData(`${baseUrl}/api/alerts/create/personalized-market`, payload);
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
      <AlertBreadcrumb currentPage="Personalized Market Alert" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-theme-primary">Create Personalized Market Alert</h1>
        <p className="text-theme-muted">Configure market alerts specifically for your positions on Compound.</p>
      </div>

      {/* Supply Positions */}
      {supplyPositions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-theme-primary">Supply Positions</h2>
          <p className="text-sm text-theme-muted mb-6">Set alert conditions for each of your supply positions.</p>
          {supplyPositions.map((position) => (
            <PersonalizedPositionCard key={position.id} position={position} updatePosition={updatePosition} errors={errors.positions?.[position.id]} />
          ))}
        </div>
      )}

      {/* Borrow Positions */}
      {borrowPositions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-theme-primary">Borrow Positions</h2>
          <p className="text-sm text-theme-muted mb-6">Set alert conditions for each of your borrow positions.</p>
          {borrowPositions.map((position) => (
            <PersonalizedPositionCard key={position.id} position={position} updatePosition={updatePosition} errors={errors.positions?.[position.id]} />
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
