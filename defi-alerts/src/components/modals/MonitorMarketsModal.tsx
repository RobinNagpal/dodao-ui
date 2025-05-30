// src/components/alerts/modals/MonitorMarketsModal.tsx
'use client';

import { useSession } from 'next-auth/react';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTypeCard, MarketSelectionCard, ConditionSettingsCard, DeliveryChannelsCard, CompareThresholdCard } from '@/components/alerts';
import type { Channel, GeneralComparisonRow, NotificationFrequency } from '@/types/alerts';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { AlertCreationResponse, CreateCompoundAlertPayload } from '@/app/api/alerts/create/compound-market/route';
import {
  AlertCategory,
  AlertActionType,
  NotificationFrequency as PrismaNotificationFrequency,
  ConditionType as PrismaConditionType,
  SeverityLevel as PrismaSeverityLevel,
  DeliveryChannelType,
} from '@prisma/client';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useState } from 'react';
import { CompareCompoundAlertPayload, CompareCompoundAlertResponse } from '@/app/api/alerts/create/compare-compound/route';

interface MonitorMarketsProps {
  isOpen: boolean;
  modalType: 'GENERAL' | 'COMPARISON';
  handleClose: () => void;
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  errors: any;
  setErrors: (errors: any) => void;
  onSwitchModal: () => void;
}

export default function MonitorMarketsModal({ isOpen, modalType, handleClose, channels, setChannels, errors, setErrors, onSwitchModal }: MonitorMarketsProps) {
  const { data } = useSession();
  const session = data as DoDAOSession;
  const baseUrl = getBaseUrl();

  const { showNotification } = useNotificationContext();

  const [conditions, setConditions] = useState<any[]>([{ conditionType: 'APR_RISE_ABOVE', thresholdValue: '', severity: 'NONE' }]);
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('ONCE_PER_ALERT');
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
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

  const [alertType, setAlertType] = useState<'borrow' | 'supply'>('borrow');

  const toggleChain = (chain: string) => setSelectedChains((cs) => (cs.includes(chain) ? cs.filter((c) => c !== chain) : [...cs, chain]));
  const toggleMarket = (market: string) => setSelectedMarkets((ms) => (ms.includes(market) ? ms.filter((m) => m !== market) : [...ms, market]));
  const togglePlatform = (platform: string) => setSelectedPlatforms((ps) => (ps.includes(platform) ? ps.filter((p) => p !== platform) : [...ps, platform]));

  const addThreshold = () =>
    setThresholds((ts) => [...ts, { platform: '', chain: '', market: '', threshold: '', severity: 'NONE', frequency: 'ONCE_PER_ALERT' }]);
  const updateThreshold = (i: number, field: keyof GeneralComparisonRow, val: string) =>
    setThresholds((ts) => ts.map((t, idx) => (idx === i ? { ...t, [field]: val } : t)));
  const removeThreshold = (i: number) => setThresholds((ts) => ts.filter((_, idx) => idx !== i));

  const updateCondition = (i: number, field: keyof any, val: string) => setConditions((cs) => cs.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));
  const addCondition = () => setConditions((cs) => [...cs, { conditionType: 'APR_RISE_ABOVE', severity: 'NONE' }]);
  const removeCondition = (i: number) => setConditions((cs) => cs.filter((_, idx) => idx !== i));
  const addChannel = () => setChannels((ch) => [...ch, { channelType: 'EMAIL', email: session?.username || '' }]);
  const updateChannel = (i: number, field: keyof Channel, val: string) => setChannels((ch) => ch.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));
  const removeChannel = (i: number) => setChannels((ch) => ch.filter((_, idx) => idx !== i));

  const { postData: postMarketAlert, loading: creatingMarketAlert } = usePostData<AlertCreationResponse, CreateCompoundAlertPayload>({
    successMessage: 'Market alert created successfully',
    errorMessage: 'Failed to create market alert',
    redirectPath: '/alerts',
  });

  const { postData: postGeneralComparisonAlert, loading: creatingGeneralAlert } = usePostData<CompareCompoundAlertResponse, CompareCompoundAlertPayload>({
    successMessage: 'General comparison alert created successfully',
    errorMessage: 'Failed to create general comparison alert',
    redirectPath: '/alerts/compare-compound',
  });

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

    const success = await postMarketAlert(`${baseUrl}/api/alerts/create/compound-market`, payload);

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-6xl max-h-[90vh] overflow-y-auto bg-theme-bg-secondary border border-primary-color background-color">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-theme-primary">
            {modalType === 'GENERAL' ? 'Create Market Alert' : 'Create General Comparison Alert'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <AlertTypeCard
            alertType={alertType}
            setAlertType={setAlertType}
            supplyLabel={modalType === 'COMPARISON' ? 'Supply Comparison (Alert when Compound offers higher rates)' : undefined}
            borrowLabel={modalType === 'COMPARISON' ? 'Borrow Comparison (Alert when Compound offers lower rates)' : undefined}
          />

          <MarketSelectionCard
            selectedChains={selectedChains}
            toggleChain={toggleChain}
            selectedMarkets={selectedMarkets}
            toggleMarket={toggleMarket}
            selectedPlatforms={modalType === 'COMPARISON' ? selectedPlatforms : undefined}
            togglePlatform={modalType === 'COMPARISON' ? togglePlatform : undefined}
            errors={errors}
            showPlatforms={modalType === 'COMPARISON'}
            title={modalType === 'COMPARISON' ? 'Market Selection' : ''}
            description={modalType === 'COMPARISON' ? 'Select the platforms to compare with and the markets you want to monitor.' : ''}
          />

          {modalType === 'GENERAL' ? (
            <ConditionSettingsCard
              conditions={conditions}
              addCondition={addCondition}
              updateCondition={updateCondition}
              removeCondition={removeCondition}
              notificationFrequency={notificationFrequency}
              setNotificationFrequency={setNotificationFrequency}
              errors={errors}
            />
          ) : (
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
          )}

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
          <Button onClick={onSwitchModal} className="border hover-border-primary mr-2">
            Back
          </Button>
          <Button
            className="border text-primary-color hover-border-body"
            onClick={modalType === 'GENERAL' ? handleCreateMarketAlert : handleCreateGeneralComparisonAlert}
            disabled={modalType === 'GENERAL' ? creatingMarketAlert : creatingGeneralAlert}
          >
            {modalType === 'GENERAL'
              ? creatingMarketAlert
                ? 'Creating...'
                : 'Create Alert'
              : creatingGeneralAlert
              ? 'Creating...'
              : 'Create Comparison Alert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
