'use client';

import { AlertCreationResponse, CreateCompoundAlertPayload } from '@/app/api/alerts/create/compound-market/route';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  type Channel,
  type Condition,
  type ConditionType,
  frequencyOptions,
  type NotificationFrequency,
  type SeverityLevel,
  severityOptions,
} from '@/types/alerts';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
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
import { AlertCircle, ArrowLeft, Bell, ChevronRight, Home, Info, Plus, TrendingUp, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function CompoundMarketAlertPage() {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();
  const { data: session } = useSession();

  const user = session?.user! as DoDaoJwtTokenPayload;
  const { postData, loading: isSubmitting } = usePostData<AlertCreationResponse, CreateCompoundAlertPayload>({
    successMessage: 'Your market alert was saved successfully.',
    errorMessage: "Couldn't create alert",
    redirectPath: '/alerts',
  });

  const [alertType, setAlertType] = useState<'borrow' | 'supply'>('borrow');
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [notificationFrequency, setNotificationFrequency] = useState<string>('ONCE_PER_ALERT');

  const [conditions, setConditions] = useState<Condition[]>([{ conditionType: 'APR_RISE_ABOVE', thresholdValue: '', severity: 'NONE' }]);

  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: '' }]);

  // Initialize email field with username when component mounts
  useEffect(() => {
    if (user?.username) {
      setChannels((ch) => ch.map((channel) => (channel.channelType === 'EMAIL' ? { ...channel, email: user.username } : channel)));
    }
  }, [user?.username]);

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
    if (user?.username) {
      setChannels((ch) => ch.map((channel) => (channel.channelType === 'EMAIL' ? { ...channel, email: user.username } : channel)));
    }
  }, [channels.map((c) => c.channelType).join(','), user?.username]);

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

  const addChannel = () => setChannels((ch) => [...ch, { channelType: 'EMAIL', email: user?.username || '' }]);

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
        <span className="text-primary-color font-medium">Compound Market</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-theme-primary">Create Market Alert</h1>
        <p className="text-theme-muted">Configure a new market alert with your preferred settings.</p>
      </div>

      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">Alert Type</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-theme-muted mb-4">Choose the type of alert you want to create.</p>

          <RadioGroup value={alertType} onValueChange={(v) => setAlertType(v as 'borrow' | 'supply')} className="space-y-2">
            {['borrow', 'supply'].map((opt) => (
              <div key={opt} className="flex items-center space-x-2">
                <RadioGroupItem value={opt} id={opt} className="h-4 w-4 border border-default rounded-full radio-checked" />
                <Label htmlFor={opt} className="text-theme-primary label-checked">
                  {opt === 'borrow' ? 'Borrow Alert' : 'Supply Alert'}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Market Selection */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">Market Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">Select the chains and markets you want to monitor.</p>

          <div className="mb-6">
            <h3 className="text-md font-medium mb-1 text-theme-primary">Chains</h3>
            <p className="text-sm text-theme-muted mb-3">Select one or more chains to monitor.</p>

            {/* Chains */}
            <div className="flex flex-wrap gap-3">
              {['Ethereum', 'Optimism', 'Arbitrum', 'Polygon', 'Base', 'Unichain', 'Ronin', 'Mantle', 'Scroll'].map((chain) => {
                const isSel = selectedChains.includes(chain);

                return (
                  <div
                    key={chain}
                    onClick={() => toggleChain(chain)}
                    className={`rounded-md px-3 py-2 flex items-center cursor-pointer transition-colors border ${
                      isSel ? 'chip-selected' : 'border-theme-primary'
                    } ${errors.chains ? 'border-red-500' : ''}`}
                  >
                    <div className="chip-checkbox w-4 h-4 rounded border mr-2 flex items-center justify-center">
                      {isSel && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 1L3.5 6.5L1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    <span className="text-theme-primary chip-label">{chain}</span>
                  </div>
                );
              })}
            </div>
            {errors.chains && (
              <div className="mt-2 flex items-center text-red-500 text-sm">
                <AlertCircle size={16} className="mr-1" />
                <span>{errors.chains}</span>
              </div>
            )}
          </div>

          {/* Markets */}
          <div>
            <div>
              <h3 className="text-md font-medium mb-1 text-theme-primary">Markets</h3>
              <p className="text-sm text-theme-muted mb-3">Select one or more markets to monitor.</p>

              <div className="flex flex-wrap gap-3">
                {['USDC', 'USDS', 'USDT', 'ETH', 'wstETH', 'USDe', 'USDC.e', 'USDbC', 'AERO'].map((market) => {
                  const isSel = selectedMarkets.includes(market);

                  return (
                    <div
                      key={market}
                      onClick={() => toggleMarket(market)}
                      className={`rounded-md px-3 py-2 flex items-center cursor-pointer transition-colors border ${
                        isSel ? 'chip-selected' : 'border-theme-primary'
                      } ${errors.markets ? 'border-red-500' : ''}`}
                    >
                      <div className="chip-checkbox w-4 h-4 rounded border mr-2 flex items-center justify-center">
                        {isSel && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 1L3.5 6.5L1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      <span className="text-theme-primary chip-label">{market}</span>
                    </div>
                  );
                })}
              </div>
              {errors.markets && (
                <div className="mt-2 flex items-center text-red-500 text-sm">
                  <AlertCircle size={16} className="mr-1" />
                  <span>{errors.markets}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condition Settings */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-theme-primary">Condition Settings</CardTitle>
          <Button
            size="sm"
            onClick={() => setConditions((cs) => [...cs, { conditionType: 'APR_RISE_ABOVE', severity: 'NONE' }])}
            className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary"
          >
            <Plus size={16} className="mr-1" /> Add Condition
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">Define when you want to be alerted about market changes.</p>

          {/* Condition Type Explanations */}
          <div className="mb-6 p-4 bg-theme-secondary rounded-lg border border-theme-primary">
            <h4 className="text-sm font-medium text-theme-primary mb-3">Available Condition Types:</h4>
            <div className="space-y-2 text-sm text-theme-muted">
              <div className="flex items-start gap-2">
                <span className="text-primary-color font-medium min-w-[140px]">Rise Above:</span>
                <span>Alert when APR exceeds your threshold (e.g., alert when APR goes above 5%)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-color font-medium min-w-[140px]">Fall Below:</span>
                <span>Alert when APR drops under your threshold (e.g., alert when APR goes below 2%)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-color font-medium min-w-[140px]">Outside Range:</span>
                <span>Alert when APR moves outside your specified range (e.g., alert when APR is below 2% or above 6%)</span>
              </div>
            </div>
          </div>

          {/* Conditions List */}
          {conditions.map((cond, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 mb-4 items-center border-t border-primary-color pt-4">
              <div className="col-span-1 flex items-center text-theme-muted">
                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-primary-color">
                  {i + 1}
                </Badge>
              </div>

              {/* Type */}
              <div className="col-span-3">
                <Select
                  value={cond.conditionType}
                  onValueChange={(value) =>
                    setConditions((cs) =>
                      cs.map((c, idx) =>
                        idx === i
                          ? {
                              ...c,
                              conditionType: value as ConditionType,
                            }
                          : c
                      )
                    )
                  }
                >
                  <SelectTrigger className="w-full hover-border-primary">
                    <SelectValue placeholder="Select condition type" />
                  </SelectTrigger>
                  <SelectContent className="bg-block">
                    <div className="hover-border-primary hover-text-primary">
                      <SelectItem value="APR_RISE_ABOVE" className="hover:text-primary-color">
                        APR rises above threshold
                      </SelectItem>
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

              {/* Thresholds */}
              {cond.conditionType === 'APR_OUTSIDE_RANGE' ? (
                <div className="col-span-4 flex flex-col">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Min"
                      value={cond.thresholdLow || ''}
                      onChange={(e) => updateCondition(i, 'thresholdLow', e.target.value)}
                      className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                        errors.conditions && errors.conditions[i] ? 'border-red-500' : ''
                      }`}
                    />
                    <Input
                      type="text"
                      placeholder="Max"
                      value={cond.thresholdHigh || ''}
                      onChange={(e) => updateCondition(i, 'thresholdHigh', e.target.value)}
                      className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                        errors.conditions && errors.conditions[i] ? 'border-red-500' : ''
                      }`}
                    />
                    <span className="text-theme-muted whitespace-nowrap flex-shrink-0">% APR</span>
                  </div>
                  {errors.conditions && errors.conditions[i] && (
                    <div className="mt-1 flex items-center text-red-500 text-sm">
                      <AlertCircle size={14} className="mr-1" />
                      <span>{errors.conditions[i]}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="col-span-4 flex flex-col">
                  <div className="flex items-center">
                    <Input
                      type="text"
                      placeholder={
                        cond.conditionType === 'APR_RISE_ABOVE'
                          ? 'Threshold (e.g., 5.0)'
                          : cond.conditionType === 'APR_FALLS_BELOW'
                          ? 'Threshold (e.g., 2.0)'
                          : 'Threshold value'
                      }
                      value={cond.thresholdValue || ''}
                      onChange={(e) => updateCondition(i, 'thresholdValue', e.target.value)}
                      className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                        errors.conditions && errors.conditions[i] ? 'border-red-500' : ''
                      }`}
                    />
                    <span className="ml-2 text-theme-muted whitespace-nowrap flex-shrink-0">% APR</span>
                  </div>
                  {errors.conditions && errors.conditions[i] && (
                    <div className="mt-1 flex items-center text-red-500 text-sm">
                      <AlertCircle size={14} className="mr-1" />
                      <span>{errors.conditions[i]}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Severity */}
              <div className="col-span-3 flex items-center">
                <Select
                  value={cond.severity === 'NONE' ? undefined : cond.severity}
                  onValueChange={(value) => setConditions((cs) => cs.map((c, idx) => (idx === i ? { ...c, severity: value as SeverityLevel } : c)))}
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
                        Severity level is used for visual indication only. It helps you categorize alerts by importance but doesn’t affect notification delivery
                        or priority.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Remove */}
              {conditions.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConditions((cs) => cs.filter((_, idx) => idx !== i))}
                  className="col-span-1 text-red-500 h-8 w-8"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          ))}

          {/* Notification Frequency */}
          <div className="mt-6">
            <Label htmlFor="frequency" className="block text-sm font-medium mb-2 text-theme-primary">
              Notification Frequency
            </Label>
            <Select value={notificationFrequency} onValueChange={(value) => setNotificationFrequency(value as NotificationFrequency)}>
              <SelectTrigger className="w-full hover-border-primary" id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent className="bg-block">
                {frequencyOptions.map((opt) => (
                  <div key={opt.value} className="hover-border-primary hover-text-primary">
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  </div>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-theme-muted mt-4">
              This limits how often you’ll receive notifications for this alert, regardless of how many thresholds are triggered.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Channel Settings */}
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
              <Select
                value={ch.channelType}
                onValueChange={(value) => {
                  updateChannel(i, 'channelType', value as Channel['channelType']);
                  if (value === 'EMAIL' && user?.username) {
                    updateChannel(i, 'email', user.username);
                  }
                }}
              >
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

              <div className="flex-1 flex flex-col">
                {ch.channelType === 'EMAIL' ? (
                  <>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={ch.email || ''}
                      onChange={(e) => updateChannel(i, 'email', e.target.value)}
                      readOnly={true}
                      className={`flex-1 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                        errors.channels && errors.channels[i] ? 'border-red-500' : ''
                      } ${ch.channelType === 'EMAIL' ? 'bg-block' : ''}`}
                    />
                    {errors.channels && errors.channels[i] && (
                      <div className="mt-1 flex items-center text-red-500 text-sm">
                        <AlertCircle size={14} className="mr-1" />
                        <span>{errors.channels[i]}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>

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

        <div className="space-x-4">
          <Button onClick={handleCreateAlert} className="border text-primary-color hover-border-body" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Alert'}
          </Button>
        </div>
      </div>
    </div>
  );
}
