'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Channel, type NotificationFrequency, type SeverityLevel, type GeneralComparisonRow } from '@/types/alerts';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { CompareCompoundAlertPayload, CompareCompoundAlertResponse } from '@/app/api/alerts/create/compare-compound/route';
import { AlertActionType, AlertCategory, ConditionType, DeliveryChannelType, SeverityLevel as PrismaSeverityLevel } from '@prisma/client';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { AlertBreadcrumb, AlertTypeCard, MarketSelectionCard, CompareThresholdCard, DeliveryChannelsCard } from '@/components/alerts';

export interface CompareCompoundPageProps {
  session: DoDAOSession;
}

export default function CreateCompareCompoundAlertPage({ session }: CompareCompoundPageProps) {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const { postData, loading: isSubmitting } = usePostData<CompareCompoundAlertResponse, CompareCompoundAlertPayload>({
    successMessage: "You'll now be notified when Compound beats other rates.",
    errorMessage: "Couldn't create comparison alert",
    redirectPath: '/alerts/compare-compound',
  });

  const [alertType, setAlertType] = useState<'supply' | 'borrow'>('supply');
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

  // Initialize email field with username when component mounts
  useEffect(() => {
    if (session?.username) {
      setChannels((ch) => ch.map((channel) => (channel.channelType === 'EMAIL' ? { ...channel, email: session.username } : channel)));
    }
  }, [session?.username]);

  // Populate email field with username when channel type is EMAIL
  useEffect(() => {
    if (session?.username) {
      setChannels((ch) => ch.map((channel) => (channel.channelType === 'EMAIL' ? { ...channel, email: session.username } : channel)));
    }
  }, [channels.map((c) => c.channelType).join(','), session?.username]);

  // Validation errors
  const [errors, setErrors] = useState<{
    platforms?: string;
    chains?: string;
    markets?: string;
    thresholds?: string[];
    channels?: string[];
  }>({});

  // toggles
  const togglePlatform = (p: string) => {
    setSelectedPlatforms((ps) => (ps.includes(p) ? ps.filter((x) => x !== p) : [...ps, p]));
    if (errors.platforms) {
      setErrors((prev) => ({ ...prev, platforms: undefined }));
    }
  };

  const toggleChain = (c: string) => {
    setSelectedChains((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
    if (errors.chains) {
      setErrors((prev) => ({ ...prev, chains: undefined }));
    }
  };

  const toggleMarket = (m: string) => {
    setSelectedMarkets((ms) => (ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]));
    if (errors.markets) {
      setErrors((prev) => ({ ...prev, markets: undefined }));
    }
  };

  // threshold handlers
  const addThreshold = () =>
    setThresholds((ts) => [
      ...ts,
      {
        platform: '',
        chain: '',
        market: '',
        threshold: '',
        severity: 'NONE',
        frequency: 'ONCE_PER_ALERT',
      },
    ]);

  const updateThreshold = (idx: number, field: keyof GeneralComparisonRow, val: string) => {
    setThresholds((ts) => ts.map((t, i) => (i === idx ? { ...t, [field]: val } : t)));

    // Clear validation error for this threshold if it exists
    if (errors.thresholds && errors.thresholds[idx]) {
      const newThresholdErrors = [...errors.thresholds];
      newThresholdErrors[idx] = '';

      if (newThresholdErrors.every((err) => !err)) {
        setErrors((prev) => ({ ...prev, thresholds: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, thresholds: newThresholdErrors }));
      }
    }
  };

  const removeThreshold = (idx: number) => setThresholds((ts) => ts.filter((_, i) => i !== idx));

  // channel handlers
  const addChannel = () => setChannels((ch) => [...ch, { channelType: 'EMAIL', email: session?.username || '' }]);

  const updateChannel = (idx: number, field: keyof Channel, val: string) => {
    setChannels((ch) => ch.map((c, i) => (i === idx ? { ...c, [field]: val } : c)));

    // Clear validation error for this channel if it exists
    if (errors.channels && errors.channels[idx]) {
      const newChannelErrors = [...errors.channels];

      if (field === 'email' && val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        newChannelErrors[idx] = '';
      } else if (field === 'webhookUrl' && val) {
        try {
          new URL(val);
          newChannelErrors[idx] = '';
        } catch {}
      }

      if (newChannelErrors.every((err) => !err)) {
        setErrors((prev) => ({ ...prev, channels: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, channels: newChannelErrors }));
      }
    }
  };

  const removeChannel = (idx: number) => setChannels((ch) => ch.filter((_, i) => i !== idx));

  const validateForm = () => {
    const newErrors: {
      platforms?: string;
      chains?: string;
      markets?: string;
      thresholds?: string[];
      channels?: string[];
    } = {};

    // Validate platforms, chains, and markets
    if (selectedPlatforms.length === 0) {
      newErrors.platforms = 'Please select at least one platform to compare with';
    }

    if (selectedChains.length === 0) {
      newErrors.chains = 'Please select at least one chain';
    }

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

    if (!validateForm()) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors in the form before submitting',
      });
      return;
    }

    const payload: CompareCompoundAlertPayload = {
      category: 'GENERAL' as AlertCategory,
      actionType: alertType.toUpperCase() as AlertActionType,
      isComparison: true,
      selectedChains,
      selectedMarkets,
      compareProtocols: selectedPlatforms,
      notificationFrequency,
      conditions: thresholds.map((t) => ({
        type: alertType === 'supply' ? ('RATE_DIFF_ABOVE' as ConditionType) : ('RATE_DIFF_BELOW' as ConditionType),
        value: t.threshold,
        severity: t.severity as PrismaSeverityLevel,
      })),
      deliveryChannels: channels.map((c) => ({
        type: c.channelType as DeliveryChannelType,
        email: c.channelType === 'EMAIL' ? c.email : undefined,
        webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
      })),
    };

    await postData(`${baseUrl}/api/alerts/create/compare-compound`, payload);
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
      <AlertBreadcrumb currentPage="Compare Compound" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-theme-primary">Compare Compound Rates</h1>
        <p className="text-theme-muted">Set up alerts to monitor when Compound offers better rates than other DeFi platforms.</p>
      </div>

      {/* Alert Type */}
      <AlertTypeCard
        alertType={alertType}
        setAlertType={setAlertType}
        supplyLabel="Supply Comparison (Alert when Compound offers higher rates)"
        borrowLabel="Borrow Comparison (Alert when Compound offers lower rates)"
      />

      {/* Platforms / Chains / Markets */}
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

      {/* Thresholds */}
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
