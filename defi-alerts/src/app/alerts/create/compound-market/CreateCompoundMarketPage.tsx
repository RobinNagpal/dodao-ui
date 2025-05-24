'use client';

import { AlertCreationResponse, CreateCompoundAlertPayload } from '@/app/api/alerts/create/compound-market/route';
import { Button } from '@/components/ui/button';
import { type Channel, type Condition, type ConditionType, type NotificationFrequency, type SeverityLevel } from '@/types/alerts';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import {
  AlertActionType,
  ConditionType as PrismaConditionType,
  DeliveryChannelType,
  NotificationFrequency as PrismaNotificationFrequency,
  SeverityLevel as PrismaSeverityLevel,
} from '@prisma/client';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertBreadcrumb, AlertTypeCard, MarketSelectionCard, ConditionSettingsCard, DeliveryChannelsCard } from '@/components/alerts';

export interface CreateCompoundMarketPageProps {
  session: DoDAOSession;
}

export default function CreateCompoundMarketPage({ session }: CreateCompoundMarketPageProps) {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const { postData, loading: isSubmitting } = usePostData<AlertCreationResponse, CreateCompoundAlertPayload>({
    successMessage: 'Your market alert was saved successfully.',
    errorMessage: "Couldn't create alert",
    redirectPath: '/alerts',
  });

  const [alertType, setAlertType] = useState<'borrow' | 'supply'>('borrow');
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('ONCE_PER_ALERT');

  const [conditions, setConditions] = useState<Condition[]>([{ conditionType: 'APR_RISE_ABOVE', thresholdValue: '', severity: 'NONE' }]);

  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: '' }]);

  // Initialize email field with username when component mounts
  useEffect(() => {
    if (session?.username) {
      setChannels((ch) => ch.map((channel) => (channel.channelType === 'EMAIL' ? { ...channel, email: session.username } : channel)));
    }
  }, [session?.username]);

  // Validation errors
  const [errors, setErrors] = useState<{
    chains?: string;
    markets?: string;
    conditions?: string[];
    channels?: string[];
  }>({});

  // Clear validation errors when user makes changes
  useEffect(() => {
    if (selectedChains.length > 0 && errors.chains) {
      setErrors((prev) => ({ ...prev, chains: undefined }));
    }
  }, [selectedChains, errors.chains]);

  useEffect(() => {
    if (selectedMarkets.length > 0 && errors.markets) {
      setErrors((prev) => ({ ...prev, markets: undefined }));
    }
  }, [selectedMarkets, errors.markets]);

  // Populate email field with username when channel type is EMAIL
  useEffect(() => {
    if (session?.username) {
      setChannels((ch) => ch.map((channel) => (channel.channelType === 'EMAIL' ? { ...channel, email: session.username } : channel)));
    }
  }, [channels.map((c) => c.channelType).join(','), session?.username]);

  useEffect(() => {
    if (errors.conditions) {
      const newConditionErrors = [...errors.conditions];
      let hasChanges = false;

      conditions.forEach((cond, index) => {
        if (cond.conditionType === 'APR_OUTSIDE_RANGE') {
          if (cond.thresholdLow && cond.thresholdHigh && !isNaN(Number(cond.thresholdLow)) && !isNaN(Number(cond.thresholdHigh)) && newConditionErrors[index]) {
            newConditionErrors[index] = '';
            hasChanges = true;
          }
        } else {
          if (cond.thresholdValue && !isNaN(Number(cond.thresholdValue)) && newConditionErrors[index]) {
            newConditionErrors[index] = '';
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        if (newConditionErrors.every((err) => !err)) {
          setErrors((prev) => ({ ...prev, conditions: undefined }));
        } else {
          setErrors((prev) => ({ ...prev, conditions: newConditionErrors }));
        }
      }
    }
  }, [conditions, errors.conditions]);

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

  const toggleChain = (chain: string) => setSelectedChains((cs) => (cs.includes(chain) ? cs.filter((c) => c !== chain) : [...cs, chain]));

  const toggleMarket = (market: string) => setSelectedMarkets((ms) => (ms.includes(market) ? ms.filter((m) => m !== market) : [...ms, market]));

  const updateCondition = (i: number, field: keyof Condition, val: string) =>
    setConditions((cs) => cs.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));

  const addCondition = () => setConditions((cs) => [...cs, { conditionType: 'APR_RISE_ABOVE', severity: 'NONE' }]);

  const removeCondition = (i: number) => setConditions((cs) => cs.filter((_, idx) => idx !== i));

  const addChannel = () => setChannels((ch) => [...ch, { channelType: 'EMAIL', email: session?.username || '' }]);

  const updateChannel = (i: number, field: keyof Channel, val: string) => setChannels((ch) => ch.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));

  const removeChannel = (i: number) => setChannels((ch) => ch.filter((_, idx) => idx !== i));

  // Validate form before submission
  const validateForm = () => {
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

  const handleCreateAlert = async () => {
    const user = session?.user;
    if (!user) {
      showNotification({
        type: 'error',
        heading: 'Session Error',
        message: 'Session expired. Please log in again.',
      });
      router.push('/login');
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors in the form before submitting',
      });
      return;
    }

    const payload: CreateCompoundAlertPayload = {
      actionType: alertType.toUpperCase() as AlertActionType,
      selectedChains,
      selectedMarkets,
      notificationFrequency: notificationFrequency as PrismaNotificationFrequency,
      conditions: conditions.map((c) => ({
        type: c.conditionType as PrismaConditionType,
        value: c.thresholdValue,
        min: c.thresholdLow,
        max: c.thresholdHigh,
        severity: c.severity as PrismaSeverityLevel,
      })),
      deliveryChannels: channels.map((c) => ({
        type: c.channelType as DeliveryChannelType,
        email: c.channelType === 'EMAIL' ? c.email : undefined,
        webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
      })),
    };

    await postData(`${baseUrl}/api/alerts/create/compound-market`, payload);
  };

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
      <AlertBreadcrumb currentPage="Compound Market" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-theme-primary">Create Market Alert</h1>
        <p className="text-theme-muted">Configure a new market alert with your preferred settings.</p>
      </div>

      {/* Alert Type */}
      <AlertTypeCard alertType={alertType} setAlertType={setAlertType} />

      {/* Market Selection */}
      <MarketSelectionCard
        selectedChains={selectedChains}
        toggleChain={toggleChain}
        selectedMarkets={selectedMarkets}
        toggleMarket={toggleMarket}
        errors={errors}
        showPlatforms={false}
      />

      {/* Condition Settings */}
      <ConditionSettingsCard
        conditions={conditions}
        addCondition={addCondition}
        updateCondition={updateCondition}
        removeCondition={removeCondition}
        notificationFrequency={notificationFrequency}
        setNotificationFrequency={setNotificationFrequency}
        errors={errors}
      />

      {/* Delivery Channel Settings */}
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

        <div className="space-x-4">
          <Button onClick={handleCreateAlert} className="border text-primary-color hover-border-body" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Alert'}
          </Button>
        </div>
      </div>
    </div>
  );
}
