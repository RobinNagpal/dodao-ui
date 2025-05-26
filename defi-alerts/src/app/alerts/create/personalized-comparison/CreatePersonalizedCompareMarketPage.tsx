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
import { AlertBreadcrumb } from '@/components/alerts';

export interface CompareCompoundPageProps {
  session: DoDAOSession;
}

export default function CreatePersonalizedCompareAlertPage({ session }: CompareCompoundPageProps) {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();
  const [currentSubmittingPosition, setCurrentSubmittingPosition] = useState<string | null>(null);

  const { postData, loading: isSubmitting } = usePostData<PersonalizedComparisonAlertResponse, PersonalizedComparisonAlertPayload>({
    successMessage: "You'll now be notified when Compound compares favorably with other platforms.",
    errorMessage: "Couldn't create personalized comparison alert",
    redirectPath: '/alerts/compare-compound',
  });

  const [walletAddress, setWalletAddress] = useState<string>('');

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

  // Initialize channels for each position
  const [positionChannels, setPositionChannels] = useState<{ [positionId: string]: Channel[] }>({});

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

  // Validation errors
  const [errors, setErrors] = useState<{
    [positionId: string]: {
      conditions?: string[];
      channels?: string[];
    };
  }>({});

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
  const updatePosition = (positionId: string, updates: Partial<PersonalizedComparisonPosition>) => {
    setPositions((positions) => positions.map((pos) => (pos.id === positionId ? { ...pos, ...updates } : pos)));
  };

  // Clear validation errors when user makes changes
  useEffect(() => {
    positions.forEach((position) => {
      if (errors[position.id]?.conditions) {
        const newConditionErrors = [...errors[position.id].conditions!];
        let hasChanges = false;

        position.conditions.forEach((condition, index) => {
          if (condition.thresholdValue && !isNaN(Number(condition.thresholdValue)) && newConditionErrors[index]) {
            newConditionErrors[index] = '';
            hasChanges = true;
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

    try {
      await postData(`${baseUrl}/api/alerts/create/personalized-comparison`, payload);
      showNotification({
        type: 'success',
        heading: 'Alert Created',
        message: `Alert for ${position.market} on ${position.chain} vs ${position.platform} has been created.`,
      });
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
            <PersonalizedComparisonPositionCard
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
