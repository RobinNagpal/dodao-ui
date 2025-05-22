'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ChevronRight, Home, Bell, TrendingUp, Plus, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type ComparisonRow, type Channel, type NotificationFrequency, severityOptions, frequencyOptions, SeverityLevel } from '@/types/alerts';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { PersonalizedComparisonAlertPayload, PersonalizedComparisonAlertResponse } from '@/app/api/alerts/create/personalized-comparison/route';
import { AlertActionType, AlertCategory, ConditionType, DeliveryChannelType, SeverityLevel as PrismaSeverityLevel } from '@prisma/client';

export default function PersonalizedComparisonPage() {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const { postData, loading: isSubmitting } = usePostData<PersonalizedComparisonAlertResponse, PersonalizedComparisonAlertPayload>({
    successMessage: "You'll now be notified when Compound compares favorably with other platforms.",
    errorMessage: "Couldn't create personalized comparison alert",
    redirectPath: '/alerts/compare-compound',
  });

  const [email, setEmail] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    setEmail(localStorage.getItem('email') ?? '');
    setWalletAddress(localStorage.getItem('walletAddress') ?? '');
  }, []);

  // 1) dynamic supply comparisons
  const [supplyRows, setSupplyRows] = useState<ComparisonRow[]>([
    {
      platform: 'Aave',
      chain: 'Ethereum',
      market: 'wstETH',
      rate: '0.09%',
      threshold: '',
      severity: 'NONE',
      frequency: 'AT_MOST_ONCE_PER_DAY',
    },
  ]);

  // 2) dynamic borrow comparisons
  const [borrowRows, setBorrowRows] = useState<ComparisonRow[]>([
    {
      platform: 'Spark',
      chain: 'Ethereum',
      market: 'ETH',
      rate: '2.09%',
      threshold: '',
      severity: 'NONE',
      frequency: 'AT_MOST_ONCE_PER_DAY',
    },
  ]);

  // 3) channels
  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: '' }]);

  // Validation errors
  const [errors, setErrors] = useState<{
    supplyThresholds?: string[];
    borrowThresholds?: string[];
    channels?: string[];
  }>({});

  const updateSupply = <K extends keyof ComparisonRow>(i: number, field: K, value: ComparisonRow[K]) => {
    setSupplyRows((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

    // Clear validation error if it exists
    if (errors.supplyThresholds && errors.supplyThresholds[i]) {
      const newSupplyErrors = [...errors.supplyThresholds];
      newSupplyErrors[i] = '';

      if (newSupplyErrors.every((err) => !err)) {
        setErrors((prev) => ({ ...prev, supplyThresholds: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, supplyThresholds: newSupplyErrors }));
      }
    }
  };

  const updateBorrow = <K extends keyof ComparisonRow>(i: number, field: K, value: ComparisonRow[K]) => {
    setBorrowRows((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

    // Clear validation error if it exists
    if (errors.borrowThresholds && errors.borrowThresholds[i]) {
      const newBorrowErrors = [...errors.borrowThresholds];
      newBorrowErrors[i] = '';

      if (newBorrowErrors.every((err) => !err)) {
        setErrors((prev) => ({ ...prev, borrowThresholds: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, borrowThresholds: newBorrowErrors }));
      }
    }
  };

  const addChannel = () => setChannels((chs) => [...chs, { channelType: 'EMAIL', email: '' }]);

  const updateChannel = <K extends keyof Channel>(i: number, field: K, value: Channel[K]) => {
    setChannels((chs) => chs.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));

    // Clear validation error if it exists
    if (errors.channels && errors.channels[i]) {
      const newChannelErrors = [...errors.channels];

      if (field === 'email' && typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newChannelErrors[i] = '';
      } else if (field === 'webhookUrl' && typeof value === 'string') {
        try {
          new URL(value);
          newChannelErrors[i] = '';
        } catch {}
      }

      if (newChannelErrors.every((err) => !err)) {
        setErrors((prev) => ({ ...prev, channels: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, channels: newChannelErrors }));
      }
    }
  };

  const removeChannel = (i: number) => setChannels((chs) => chs.filter((_, idx) => idx !== i));

  // Validate form before submission
  const validateForm = () => {
    const newErrors: {
      supplyThresholds?: string[];
      borrowThresholds?: string[];
      channels?: string[];
    } = {};

    // Validate supply thresholds
    const supplyThresholdErrors: string[] = [];
    supplyRows.forEach((row, index) => {
      if (!row.threshold || isNaN(Number(row.threshold))) {
        supplyThresholdErrors[index] = 'Threshold must be a valid number';
      }
    });

    if (supplyThresholdErrors.some((error) => error)) {
      newErrors.supplyThresholds = supplyThresholdErrors;
    }

    // Validate borrow thresholds
    const borrowThresholdErrors: string[] = [];
    borrowRows.forEach((row, index) => {
      if (!row.threshold || isNaN(Number(row.threshold))) {
        borrowThresholdErrors[index] = 'Threshold must be a valid number';
      }
    });

    if (borrowThresholdErrors.some((error) => error)) {
      newErrors.borrowThresholds = borrowThresholdErrors;
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

  // submit: two batches of calls
  const handleCreateAlert = async () => {
    // Validate form before submission
    if (!validateForm()) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors in the form before submitting',
      });
      return;
    }

    // supply comparisons → RATE_DIFF_ABOVE
    for (const row of supplyRows) {
      const payload: PersonalizedComparisonAlertPayload = {
        email: 'test@example.com',
        walletAddress,
        category: 'PERSONALIZED' as AlertCategory,
        actionType: 'SUPPLY' as AlertActionType,
        isComparison: true,
        selectedChains: [row.chain],
        selectedMarkets: [row.market],
        compareProtocols: [row.platform],
        notificationFrequency: row.frequency as NotificationFrequency,
        conditions: [
          {
            type: 'RATE_DIFF_ABOVE' as ConditionType,
            value: row.threshold,
            severity: row.severity as PrismaSeverityLevel,
          },
        ],
        deliveryChannels: channels.map((c) => ({
          type: c.channelType as DeliveryChannelType,
          email: c.channelType === 'EMAIL' ? c.email : undefined,
          webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
        })),
      };

      await postData(`${baseUrl}/api/alerts/create/personalized-comparison`, payload);
    }

    // borrow comparisons → RATE_DIFF_BELOW
    for (const row of borrowRows) {
      const payload: PersonalizedComparisonAlertPayload = {
        email: 'test@example.com',
        walletAddress,
        category: 'PERSONALIZED' as AlertCategory,
        actionType: 'BORROW' as AlertActionType,
        isComparison: true,
        selectedChains: [row.chain],
        selectedMarkets: [row.market],
        compareProtocols: [row.platform],
        notificationFrequency: row.frequency as NotificationFrequency,
        conditions: [
          {
            type: 'RATE_DIFF_BELOW' as ConditionType,
            value: row.threshold,
            severity: row.severity as PrismaSeverityLevel,
          },
        ],
        deliveryChannels: channels.map((c) => ({
          type: c.channelType as DeliveryChannelType,
          email: c.channelType === 'EMAIL' ? c.email : undefined,
          webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
        })),
      };

      await postData(`${baseUrl}/api/alerts/create/personalized-comparison`, payload);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-2 py-8">
      {/* Breadcrumb */}
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
        <span className="text-primary-color font-medium">Personalized Comparison Alert</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-theme-primary">Get Alerts When Compound Beats Your Other Rates</h1>
        <p className="text-theme-muted">Stay updated when Compound outperforms Aave, Spark, or Morpho on any of your positions.</p>
      </div>

      {/* Supply Table */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">Supply Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">Set alert conditions for each of your supply positions.</p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary-color">
                  <TableHead className="text-theme-primary">Platform</TableHead>
                  <TableHead className="text-theme-primary">Chain</TableHead>
                  <TableHead className="text-theme-primary">Market</TableHead>
                  <TableHead className="text-theme-primary">Rate</TableHead>
                  <TableHead className="text-theme-primary">Alert Me If Higher By</TableHead>
                  <TableHead className="text-theme-primary">Severity</TableHead>
                  <TableHead className="text-theme-primary">Frequency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplyRows.map((r, i) => (
                  <TableRow key={i} className="border-primary-color">
                    <TableCell className="text-theme-primary">{r.platform}</TableCell>
                    <TableCell className="text-theme-primary">{r.chain}</TableCell>
                    <TableCell className="text-theme-primary">{r.market}</TableCell>
                    <TableCell className="text-theme-primary">{r.rate}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Input
                          className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                            errors.supplyThresholds && errors.supplyThresholds[i] ? 'border-red-500' : ''
                          }`}
                          value={r.threshold}
                          placeholder="0.5"
                          onChange={(e) => updateSupply(i, 'threshold', e.target.value)}
                        />
                        <span className="ml-2 text-theme-muted">% APR</span>
                      </div>
                      {errors.supplyThresholds && errors.supplyThresholds[i] && (
                        <div className="mt-1 flex items-center text-red-500 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          <span>{errors.supplyThresholds[i]}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select value={r.severity} onValueChange={(value) => updateSupply(i, 'severity', value as SeverityLevel)}>
                        <SelectTrigger className="w-[140px] hover-border-primary">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent className="bg-block">
                          {severityOptions.map((opt) => (
                            <div key={opt.value} className="hover-border-primary hover-text-primary">
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={r.frequency} onValueChange={(value) => updateSupply(i, 'frequency', value as NotificationFrequency)}>
                        <SelectTrigger className="w-[150px] hover-border-primary">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-block">
                          {frequencyOptions.map((f) => (
                            <div key={f.value} className="hover-border-primary hover-text-primary">
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Borrow Table */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">Borrow Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">Set alert conditions for each of your borrow positions.</p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary-color">
                  <TableHead className="text-theme-primary">Platform</TableHead>
                  <TableHead className="text-theme-primary">Chain</TableHead>
                  <TableHead className="text-theme-primary">Market</TableHead>
                  <TableHead className="text-theme-primary">Rate</TableHead>
                  <TableHead className="text-theme-primary">Alert Me If Lower By </TableHead>
                  <TableHead className="text-theme-primary">Severity</TableHead>
                  <TableHead className="text-theme-primary">Frequency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowRows.map((r, i) => (
                  <TableRow key={i} className="border-primary-color">
                    <TableCell className="text-theme-primary">{r.platform}</TableCell>
                    <TableCell className="text-theme-primary">{r.chain}</TableCell>
                    <TableCell className="text-theme-primary">{r.market}</TableCell>
                    <TableCell className="text-theme-primary">{r.rate}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Input
                          className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                            errors.borrowThresholds && errors.borrowThresholds[i] ? 'border-red-500' : ''
                          }`}
                          value={r.threshold}
                          placeholder="0.5"
                          onChange={(e) => updateBorrow(i, 'threshold', e.target.value)}
                        />
                        <span className="ml-2 text-theme-muted">% APR</span>
                      </div>
                      {errors.borrowThresholds && errors.borrowThresholds[i] && (
                        <div className="mt-1 flex items-center text-red-500 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          <span>{errors.borrowThresholds[i]}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select value={r.severity} onValueChange={(value) => updateBorrow(i, 'severity', value as SeverityLevel)}>
                        <SelectTrigger className="w-[140px] hover-border-primary">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent className="bg-block">
                          {severityOptions.map((opt) => (
                            <div key={opt.value} className="hover-border-primary hover-text-primary">
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={r.frequency} onValueChange={(value) => updateBorrow(i, 'frequency', value as NotificationFrequency)}>
                        <SelectTrigger className="w-[150px] hover-border-primary">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-block">
                          {frequencyOptions.map((f) => (
                            <div key={f.value} className="hover-border-primary hover-text-primary">
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Channels */}
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
                <div className="flex-1 flex flex-col">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={ch.email || ''}
                    onChange={(e) => updateChannel(i, 'email', e.target.value)}
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
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
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
                </div>
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
      <div className="flex justify-between">
        <Button onClick={() => router.push('/alerts/create')} className="border hover-border-primary">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <Button onClick={handleCreateAlert} className="border text-primary-color hover-border-body" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Personalized Alerts'}
        </Button>
      </div>
    </div>
  );
}
