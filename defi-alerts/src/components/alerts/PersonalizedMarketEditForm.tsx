'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Plus, X, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NotificationFrequencySection, DeliveryChannelsCard } from '@/components/alerts';
import { type Channel, type ConditionType, type Alert, type SeverityLevel, type NotificationFrequency, severityOptions } from '@/types/alerts';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PersonalizedMarketEditFormProps {
  alert: Alert;
  alertId: string;
}

interface Condition {
  id: string;
  conditionType: ConditionType;
  severity: SeverityLevel;
  thresholdValue?: string;
  thresholdLow?: string;
  thresholdHigh?: string;
}

export default function PersonalizedMarketEditForm({ alert, alertId }: PersonalizedMarketEditFormProps) {
  const router = useRouter();
  const { data } = useSession();
  const session = data as DoDAOSession;
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const { putData, loading: isSubmitting } = usePutData<Alert, any>({
    successMessage: 'Your personalized alert was updated successfully.',
    errorMessage: "Couldn't update personalized alert",
    redirectPath: '/alerts',
  });

  const [actionType, setActionType] = useState<'SUPPLY' | 'BORROW'>('SUPPLY');
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('ONCE_PER_ALERT');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: session?.username || '' }]);
  const [errors, setErrors] = useState<{ conditions?: string[]; channels?: string[] }>({});

  // Initialize form with alert data
  useEffect(() => {
    if (!alert) return;

    setActionType(alert.actionType);
    setStatus(alert.status);
    setWalletAddress(alert.walletAddress || '');
    setNotificationFrequency(alert.notificationFrequency as NotificationFrequency);

    // Set up conditions
    const alertConditions: Condition[] =
      alert.conditions?.map((condition, index) => ({
        id: `condition-${index}`,
        conditionType: condition.conditionType as ConditionType,
        severity: condition.severity as SeverityLevel,
        thresholdValue: condition.thresholdValue?.toString() || '',
        thresholdLow: condition.thresholdValueLow?.toString() || '',
        thresholdHigh: condition.thresholdValueHigh?.toString() || '',
      })) || [];

    // Ensure at least one condition exists
    if (alertConditions.length === 0) {
      alertConditions.push({
        id: 'condition-1',
        conditionType: 'APR_RISE_ABOVE',
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

  // Get contextual message for condition type
  const getConditionMessage = (conditionType: ConditionType) => {
    switch (conditionType) {
      case 'APR_RISE_ABOVE':
        return 'Alert when APR exceeds your set threshold (e.g., alert when APR goes above 5%)';
      case 'APR_FALLS_BELOW':
        return 'Alert when APR drops under your set threshold (e.g., alert when APR goes below 2%)';
      case 'APR_OUTSIDE_RANGE':
        return 'Alert when APR moves outside your specified range (e.g., alert when APR is below 3% or above 6%)';
      default:
        return 'Select a condition type to see its description';
    }
  };

  // Condition functions
  const addCondition = () => {
    const newCondition: Condition = {
      id: `condition-${Date.now()}`,
      conditionType: 'APR_RISE_ABOVE',
      severity: 'NONE',
      thresholdValue: '',
    };
    setConditions((prev) => [...prev, newCondition]);
  };

  const updateCondition = (id: string, field: keyof Condition, value: string) => {
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
    const conditionsPayload = conditions.map((condition) => {
      if (condition.conditionType === 'APR_OUTSIDE_RANGE') {
        return {
          conditionType: condition.conditionType,
          thresholdValueLow: condition.thresholdLow,
          thresholdValueHigh: condition.thresholdHigh,
          severity: condition.severity,
        };
      } else {
        return {
          conditionType: condition.conditionType,
          thresholdValue: condition.thresholdValue,
          severity: condition.severity,
        };
      }
    });

    const payload = {
      actionType,
      walletAddress,
      notificationFrequency,
      selectedChains: chainConnect,
      selectedAssets: assetConnect,
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
        <h1 className="text-3xl font-bold mb-2 text-theme-primary">Edit Personalized Market Alert</h1>
        <p className="text-theme-muted">Update your personalized alert for {actionType === 'SUPPLY' ? 'supply' : 'borrow'} positions.</p>
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
                Chain: {alert.selectedChains?.[0]?.name || 'Unknown'} | Market: {alert.selectedAssets?.[0]?.symbol || 'Unknown'}
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

      {/* Condition Settings */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-lg text-theme-primary">Condition Settings</CardTitle>
            <Button size="sm" onClick={addCondition} className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary">
              <Plus size={16} className="mr-1" /> Add Condition
            </Button>
          </div>
          <p className="text-sm text-theme-muted">
            Define when you want to be alerted about changes to this position. You will receive an alert if any of the set conditions are met.
          </p>
        </CardHeader>
        <CardContent>
          {/* Render each condition */}
          {conditions.map((condition, index) => (
            <div key={condition.id} className="mb-6">
              <div className="mb-4 p-3 bg-theme-secondary rounded-lg border border-theme-primary">
                <p className="text-sm text-theme-muted">
                  <span className="text-primary-color font-medium">Condition {index + 1}:</span> {getConditionMessage(condition.conditionType)}
                </p>
              </div>

              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1 flex items-center text-theme-muted">
                  <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-primary-color">
                    {index + 1}
                  </Badge>
                </div>

                {/* Condition Type */}
                <div className="col-span-3">
                  <Select value={condition.conditionType} onValueChange={(value) => updateCondition(condition.id, 'conditionType', value as ConditionType)}>
                    <SelectTrigger className="w-full hover-border-primary">
                      <SelectValue placeholder="Select condition type" />
                    </SelectTrigger>
                    <SelectContent className="bg-block">
                      <div className="hover-border-primary hover-text-primary">
                        <SelectItem value="APR_RISE_ABOVE">APR rises above threshold</SelectItem>
                      </div>
                      <div className="hover-border-primary hover-text-primary">
                        <SelectItem value="APR_FALLS_BELOW">APR falls below threshold</SelectItem>
                      </div>
                      <div className="hover-border-primary hover-text-primary">
                        <SelectItem value="APR_OUTSIDE_RANGE">APR is outside a range</SelectItem>
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                {/* Threshold Values */}
                {condition.conditionType === 'APR_OUTSIDE_RANGE' ? (
                  <div className="col-span-4 flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        placeholder="Min (e.g., 3)"
                        value={condition.thresholdLow || ''}
                        onChange={(e) => updateCondition(condition.id, 'thresholdLow', e.target.value)}
                        className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                          errors.conditions && errors.conditions[index] ? 'border-red-500' : ''
                        }`}
                      />
                      <Input
                        type="text"
                        placeholder="Max (e.g., 6)"
                        value={condition.thresholdHigh || ''}
                        onChange={(e) => updateCondition(condition.id, 'thresholdHigh', e.target.value)}
                        className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                          errors.conditions && errors.conditions[index] ? 'border-red-500' : ''
                        }`}
                      />
                      <span className="text-theme-muted whitespace-nowrap flex-shrink-0">APR</span>
                    </div>
                    {errors.conditions && errors.conditions[index] && (
                      <div className="mt-1 flex items-center text-red-500 text-sm">
                        <AlertCircle size={14} className="mr-1" />
                        <span>{errors.conditions[index]}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="col-span-4 flex flex-col">
                    <div className="flex items-center">
                      <Input
                        type="text"
                        placeholder={
                          condition.conditionType === 'APR_RISE_ABOVE'
                            ? 'Threshold (e.g., 5.0)'
                            : condition.conditionType === 'APR_FALLS_BELOW'
                            ? 'Threshold (e.g., 2.0)'
                            : 'Threshold value'
                        }
                        value={condition.thresholdValue || ''}
                        onChange={(e) => updateCondition(condition.id, 'thresholdValue', e.target.value)}
                        className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                          errors.conditions && errors.conditions[index] ? 'border-red-500' : ''
                        }`}
                      />
                      <span className="ml-2 text-theme-muted whitespace-nowrap flex-shrink-0">APR</span>
                    </div>
                    {errors.conditions && errors.conditions[index] && (
                      <div className="mt-1 flex items-center text-red-500 text-sm">
                        <AlertCircle size={14} className="mr-1" />
                        <span>{errors.conditions[index]}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Severity */}
                <div className="col-span-3 flex items-center">
                  <Select
                    value={condition.severity === 'NONE' ? undefined : condition.severity}
                    onValueChange={(value) => updateCondition(condition.id, 'severity', value as SeverityLevel)}
                  >
                    <SelectTrigger className="w-full hover-border-primary">
                      <SelectValue placeholder="Severity Level" />
                    </SelectTrigger>
                    <SelectContent className="bg-block">
                      {severityOptions.map((opt) => (
                        <div key={opt.value} className="hover-border-primary hover-text-primary">
                          <SelectItem value={opt.value}>{opt.label}</SelectItem>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" className="h-8 w-8 p-0 ml-1 hover-text-primary">
                          <Info size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-block p-3 border border-theme-primary">
                        <p className="text-sm">
                          Severity level is used for visual indication only. It helps you categorize alerts by importance but does not affect notification
                          delivery or priority.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Remove */}
                {conditions.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeCondition(condition.id)} className="col-span-1 text-red-500 h-8 w-8">
                    <X size={16} />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <hr className="my-6" />

          {/* Notification Frequency */}
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
        <Button onClick={() => router.push('/alerts')} className="border hover-border-primary">
          <ArrowLeft size={16} className="mr-2" /> Back to Alerts
        </Button>

        <Button onClick={handleUpdateAlert} className="border text-primary-color hover-border-body" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Alert'}
        </Button>
      </div>
    </>
  );
}
