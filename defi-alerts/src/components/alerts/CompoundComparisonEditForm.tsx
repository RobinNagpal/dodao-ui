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
import { type Channel, type Alert, type SeverityLevel, type NotificationFrequency, severityOptions, type GeneralComparisonRow } from '@/types/alerts';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { validateMarketCombinations } from '@/utils/clientValidationUtils';
import { CHAINS, COMPOUND_MARKETS } from '@/shared/web3/config';

interface CompoundComparisonEditFormProps {
  alert: Alert;
  alertId: string;
}

export default function CompoundComparisonEditForm({ alert, alertId }: CompoundComparisonEditFormProps) {
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

  const [alertType, setAlertType] = useState<'supply' | 'borrow'>('supply');
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('ONCE_PER_ALERT');

  // For thresholds
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

  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: session?.username || '' }]);

  // Validation errors
  const [errors, setErrors] = useState<{
    platforms?: string;
    chains?: string;
    markets?: string;
    thresholds?: string[];
    channels?: string[];
  }>({});

  // Initialize form with alert data
  useEffect(() => {
    if (!alert) return;

    // Set alert type
    setAlertType(alert.actionType.toLowerCase() as 'supply' | 'borrow');
    setStatus(alert.status as 'ACTIVE' | 'PAUSED');

    // Set selected platforms
    if (alert.compareProtocols?.length) {
      setSelectedPlatforms(alert.compareProtocols);
    }

    // Set selected chains
    if (alert.selectedChains?.length) {
      setSelectedChains(alert.selectedChains.map((chain) => chain.name));
    }

    // Set selected markets
    if (alert.selectedAssets?.length) {
      setSelectedMarkets(alert.selectedAssets.map((asset) => (asset.symbol === 'WETH' ? 'ETH' : asset.symbol)));
    }

    // Set notification frequency
    setNotificationFrequency(alert.notificationFrequency as NotificationFrequency);

    // Set thresholds
    if (alert.conditions?.length) {
      setThresholds(
        alert.conditions.map((c) => ({
          platform: alert.compareProtocols?.[0] || '',
          chain: alert.selectedChains?.[0]?.name || '',
          market: alert.selectedAssets?.[0]?.symbol || '',
          threshold: c.thresholdValue?.toString() || '',
          severity: c.severity as SeverityLevel,
          frequency: alert.notificationFrequency as NotificationFrequency,
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
  }, [alert, session?.username]);

  // Toggle functions
  const togglePlatform = (p: string) => {
    setSelectedPlatforms((ps) => (ps.includes(p) ? ps.filter((x) => x !== p) : [...ps, p]));
    if (errors.platforms) {
      setErrors((prev) => ({ ...prev, platforms: undefined }));
    }
  };

  const toggleChain = (c: string) => {
    const newChains = selectedChains.includes(c) ? selectedChains.filter((x) => x !== c) : [...selectedChains, c];
    setSelectedChains(newChains);

    // Clear chain validation error
    if (errors.chains) {
      setErrors((prev) => ({ ...prev, chains: undefined }));
    }

    // Validate market combinations when chains change
    if (newChains.length > 0 && selectedMarkets.length > 0) {
      const validation = validateMarketCombinations(newChains, selectedMarkets);
      if (!validation.isValid && errors.markets) {
        setErrors((prev) => ({ ...prev, markets: undefined }));
      }
    }
  };

  const toggleMarket = (m: string) => {
    const newMarkets = selectedMarkets.includes(m) ? selectedMarkets.filter((x) => x !== m) : [...selectedMarkets, m];
    setSelectedMarkets(newMarkets);

    // Clear market validation error
    if (errors.markets) {
      setErrors((prev) => ({ ...prev, markets: undefined }));
    }

    // Validate market combinations when markets change
    if (selectedChains.length > 0 && newMarkets.length > 0) {
      const validation = validateMarketCombinations(selectedChains, newMarkets);
      if (!validation.isValid && errors.markets) {
        setErrors((prev) => ({ ...prev, markets: undefined }));
      }
    }
  };

  // Threshold functions
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

    // Clear validation error if it exists
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

  // Channel functions
  const addChannel = () => setChannels((ch) => [...ch, { channelType: 'EMAIL', email: session?.username || '' }]);

  const updateChannel = (idx: number, field: keyof Channel, val: string) => {
    setChannels((ch) => ch.map((c, i) => (i === idx ? { ...c, [field]: val } : c)));
  };

  const removeChannel = (idx: number) => setChannels((ch) => ch.filter((_, i) => i !== idx));

  // Validate form
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

    // Validate compound market combinations
    if (selectedChains.length > 0 && selectedMarkets.length > 0) {
      const validation = validateMarketCombinations(selectedChains, selectedMarkets);
      if (!validation.isValid) {
        newErrors.markets = 'Selected chain and market combination is not supported by Compound. Please choose a valid combination.';
      }
    }

    // Validate thresholds
    const thresholdErrors: string[] = [];
    thresholds.forEach((threshold, index) => {
      if (!threshold.threshold || isNaN(Number(threshold.threshold))) {
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

  // Submit function
  const handleUpdateAlert = async () => {
    if (!validateForm()) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors in the form before submitting',
      });
      return;
    }

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

    // Prepare conditions from thresholds
    const conditions = thresholds.map((threshold) => ({
      conditionType: alertType === 'supply' ? 'RATE_DIFF_ABOVE' : 'RATE_DIFF_BELOW',
      thresholdValue: threshold.threshold,
      severity: threshold.severity,
    }));

    const payload = {
      actionType: alertType.toUpperCase(),
      status,
      isComparison: true,
      notificationFrequency,
      selectedChains: chainConnect,
      selectedAssets: assetConnect,
      compareProtocols: selectedPlatforms,
      conditions,
      deliveryChannels: channels.map((c) => ({
        channelType: c.channelType,
        email: c.channelType === 'EMAIL' ? c.email : undefined,
        webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
      })),
    };

    await putData(`${baseUrl}/api/alerts/${alertId}`, payload);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-theme-primary">Edit Compound Comparison Alert</h1>
        <p className="text-theme-muted">Update your comparison alert settings to monitor when Compound beats other DeFi platforms.</p>
      </div>

      {/* Alert Type */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">Alert Type</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">Choose the type of alert you want to create.</p>

          <RadioGroup value={alertType} onValueChange={(v) => setAlertType(v as 'supply' | 'borrow')} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="supply" id="supply" className="h-4 w-4 border border-default rounded-full radio-checked" />
              <Label htmlFor="supply" className="text-theme-primary label-checked">
                Supply Comparison (Alert when Compound offers higher rates)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="borrow" id="borrow" className="h-4 w-4 border border-default rounded-full radio-checked" />
              <Label htmlFor="borrow" className="text-theme-primary label-checked">
                Borrow Comparison (Alert when Compound offers lower rates)
              </Label>
            </div>
          </RadioGroup>
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

      {/* Platforms / Chains / Markets */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">Market Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">Select the platforms to compare with and the markets you want to monitor.</p>

          {/* Platforms */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-1 text-theme-primary">Compare With</h3>
            <p className="text-sm text-theme-muted mb-3">Select one or more platforms to compare Compound rates against.</p>

            <div className="flex flex-wrap gap-3">
              {['Aave', 'Morpho', 'Spark'].map((p) => {
                const isSel = selectedPlatforms.includes(p);

                return (
                  <div
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`rounded-md px-3 py-2 flex items-center cursor-pointer transition-colors border ${
                      isSel ? 'chip-selected' : 'border-theme-primary'
                    } ${errors.platforms ? 'border-red-500' : ''}`}
                  >
                    <div className="chip-checkbox w-4 h-4 rounded border mr-2 flex items-center justify-center">
                      {isSel && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 1L3.5 6.5L1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-theme-primary chip-label">{p}</span>
                  </div>
                );
              })}
            </div>
            {errors.platforms && (
              <div className="mt-2 flex items-center text-red-500 text-sm">
                <AlertCircle size={16} className="mr-1" />
                <span>{errors.platforms}</span>
              </div>
            )}
          </div>

          {/* Chains */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-1 text-theme-primary">Chains</h3>
            <p className="text-sm text-theme-muted mb-3">Select one or more chains to monitor.</p>

            <div className="flex flex-wrap gap-3">
              {['Ethereum', 'Optimism', 'Arbitrum', 'Polygon', 'Base', 'Unichain', 'Ronin', 'Mantle', 'Scroll'].map((c) => {
                const isSel = selectedChains.includes(c);

                return (
                  <div
                    key={c}
                    onClick={() => toggleChain(c)}
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
                    <span className="text-theme-primary chip-label">{c}</span>
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
            <h3 className="text-md font-medium mb-1 text-theme-primary">Markets</h3>
            <p className="text-sm text-theme-muted mb-3">Select one or more markets to monitor.</p>

            <div className="flex flex-wrap gap-3">
              {['USDC', 'USDS', 'USDT', 'ETH', 'wstETH', 'USDe', 'USDC.e', 'USDbC', 'AERO'].map((m) => {
                const isSel = selectedMarkets.includes(m);

                return (
                  <div
                    key={m}
                    onClick={() => toggleMarket(m)}
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
                    <span className="text-theme-primary chip-label">{m}</span>
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
        </CardContent>
      </Card>

      {/* Thresholds */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-theme-primary">Rate Difference Thresholds</CardTitle>
          <Button size="sm" onClick={addThreshold} className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary">
            <Plus size={16} className="mr-1" /> Add Threshold
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">
            {alertType === 'supply' ? 'Notify when Compound supply APR > other APR by threshold.' : 'Notify when Compound borrow APR < other APR by threshold.'}
          </p>

          {thresholds.map((th, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 mb-4 items-center border-t border-primary-color pt-4">
              <div className="col-span-1 flex items-center text-theme-muted">
                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-primary-color">
                  {i + 1}
                </Badge>
              </div>

              <div className="col-span-5 flex flex-col">
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={th.threshold}
                    onChange={(e) => updateThreshold(i, 'threshold', e.target.value)}
                    className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                      errors.thresholds && errors.thresholds[i] ? 'border-red-500' : ''
                    }`}
                    placeholder="0.5"
                  />
                  <span className="ml-2 text-theme-muted">% APR</span>
                </div>
                {errors.thresholds && errors.thresholds[i] && (
                  <div className="mt-1 flex items-center text-red-500 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    <span>{errors.thresholds[i]}</span>
                  </div>
                )}
              </div>

              <div className="col-span-5">
                <Select value={th.severity} onValueChange={(value) => updateThreshold(i, 'severity', value)}>
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

              {thresholds.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeThreshold(i)} className="col-span-1 text-red-500 h-8 w-8">
                  <X size={16} />
                </Button>
              )}
            </div>
          ))}

          <hr></hr>

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
        <Button onClick={() => router.push('/alerts/compare-compound')} className="border hover-border-primary">
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
