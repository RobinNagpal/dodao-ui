// src/components/alerts/modals/MonitorMarketsModal.tsx
'use client';

import { useSession } from 'next-auth/react';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTypeCard, MarketSelectionCard, ConditionSettingsCard, DeliveryChannelsCard } from '@/components/alerts';
import type { Channel, NotificationFrequency } from '@/types/alerts';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { AlertCreationResponse, CreateCompoundAlertPayload } from '@/app/api/alerts/create/compound-market/route';
import {
  AlertActionType,
  NotificationFrequency as PrismaNotificationFrequency,
  ConditionType as PrismaConditionType,
  SeverityLevel as PrismaSeverityLevel,
  DeliveryChannelType,
} from '@prisma/client';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useState } from 'react';

interface MonitorMarketsProps {
  isOpen: boolean;
  handleClose: () => void;
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  errors: any;
  setErrors: (errors: any) => void;
  onSwitchModal: () => void;
}

export default function MonitorMarketsModal({ isOpen, handleClose, channels, setChannels, errors, setErrors, onSwitchModal }: MonitorMarketsProps) {
  const { data } = useSession();
  const session = data as DoDAOSession;
  const baseUrl = getBaseUrl();

  const { showNotification } = useNotificationContext();

  const [conditions, setConditions] = useState<any[]>([{ conditionType: 'APR_RISE_ABOVE', thresholdValue: '', severity: 'NONE' }]);
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('ONCE_PER_ALERT');
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [alertType, setAlertType] = useState<'borrow' | 'supply'>('borrow');

  // Market monitoring functions
  const toggleChain = (chain: string) => setSelectedChains((cs) => (cs.includes(chain) ? cs.filter((c) => c !== chain) : [...cs, chain]));
  const toggleMarket = (market: string) => setSelectedMarkets((ms) => (ms.includes(market) ? ms.filter((m) => m !== market) : [...ms, market]));

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-theme-bg-secondary border border-primary-color background-color">
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
          <Button onClick={onSwitchModal} className="border hover-border-primary mr-2">
            Back
          </Button>
          <Button className="border text-primary-color hover-border-body" onClick={handleCreateMarketAlert} disabled={creatingMarketAlert}>
            {creatingMarketAlert ? 'Creating...' : 'Create Alert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
