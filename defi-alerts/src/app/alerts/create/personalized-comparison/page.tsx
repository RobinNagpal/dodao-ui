'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ChevronRight, Home, Bell, TrendingUp, Plus, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Channel, type NotificationFrequency, severityOptions, SeverityLevel } from '@/types/alerts';
import PersonalizedComparisonPositionCard, { type PersonalizedComparisonPosition } from '@/components/alerts/PersonalizedComparisonPositionCard';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { PersonalizedComparisonAlertPayload, PersonalizedComparisonAlertResponse } from '@/app/api/alerts/create/personalized-comparison/route';
import { AlertActionType, AlertCategory, ConditionType, DeliveryChannelType, SeverityLevel as PrismaSeverityLevel } from '@prisma/client';

export default function PersonalizedComparisonPage() {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const { postData, loading: isSubmitting } = usePostData<PersonalizedComparisonAlertResponse, PersonalizedComparisonAlertPayload>({
    successMessage: "You'll now be notified when Compound compares favorably with other platforms.",
    errorMessage: "Couldn't create personalized comparison alert",
    redirectPath: '/alerts/compare-compound',
  });

  const [email, setEmail] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    setEmail(localStorage.getItem('email') ?? '');
    setWalletAddress(localStorage.getItem('walletAddress') ?? '');
  }, []);

  // Initialize positions with hardcoded data
  const [positions, setPositions] = useState<PersonalizedComparisonPosition[]>([
    {
      id: 'supply-1',
      platform: 'Aave',
      chain: 'Ethereum',
      market: 'wstETH',
      rate: '0.09%',
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
      rate: '2.09%',
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

  return (
    <div className="container max-w-6xl mx-auto px-2 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm mb-6">
        <Link href="/" className="text-theme-muted hover-text-primary flex items-center gap-1">
          <Home size={14} />
          <span>Home</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-theme-muted" />
        <Link href="/alerts" className="text-theme-muted hover-text-primary flex items-center gap-1">
          <Bell size={14} />
          <span>Alerts</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-theme-muted" />
        <Link href="/alerts/create" className="text-theme-muted hover-text-primary flex items-center gap-1">
          <TrendingUp size={14} />
          <span>Create Alert</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-theme-muted" />
        <span className="text-primary-color font-medium">Personalized Comparison Alert</span>
      </nav>

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
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-theme-primary">Delivery Channel Settings</CardTitle>
          <Button size="sm" onClick={addChannel} className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary">
            <Plus size={16} className="mr-1" /> Add Channel
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">Choose how you want to receive your alerts.</p>

          {channels.map((ch, i) => (
            <div key={i} className="mb-4 flex items-center gap-4">
              <Select value={ch.channelType} onValueChange={(value) => updateChannel(i, 'channelType', value as Channel['channelType'])}>
                <SelectTrigger className="w-[150px] hover-border-primary">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent className="bg-block">
                  <div className="hover-border-primary hover-text-primary">
                    <SelectItem value="EMAIL">Email</SelectItem>
                  </div>
                  <div className="hover-border-primary hover-text-primary">
                    <SelectItem value="WEBHOOK">Webhook</SelectItem>
                  </div>
                </SelectContent>
              </Select>

              {ch.channelType === 'EMAIL' ? (
                <div className="flex-1 flex flex-col">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={ch.email || ''}
                    onChange={(e) => updateChannel(i, 'email', e.target.value)}
                    className={`flex-1 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                      errors.channels && errors.channels[i] ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.channels && errors.channels[i] && (
                    <div className="mt-1 flex items-center text-red-500 text-sm">
                      <AlertCircle size={14} className="mr-1" />
                      <span>{errors.channels[i]}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <Input
                    type="url"
                    placeholder="https://webhook.site/..."
                    value={ch.webhookUrl || ''}
                    onChange={(e) => updateChannel(i, 'webhookUrl', e.target.value)}
                    className={`flex-1 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                      errors.channels && errors.channels[i] ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.channels && errors.channels[i] && (
                    <div className="mt-1 flex items-center text-red-500 text-sm">
                      <AlertCircle size={14} className="mr-1" />
                      <span>{errors.channels[i]}</span>
                    </div>
                  )}
                </div>
              )}

              {channels.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeChannel(i)} className="text-red-500 h-8 w-8">
                  <X size={16} />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

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
