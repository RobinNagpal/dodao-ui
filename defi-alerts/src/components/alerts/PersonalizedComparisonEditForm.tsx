'use client';

import { DeliveryChannelsCard, NotificationFrequencySection, PositionConditionEditor } from '@/components/alerts';
import { ComparisonCondition } from '@/components/alerts/PositionConditionEditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { type Alert, type Channel, type NotificationFrequency, type SeverityLevel } from '@/types/alerts';
import { toSentenceCase } from '@/utils/getSentenceCase';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PersonalizedComparisonEditFormProps {
  alert: Alert;
  alertId: string;
}

interface Condition {
  id: string;
  severity: SeverityLevel;
  thresholdValue: string;
}

export default function PersonalizedComparisonEditForm({ alert, alertId }: PersonalizedComparisonEditFormProps) {
  const router = useRouter();
  const { data } = useSession();
  const session = data as DoDAOSession;
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const { putData, loading: isSubmitting } = usePutData<Alert, any>({
    successMessage: 'Your comparison alert was updated successfully.',
    errorMessage: "Couldn't update comparison alert",
    redirectPath: '/alerts/compare-compound',
  });

  const [actionType, setActionType] = useState<'SUPPLY' | 'BORROW'>('SUPPLY');
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('ONCE_PER_ALERT');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: session?.username || '' }]);
  const [errors, setErrors] = useState<{ conditions?: string[]; channels?: string[] }>({});

  // Platform info from alert
  const [platform, setPlatform] = useState<string>('');
  const [chain, setChain] = useState<string>('');
  const [market, setMarket] = useState<string>('');

  // Initialize form with alert data
  useEffect(() => {
    if (!alert) return;

    setActionType(alert.actionType as 'SUPPLY' | 'BORROW');
    setStatus(alert.status as 'ACTIVE' | 'PAUSED');
    setWalletAddress(alert.walletAddress || '');
    setNotificationFrequency(alert.notificationFrequency as NotificationFrequency);

    // Set platform info
    setChain(alert.selectedChains?.[0]?.name || '');
    setMarket(alert.selectedAssets?.[0]?.symbol || '');
    setPlatform(alert.compareProtocols?.[0] || '');

    // Set up conditions
    const alertConditions: Condition[] =
      alert.conditions?.map((condition, index) => ({
        id: `condition-${index}`,
        severity: condition.severity as SeverityLevel,
        thresholdValue: condition.thresholdValue?.toString() || '',
      })) || [];

    // Ensure at least one condition exists
    if (alertConditions.length === 0) {
      alertConditions.push({
        id: 'condition-1',
        severity: 'NONE',
        thresholdValue: '',
      });
    }

    setConditions(alertConditions);

    // Set channels
    if (alert.deliveryChannels?.length) {
      setChannels(
        alert.deliveryChannels.map((c) => ({
          channelType: c.channelType,
          email: c.email || session?.username || '',
          webhookUrl: c.webhookUrl || '',
        }))
      );
    }
  }, [alert, session?.username]);

  // Get contextual message for comparison logic
  const getComparisonMessage = () => {
    if (actionType === 'SUPPLY') {
      return `If ${toSentenceCase(platform)} offers 4.2% supply rate and you set 1.2% threshold, you'll be alerted when Compound's supply rate reaches 5.4%`;
    } else {
      return `If ${toSentenceCase(platform)} charges 6.8% borrow rate and you set 0.5% threshold, you'll be alerted when Compound's borrow rate drops to 6.3%`;
    }
  };

  // Condition functions
  const addCondition = () => {
    const newCondition: Condition = {
      id: `condition-${Date.now()}`,
      severity: 'NONE',
      thresholdValue: '',
    };
    setConditions((prev) => [...prev, newCondition]);
  };

  const updateCondition = (id: string, field: keyof ComparisonCondition | string, value: string) => {
    setConditions((prev) => prev.map((condition) => (condition.id === id ? { ...condition, [field]: value } : condition)));
  };

  const removeCondition = (id: string) => {
    setConditions((prev) => prev.filter((condition) => condition.id !== id));
  };

  // Channel functions
  const addChannel = () => {
    setChannels((prev) => [...prev, { channelType: 'EMAIL', email: session?.username || '' }]);
  };

  const updateChannel = (idx: number, field: keyof Channel, val: string) => {
    setChannels((prev) => prev.map((ch, i) => (i === idx ? { ...ch, [field]: val } : ch)));
  };

  const removeChannel = (idx: number) => {
    setChannels((prev) => prev.filter((_, i) => i !== idx));
  };

  // Validation
  const validateAlert = () => {
    const newErrors: { conditions?: string[]; channels?: string[] } = {};

    // Validate conditions
    const conditionErrors: string[] = [];
    conditions.forEach((condition, index) => {
      if (!condition.thresholdValue) {
        conditionErrors[index] = 'Threshold value is required';
      } else if (isNaN(Number(condition.thresholdValue))) {
        conditionErrors[index] = 'Threshold value must be a valid number';
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

  // Submit
  const handleUpdateAlert = async () => {
    if (!validateAlert()) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors before submitting',
      });
      return;
    }

    // Get the original chain and market connections
    const chainId = alert.selectedChains?.[0]?.chainId || 0;
    const chainConnect = [{ chainId }];

    const assetConnect =
      alert.selectedAssets?.map((asset) => ({
        chainId_address: `${asset.chainId}_${asset.address.toLowerCase()}`,
      })) || [];

    // Build conditions
    const conditionsPayload = conditions.map((condition) => ({
      conditionType: actionType === 'SUPPLY' ? 'RATE_DIFF_ABOVE' : 'RATE_DIFF_BELOW',
      thresholdValue: condition.thresholdValue,
      severity: condition.severity,
    }));

    const payload = {
      id: actionType === 'BORROW' || platform === 'MORPHO' ? alert.marketId : undefined,
      actionType,
      walletAddress,
      notificationFrequency,
      selectedChains: chainConnect,
      selectedAssets: assetConnect,
      compareProtocols: [platform], // Keep the original platform
      isComparison: true, // Ensure this remains a comparison alert
      conditions: conditionsPayload,
      deliveryChannels: channels.map((c) => ({
        channelType: c.channelType,
        email: c.channelType === 'EMAIL' ? c.email : undefined,
        webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
      })),
      status,
    };

    await putData(`${baseUrl}/api/alerts/${alertId}`, payload);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-theme-primary">Edit Personalized Comparison Alert</h1>
        <p className="text-theme-muted">Update your comparison alert for {actionType === 'SUPPLY' ? 'supply' : 'borrow'} positions.</p>
      </div>

      {/* Wallet Address Display */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">Wallet Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-primary-color border-primary-color">
              {actionType}
            </Badge>
            <div>
              <span className="text-theme-primary">Wallet Address: {walletAddress}</span>
            </div>
            <div>
              <span className="text-theme-primary">
                Chain: {chain} | Market: {market} | Platform: {toSentenceCase(platform)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Status */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">Alert Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">Enable or disable this alert.</p>

          <RadioGroup value={status} onValueChange={(v) => setStatus(v as 'ACTIVE' | 'PAUSED')} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ACTIVE" id="active" className="h-4 w-4 border border-default rounded-full radio-checked" />
              <Label htmlFor="active" className="text-theme-primary label-checked">
                Active
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PAUSED" id="paused" className="h-4 w-4 border border-default rounded-full radio-checked" />
              <Label htmlFor="paused" className="text-theme-primary label-checked">
                Paused
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Rate Difference Thresholds */}
      <PositionConditionEditor
        editorType="comparison"
        actionType={actionType}
        platformName={platform}
        conditions={conditions.map((cond) => ({
          id: cond.id,
          conditionType: actionType === 'SUPPLY' ? 'RATE_DIFF_ABOVE' : 'RATE_DIFF_BELOW',
          severity: cond.severity,
          thresholdValue: cond.thresholdValue,
        }))}
        addCondition={addCondition}
        updateCondition={updateCondition}
        removeCondition={removeCondition}
        errors={{ conditions: errors.conditions }}
      />

      {/* Notification Frequency */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">Notification Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationFrequencySection notificationFrequency={notificationFrequency} setNotificationFrequency={setNotificationFrequency} />
        </CardContent>
      </Card>

      {/* Delivery Channels */}
      <DeliveryChannelsCard
        channels={channels}
        addChannel={addChannel}
        updateChannel={updateChannel}
        removeChannel={removeChannel}
        errors={{ channels: errors.channels }}
        session={session}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-x-5">
        <Button onClick={() => router.push('/alerts/compare-compound')} className="border hover-border-primary">
          <ArrowLeft size={16} className="mr-2" /> Back to Alerts
        </Button>

        <Button onClick={handleUpdateAlert} className="border text-primary-color hover-border-body" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Alert'}
        </Button>
      </div>
    </>
  );
}
