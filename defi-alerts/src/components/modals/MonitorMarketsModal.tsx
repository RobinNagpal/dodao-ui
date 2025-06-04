// src/components/alerts/modals/MonitorMarketsModal.tsx
'use client';

import { CompareCompoundAlertPayload, CompareCompoundAlertResponse } from '@/app/api/alerts/create/compare-compound/route';
import { AlertCreationResponse, CreateCompoundAlertPayload } from '@/app/api/alerts/create/compound-market/route';
import { AlertTypeCard, DeliveryChannelsCard, MarketSelectionCard, NotificationFrequencySection, PositionConditionEditor } from '@/components/alerts';
import { ComparisonCondition, MarketCondition } from '@/components/alerts/PositionConditionEditor';
import { getEmptyCondition } from '@/components/modals/utils/getEmptyCondition';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Channel, GeneralComparisonRow, NotificationFrequency } from '@/types/alerts';
import { validateMarketCombinations } from '@/utils/clientValidationUtils';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import {
  AlertActionType,
  AlertCategory,
  ConditionType as PrismaConditionType,
  DeliveryChannelType,
  NotificationFrequency as PrismaNotificationFrequency,
  SeverityLevel as PrismaSeverityLevel,
} from '@prisma/client';
import { AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface MonitorMarketsProps {
  isOpen: boolean;
  modalType: 'MARKET' | 'COMPARISON';
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

  const [conditions, setConditions] = useState<(MarketCondition | ComparisonCondition)[]>([getEmptyCondition(modalType, [], 'borrow')]);
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('ONCE_PER_ALERT');
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showValidationError, setShowValidationError] = useState(false);
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

  const updateCondition = (id: string, field: string, val: string) => {
    const updatedConditions = conditions.map((c) => {
      if (c.id === id) {
        return { ...c, [field]: val };
      } else {
        return c;
      }
    });
    setConditions(updatedConditions);
  };

  const addCondition = () => {
    let newCondition = getEmptyCondition(modalType, conditions, alertType);
    setConditions((cs) => [...cs, newCondition]);
  };
  const removeCondition = (id: string) => {
    const filteredConditions = conditions.filter((c) => c.id !== id);
    const withUpdatedIds = filteredConditions.map((c, idx) => ({ ...c, id: `${idx}-condition` }));
    setConditions(withUpdatedIds);
  };
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

    // Reset validation error display
    setShowValidationError(false);

    // Validate chains
    if (selectedChains.length === 0) {
      newErrors.chains = 'Please select at least one chain';
    }

    // Validate markets
    if (selectedMarkets.length === 0) {
      newErrors.markets = 'Please select at least one market';
    }

    // Check if combinations are valid
    if (selectedChains.length > 0 && selectedMarkets.length > 0) {
      const validationResult = validateMarketCombinations(selectedChains, selectedMarkets);
      if (!validationResult.isValid) {
        setShowValidationError(true);
        return false;
      }
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
      return;
    }

    // Prepare the payload
    const payload: CreateCompoundAlertPayload = {
      actionType: alertType.toUpperCase() as AlertActionType,
      selectedChains,
      selectedMarkets,
      notificationFrequency: notificationFrequency as PrismaNotificationFrequency,
      conditions: (conditions as MarketCondition[]).map((c) => ({
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

    // Reset validation error display
    setShowValidationError(false);

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

    // Check if combinations are valid
    if (selectedChains.length > 0 && selectedMarkets.length > 0) {
      const validationResult = validateMarketCombinations(selectedChains, selectedMarkets);
      if (!validationResult.isValid) {
        setShowValidationError(true);
        return false;
      }
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
    const isValid = Object.keys(newErrors).length === 0;
    if (!isValid) {
      console.log(`Errors: ${JSON.stringify(newErrors, null, 2)}`);
    }
    return isValid;
  };

  const handleCreateGeneralComparisonAlert = async () => {
    if (!validateGeneralComparisonAlert()) {
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
      conditions: (conditions as ComparisonCondition[]).map((t) => ({
        type: alertType === 'supply' ? ('RATE_DIFF_ABOVE' as PrismaConditionType) : ('RATE_DIFF_BELOW' as PrismaConditionType),
        value: t.thresholdValue,
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
            {modalType === 'MARKET' ? 'Create Market Alert' : 'Create General Comparison Alert'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <AlertTypeCard
            alertType={alertType}
            setAlertType={(alertType) => {
              const newCondition = getEmptyCondition(modalType, [], alertType);
              setConditions([newCondition]);
              setAlertType(alertType);
            }}
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

          <PositionConditionEditor
            editorType={modalType === 'MARKET' ? 'market' : 'comparison'}
            actionType={alertType === 'supply' ? 'SUPPLY' : 'BORROW'}
            platformName={(selectedPlatforms?.length || 0) > 1 ? selectedPlatforms.join(', ') : selectedPlatforms?.[0] || ''}
            conditions={conditions as ComparisonCondition[]}
            addCondition={addCondition}
            updateCondition={updateCondition}
            removeCondition={removeCondition}
            errors={errors}
          />

          {/* Notification Frequency */}
          <Card className="mb-6 p-4 border-theme-primary bg-block border-primary-color">
            <NotificationFrequencySection notificationFrequency={notificationFrequency} setNotificationFrequency={setNotificationFrequency} />
          </Card>
          <DeliveryChannelsCard
            channels={channels}
            addChannel={addChannel}
            updateChannel={updateChannel}
            removeChannel={removeChannel}
            errors={errors}
            session={session}
          />

          {/* Market Combination Validation Error */}
          {showValidationError && (
            <div className="mb-6 p-4 border border-primary-color bg-block rounded-md">
              <div className="flex items-center text-red-600">
                <AlertCircle size={16} className="mr-2" />
                <span className="font-medium text-sm">Invalid Market Combinations</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                The selected chains do not support the selected markets on Compound. Please choose different chains or markets that are available.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onSwitchModal} className="border hover-border-primary mr-2">
            Back
          </Button>
          <Button
            className="border text-primary-color hover-border-body"
            onClick={modalType === 'MARKET' ? handleCreateMarketAlert : handleCreateGeneralComparisonAlert}
            disabled={modalType === 'MARKET' ? creatingMarketAlert : creatingGeneralAlert}
          >
            {modalType === 'MARKET' ? (creatingMarketAlert ? 'Creating...' : 'Create Alert') : creatingGeneralAlert ? 'Creating...' : 'Create Comparison Alert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
