'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Plus, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NotificationFrequencySection, DeliveryChannelsCard } from '@/components/alerts';
import { type Condition, type Channel, type ConditionType, type SeverityLevel, type NotificationFrequency, severityOptions, type Alert } from '@/types/alerts';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { CHAINS, COMPOUND_MARKETS } from '@/shared/web3/config';

interface CompoundMarketEditFormProps {
  alert: Alert;
  alertId: string;
}

export default function CompoundMarketEditForm({ alert, alertId }: CompoundMarketEditFormProps) {
  const router = useRouter();
  const { data } = useSession();
  const session = data as DoDAOSession;
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const { putData, loading: isSubmitting } = usePutData<Alert, any>({
    successMessage: 'Your market alert was updated successfully.',
    errorMessage: "Couldn't update alert",
    redirectPath: '/alerts',
  });

  const [alertType, setAlertType] = useState<'borrow' | 'supply'>('borrow');
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('ONCE_PER_ALERT');
  const [conditions, setConditions] = useState<Condition[]>([{ conditionType: 'APR_RISE_ABOVE', thresholdValue: '', severity: 'NONE' }]);
  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: session?.username || '' }]);
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');

  // Validation errors
  const [errors, setErrors] = useState<{
    chains?: string;
    markets?: string;
    conditions?: string[];
    channels?: string[];
  }>({});

  // Initialize form with alert data
  useEffect(() => {
    if (!alert) return;

    // Set alert type
    setAlertType(alert.actionType.toLowerCase() as 'borrow' | 'supply');

    // Set selected chains
    setSelectedChains(alert.selectedChains?.map((chain) => chain.name) || []);

    // Set selected markets
    setSelectedMarkets(alert.selectedAssets?.map((asset) => (asset.symbol === 'WETH' ? 'ETH' : asset.symbol)) || []);

    // Set notification frequency
    setNotificationFrequency(alert.notificationFrequency as NotificationFrequency);

    // Set conditions
    if (alert.conditions?.length) {
      setConditions(
        alert.conditions.map((c) => ({
          conditionType: c.conditionType,
          thresholdValue: c.thresholdValue?.toString() || '',
          thresholdLow: c.thresholdValueLow?.toString() || '',
          thresholdHigh: c.thresholdValueHigh?.toString() || '',
          severity: c.severity as SeverityLevel,
        }))
      );
    }

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

    // Set status
    setStatus(alert.status);
  }, [alert, session?.username]);

  const toggleChain = (chain: string) => {
    setSelectedChains((cs) => (cs.includes(chain) ? cs.filter((c) => c !== chain) : [...cs, chain]));
    if (errors.chains) {
      setErrors((prev) => ({ ...prev, chains: undefined }));
    }
  };

  const toggleMarket = (market: string) => {
    setSelectedMarkets((ms) => (ms.includes(market) ? ms.filter((m) => m !== market) : [...ms, market]));
    if (errors.markets) {
      setErrors((prev) => ({ ...prev, markets: undefined }));
    }
  };

  const updateCondition = (i: number, field: keyof Condition, val: string) => {
    setConditions((cs) => cs.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));

    // Clear validation error if it exists
    if (errors.conditions && errors.conditions[i]) {
      const newConditionErrors = [...errors.conditions];
      newConditionErrors[i] = '';

      if (newConditionErrors.every((err) => !err)) {
        setErrors((prev) => ({ ...prev, conditions: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, conditions: newConditionErrors }));
      }
    }
  };

  const addChannel = () => setChannels((ch) => [...ch, { channelType: 'EMAIL', email: session?.username || '' }]);

  const updateChannel = (i: number, field: keyof Channel, val: string) => setChannels((ch) => ch.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));

  const removeChannel = (i: number) => setChannels((ch) => ch.filter((_, idx) => idx !== i));

  const handleUpdateAlert = async () => {
    if (selectedChains.length === 0) {
      setErrors((prev) => ({ ...prev, chains: 'Please select at least one chain' }));
      showNotification({ type: 'error', heading: 'Missing Chains', message: 'Please select at least one chain.' });
      return;
    }

    if (selectedMarkets.length === 0) {
      setErrors((prev) => ({ ...prev, markets: 'Please select at least one market' }));
      showNotification({ type: 'error', heading: 'Missing Markets', message: 'Please select at least one market.' });
      return;
    }

    // Conditions: must have thresholds & severities
    const conditionErrors: string[] = [];
    for (let i = 0; i < conditions.length; i++) {
      const c = conditions[i];
      if (c.conditionType === 'APR_OUTSIDE_RANGE') {
        if (!c.thresholdLow || !c.thresholdHigh) {
          conditionErrors[i] = 'Both min and max thresholds are required';
        } else if (isNaN(Number(c.thresholdLow)) || isNaN(Number(c.thresholdHigh))) {
          conditionErrors[i] = 'Min and max thresholds must be valid numbers';
        }
      } else {
        if (!c.thresholdValue) {
          conditionErrors[i] = 'Threshold value is required';
        } else if (isNaN(Number(c.thresholdValue))) {
          conditionErrors[i] = 'Threshold value must be a valid number';
        }
      }
    }

    // Channels: email must have email, webhook must have URL
    const channelErrors: string[] = [];
    for (let i = 0; i < channels.length; i++) {
      const d = channels[i];
      if (d.channelType === 'EMAIL' && !d.email) {
        channelErrors[i] = 'Email address is required';
      } else if (d.channelType === 'EMAIL' && d.email) {
        const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRx.test(d.email)) {
          channelErrors[i] = 'Invalid email address';
        }
      }
      if (d.channelType === 'WEBHOOK' && !d.webhookUrl) {
        channelErrors[i] = 'Webhook URL is required';
      } else if (d.channelType === 'WEBHOOK' && d.webhookUrl) {
        try {
          new URL(d.webhookUrl);
        } catch {
          channelErrors[i] = 'Invalid webhook URL';
        }
      }
    }

    // Set all errors at once
    const newErrors: typeof errors = {};
    if (conditionErrors.some((err) => err)) {
      newErrors.conditions = conditionErrors;
    }
    if (channelErrors.some((err) => err)) {
      newErrors.channels = channelErrors;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors in the form before submitting',
      });
      return;
    }

    // a) chains → [{ chainId }]
    let chainConnect: { chainId: number }[];
    try {
      chainConnect = selectedChains.map((name) => {
        const cfg = CHAINS.find((c) => c.name === name);
        if (!cfg) throw new Error(`Unsupported chain: ${name}`);
        return { chainId: cfg.chainId };
      });
    } catch (err: any) {
      showNotification({ type: 'error', heading: 'Chain Error', message: err.message });
      return;
    }

    // b) assets → [{ chainId_address }]
    //    pair each selectedMarket with each chain
    const assetConnect = selectedChains.flatMap((chainName) => {
      const chainCfg = CHAINS.find((c) => c.name === chainName)!;
      return selectedMarkets
        .map((uiSym) => {
          const symbol = uiSym === 'ETH' ? 'WETH' : uiSym;
          const m = COMPOUND_MARKETS.find((m) => m.chainId === chainCfg.chainId && m.symbol === symbol);
          if (!m) return null;
          return { chainId_address: `${m.chainId}_${m.baseAssetAddress.toLowerCase()}` };
        })
        .filter((x): x is { chainId_address: string } => x !== null);
    });

    if (assetConnect.length === 0) {
      showNotification({
        type: 'error',
        heading: 'No Valid Markets',
        message: "Your selected chains + markets combination isn't supported.",
      });
      return;
    }

    const payload = {
      actionType: alertType.toUpperCase(),
      notificationFrequency,
      selectedChains: chainConnect,
      selectedAssets: assetConnect,
      conditions: conditions.map((c) => {
        if (c.conditionType === 'APR_OUTSIDE_RANGE') {
          return {
            conditionType: c.conditionType,
            // only send low/high for range
            thresholdValueLow: c.thresholdLow!,
            thresholdValueHigh: c.thresholdHigh!,
            severity: c.severity,
          };
        } else {
          return {
            conditionType: c.conditionType,
            // only send the single‐value field
            thresholdValue: c.thresholdValue!,
            severity: c.severity,
          };
        }
      }),
      deliveryChannels: channels.map((c) => ({
        channelType: c.channelType,
        email: c.channelType === 'EMAIL' ? c.email : undefined,
        webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
      })),
      walletAddress: alert.walletAddress,
      status,
    };

    await putData(`${baseUrl}/api/alerts/${alertId}`, payload);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-theme-primary">Edit Market Alert</h1>
        <p className="text-theme-muted">Update your market alert settings.</p>
      </div>

      {/* Alert Type */}
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

      {/* Status */}
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
          <p className="text-sm text-theme-muted mb-4">
            Define the conditions when you want to be alerted about market changes. You will receive an alert if any of the set conditions are met.
          </p>

          {/* Conditions List */}
          {conditions.map((cond, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 mb-4 items-center border-t border-primary-color pt-4">
              <div className="col-span-1 flex items-center text-theme-muted">
                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-primary-color">
                  {i + 1}
                </Badge>
              </div>

              {/* Type */}
              <div className="col-span-4">
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
                <div className="col-span-3 flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Min (e.g., 3)"
                    value={cond.thresholdLow || ''}
                    onChange={(e) => updateCondition(i, 'thresholdLow', e.target.value)}
                    className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                      errors.conditions && errors.conditions[i] ? 'border-red-500' : ''
                    }`}
                  />
                  <Input
                    type="text"
                    placeholder="Max (e.g., 6)"
                    value={cond.thresholdHigh || ''}
                    onChange={(e) => updateCondition(i, 'thresholdHigh', e.target.value)}
                    className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                      errors.conditions && errors.conditions[i] ? 'border-red-500' : ''
                    }`}
                  />
                  <span className="text-theme-muted">%</span>
                </div>
              ) : (
                <div className="col-span-3 flex items-center">
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
                  <span className="ml-2 text-theme-muted">%</span>
                </div>
              )}

              {/* Severity */}
              <div className="col-span-3">
                <Select
                  value={cond.severity}
                  onValueChange={(value) => setConditions((cs) => cs.map((c, idx) => (idx === i ? { ...c, severity: value as SeverityLevel } : c)))}
                >
                  <SelectTrigger className="w-full hover-border-primary">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-block">
                    {severityOptions.map((opt) => (
                      <div key={opt.value} className="hover-border-primary hover-text-primary">
                        <SelectItem value={opt.value}>{opt.label}</SelectItem>
                      </div>
                    ))}
                  </SelectContent>
                </Select>
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

            // {errors.conditions && errors.conditions[i] && (
            //   <div className="mt-2 flex items-center text-red-500 text-sm">
            //     <AlertCircle size={16} className="mr-1" />
            //     <span>{errors.conditions[i]}</span>
            //   </div>
            // )}
          ))}

          <hr className="my-6" />

          {/* Notification Frequency */}
          <NotificationFrequencySection notificationFrequency={notificationFrequency} setNotificationFrequency={setNotificationFrequency} />
        </CardContent>
      </Card>

      {/* Delivery Channel Settings */}
      <DeliveryChannelsCard
        channels={channels}
        addChannel={addChannel}
        updateChannel={updateChannel}
        removeChannel={removeChannel}
        session={session}
        errors={{ channels: errors.channels }}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-x-5">
        <Button onClick={() => router.push('/alerts')} className="border hover-border-primary">
          <ArrowLeft size={16} className="mr-2" /> Back to Alerts
        </Button>

        <div className="space-x-4">
          <Button onClick={handleUpdateAlert} className="border text-primary-color hover-border-body" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Alert'}
          </Button>
        </div>
      </div>
    </>
  );
}
