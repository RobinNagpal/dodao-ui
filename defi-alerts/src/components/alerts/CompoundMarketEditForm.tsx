'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  type Condition,
  type Channel,
  type ConditionType,
  type SeverityLevel,
  type NotificationFrequency,
  severityOptions,
  frequencyOptions,
  type Alert,
} from '@/types/alerts';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { CHAINS, COMPOUND_MARKETS } from '@/shared/web3/config';

interface CompoundMarketEditFormProps {
  alert: Alert;
  alertId: string;
}

export default function CompoundMarketEditForm({ alert, alertId }: CompoundMarketEditFormProps) {
  const router = useRouter();
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
  const [notificationFrequency, setNotificationFrequency] = useState<string>('ONCE_PER_ALERT');
  const [conditions, setConditions] = useState<Condition[]>([{ conditionType: 'APR_RISE_ABOVE', thresholdValue: '', severity: 'NONE' }]);
  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: '' }]);
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');

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
    setNotificationFrequency(alert.notificationFrequency);

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
          email: c.email || '',
          webhookUrl: c.webhookUrl || '',
        }))
      );
    }

    // Set status
    setStatus(alert.status);
  }, [alert]);

  const toggleChain = (chain: string) => setSelectedChains((cs) => (cs.includes(chain) ? cs.filter((c) => c !== chain) : [...cs, chain]));
  const toggleMarket = (market: string) => setSelectedMarkets((ms) => (ms.includes(market) ? ms.filter((m) => m !== market) : [...ms, market]));

  const updateCondition = (i: number, field: keyof Condition, val: string) =>
    setConditions((cs) => cs.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));

  const addChannel = () => setChannels((ch) => [...ch, { channelType: 'EMAIL', email: '' }]);

  const updateChannel = (i: number, field: keyof Channel, val: string) => setChannels((ch) => ch.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));

  const removeChannel = (i: number) => setChannels((ch) => ch.filter((_, idx) => idx !== i));

  const handleUpdateAlert = async () => {
    if (selectedChains.length === 0) {
      showNotification({ type: 'error', heading: 'Missing Chains', message: 'Please select at least one chain.' });
      return;
    }

    if (selectedMarkets.length === 0) {
      showNotification({ type: 'error', heading: 'Missing Markets', message: 'Please select at least one market.' });
      return;
    }

    // Conditions: must have thresholds & severities
    for (let i = 0; i < conditions.length; i++) {
      const c = conditions[i];
      if (c.conditionType === 'APR_OUTSIDE_RANGE') {
        if (!c.thresholdLow || !c.thresholdHigh) {
          showNotification({ type: 'error', heading: 'Incomplete Condition', message: `Condition #${i + 1} needs both min & max.` });
          return;
        }
      } else {
        if (!c.thresholdValue) {
          showNotification({ type: 'error', heading: 'Incomplete Condition', message: `Condition #${i + 1} needs a threshold value.` });
          return;
        }
      }
    }

    // Channels: email must have email, webhook must have URL
    for (let i = 0; i < channels.length; i++) {
      const d = channels[i];
      if (d.channelType === 'EMAIL' && !d.email) {
        showNotification({ type: 'error', heading: 'Missing Email', message: `Channel #${i + 1} needs an email address.` });
        return;
      }
      if (d.channelType === 'WEBHOOK' && !d.webhookUrl) {
        showNotification({ type: 'error', heading: 'Missing Webhook URL', message: `Channel #${i + 1} needs a webhook URL.` });
        return;
      }
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
                    }`}
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
                      }`}
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
                    placeholder="Min"
                    value={cond.thresholdLow || ''}
                    onChange={(e) => updateCondition(i, 'thresholdLow', e.target.value)}
                    className="border-theme-primary focus-border-primary focus:outline-none transition-colors"
                  />
                  <Input
                    type="text"
                    placeholder="Max"
                    value={cond.thresholdHigh || ''}
                    onChange={(e) => updateCondition(i, 'thresholdHigh', e.target.value)}
                    className="border-theme-primary focus-border-primary focus:outline-none transition-colors"
                  />
                  <span className="text-theme-muted">%</span>
                </div>
              ) : (
                <div className="col-span-3 flex items-center">
                  <Input
                    type="text"
                    placeholder="Value"
                    value={cond.thresholdValue || ''}
                    onChange={(e) => updateCondition(i, 'thresholdValue', e.target.value)}
                    className="border-theme-primary focus-border-primary focus:outline-none transition-colors"
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
            <p className="text-sm text-theme-muted mt-4">Note: This limits how often you’ll receive notifications for this alert.</p>
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
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={ch.email || ''}
                  onChange={(e) => updateChannel(i, 'email', e.target.value)}
                  className="flex-1 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                />
              ) : (
                <Input
                  type="url"
                  placeholder="https://webhook.site/..."
                  value={ch.webhookUrl || ''}
                  onChange={(e) => updateChannel(i, 'webhookUrl', e.target.value)}
                  className="flex-1 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                />
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
