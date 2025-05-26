'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowLeft } from 'lucide-react';
import { AlertBreadcrumb, PersonalizedPositionCard } from '@/components/alerts';
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
  const [currentSubmittingPosition, setCurrentSubmittingPosition] = useState<string | null>(null);

  const { postData, loading: isSubmitting } = usePostData<PersonalizedAlertCreationResponse, CreatePersonalizedAlertPayload>({
    successMessage: 'Your personalized market alert was saved successfully.',
    errorMessage: "Couldn't create personalized alert",
    redirectPath: '/alerts',
  });

  const [walletAddress, setWalletAddress] = useState<string>('');

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

  // Initialize channels for each position
  const [positionChannels, setPositionChannels] = useState<{ [positionId: string]: Channel[] }>({});

  // Validation errors
  const [errors, setErrors] = useState<{
    [positionId: string]: {
      conditions?: string[];
      channels?: string[];
    };
  }>({});

  useEffect(() => {
    if (session?.username) {
      const updatedChannels = { ...positionChannels };
      positions.forEach((position) => {
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
    setWalletAddress(localStorage.getItem('walletAddress') ?? '');
  }, [session?.username, positions]);

  // Channel management functions for each position
  const addChannel = (positionId: string) => {
    setPositionChannels((prev) => ({
      ...prev,
      [positionId]: [...(prev[positionId] || []), { channelType: 'EMAIL', email: session?.username || '' }],
    }));
  };

  const updateChannel = (positionId: string, idx: number, field: keyof Channel, val: string) => {
    setPositionChannels((prev) => ({
      ...prev,
      [positionId]: (prev[positionId] || []).map((ch, i) => (i === idx ? { ...ch, [field]: val } : ch)),
    }));

    // Clear validation error if it exists
    if (errors[positionId]?.channels && errors[positionId].channels[idx]) {
      const newChannelErrors = [...errors[positionId].channels];

      if (field === 'email' && typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        newChannelErrors[idx] = '';
      } else if (field === 'webhookUrl' && typeof val === 'string') {
        try {
          new URL(val);
          newChannelErrors[idx] = '';
        } catch {}
      }

      if (newChannelErrors.every((err) => !err)) {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated[positionId].channels;
          if (Object.keys(updated[positionId]).length === 0) {
            delete updated[positionId];
          }
          return updated;
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          [positionId]: {
            ...prev[positionId],
            channels: newChannelErrors,
          },
        }));
      }
    }
  };

  const removeChannel = (positionId: string, idx: number) => {
    setPositionChannels((prev) => ({
      ...prev,
      [positionId]: (prev[positionId] || []).filter((_, i) => i !== idx),
    }));
  };

  // Update position function
  const updatePosition = (positionId: string, updates: Partial<PersonalizedPosition>) => {
    setPositions((positions) => positions.map((pos) => (pos.id === positionId ? { ...pos, ...updates } : pos)));
  };

  // Clear validation errors when user makes changes
  useEffect(() => {
    positions.forEach((position) => {
      if (errors[position.id]?.conditions) {
        const newConditionErrors = [...errors[position.id].conditions!];
        let hasChanges = false;

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
            setErrors((prev) => {
              const updated = { ...prev };
              delete updated[position.id].conditions;
              if (Object.keys(updated[position.id]).length === 0) {
                delete updated[position.id];
              }
              return updated;
            });
          } else {
            setErrors((prev) => ({
              ...prev,
              [position.id]: {
                ...prev[position.id],
                conditions: newConditionErrors,
              },
            }));
          }
        }
      }
    });
  }, [positions, errors]);

  useEffect(() => {
    Object.entries(positionChannels).forEach(([positionId, channels]) => {
      if (errors[positionId]?.channels) {
        const newChannelErrors = [...errors[positionId].channels!];
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
            setErrors((prev) => {
              const updated = { ...prev };
              delete updated[positionId].channels;
              if (Object.keys(updated[positionId]).length === 0) {
                delete updated[positionId];
              }
              return updated;
            });
          } else {
            setErrors((prev) => ({
              ...prev,
              [positionId]: {
                ...prev[positionId],
                channels: newChannelErrors,
              },
            }));
          }
        }
      }
    });
  }, [positionChannels, errors]);

  // Validate single position
  const validatePosition = (positionId: string): boolean => {
    const position = positions.find((p) => p.id === positionId);
    if (!position) return false;

    const channels = positionChannels[positionId] || [];
    const positionErrors: {
      conditions?: string[];
      channels?: string[];
    } = {};

    // Validate position conditions
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
      positionErrors.conditions = conditionErrors;
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
      positionErrors.channels = channelErrors;
    }

    setErrors((prev) => ({
      ...prev,
      [positionId]: positionErrors,
    }));

    return Object.keys(positionErrors).length === 0;
  };

  // Create alert for a single position
  const handleCreateAlert = async (positionId: string) => {
    const position = positions.find((p) => p.id === positionId);
    if (!position) return;

    // Validate position before submission
    if (!validatePosition(positionId)) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors before submitting',
      });
      return;
    }

    setCurrentSubmittingPosition(positionId);

    const channels = positionChannels[positionId] || [];
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

    try {
      await postData(`${baseUrl}/api/alerts/create/personalized-market`, payload);
    } finally {
      setCurrentSubmittingPosition(null);
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
            <PersonalizedPositionCard
              key={position.id}
              position={position}
              updatePosition={updatePosition}
              errors={errors[position.id]}
              onCreateAlert={handleCreateAlert}
              isSubmitting={isSubmitting && currentSubmittingPosition === position.id}
              channels={positionChannels[position.id] || []}
              addChannel={() => addChannel(position.id)}
              updateChannel={(idx, field, val) => updateChannel(position.id, idx, field, val)}
              removeChannel={(idx) => removeChannel(position.id, idx)}
              session={session}
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
            <PersonalizedPositionCard
              key={position.id}
              position={position}
              updatePosition={updatePosition}
              errors={errors[position.id]}
              onCreateAlert={handleCreateAlert}
              isSubmitting={isSubmitting && currentSubmittingPosition === position.id}
              channels={positionChannels[position.id] || []}
              addChannel={() => addChannel(position.id)}
              updateChannel={(idx, field, val) => updateChannel(position.id, idx, field, val)}
              removeChannel={(idx) => removeChannel(position.id, idx)}
              session={session}
            />
          ))}
        </div>
      )}

      {/* Back button */}
      <div className="flex justify-start">
        <Button onClick={() => router.push('/alerts/create')} className="border hover-border-primary">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
      </div>
    </div>
  );
}
