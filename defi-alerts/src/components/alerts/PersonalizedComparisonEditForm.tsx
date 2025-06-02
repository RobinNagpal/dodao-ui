'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  type Channel,
  severityOptions,
  frequencyOptions,
  type Alert,
  type SeverityLevel,
  type NotificationFrequency,
  type ComparisonRow,
} from '@/types/alerts';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { toSentenceCase } from '@/utils/getSentenceCase';

interface PersonalizedComparisonEditFormProps {
  alert: Alert;
  alertId: string;
}

export default function PersonalizedComparisonEditForm({ alert, alertId }: PersonalizedComparisonEditFormProps) {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const { putData, loading: isSubmitting } = usePutData<Alert, any>({
    successMessage: 'Your comparison alert was updated successfully.',
    errorMessage: "Couldn't update comparison alert",
    redirectPath: '/alerts/compare-compound',
  });

  const [actionType, setActionType] = useState<'SUPPLY' | 'BORROW'>('SUPPLY');
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');
  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: '' }]);
  const [walletAddress, setWalletAddress] = useState<string>('');

  // For the specific row we're editing
  const [row, setRow] = useState<ComparisonRow>({
    platform: '',
    chain: '',
    market: '',
    rate: '0%',
    threshold: '',
    severity: 'NONE',
    frequency: 'AT_MOST_ONCE_PER_DAY',
  });

  // Validation errors
  const [errors, setErrors] = useState<{
    threshold?: string;
    channels?: string[];
  }>({});

  // Initialize form with alert data
  useEffect(() => {
    if (!alert) return;

    setActionType(alert.actionType as 'SUPPLY' | 'BORROW');
    setStatus(alert.status as 'ACTIVE' | 'PAUSED');
    setWalletAddress(alert.walletAddress || '');

    // Set up the comparison row for editing
    const chain = alert.selectedChains?.[0]?.name || '';
    const market = alert.selectedAssets?.[0]?.symbol || '';
    const platform = alert.compareProtocols?.[0] || '';
    const condition = alert.conditions?.[0] || {
      conditionType: 'RATE_DIFF_ABOVE',
      severity: 'NONE',
      thresholdValue: '',
    };

    setRow({
      platform,
      chain,
      market,
      rate: '0%', // We don't have actual rates from the alert data
      threshold: condition.thresholdValue?.toString() || '',
      severity: condition.severity as SeverityLevel,
      frequency: alert.notificationFrequency as NotificationFrequency,
    });

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
  }, [alert]);

  // Update row functions
  const updateRow = <K extends keyof ComparisonRow>(field: K, val: ComparisonRow[K]) => {
    setRow((prev) => ({ ...prev, [field]: val }));

    // Clear validation errors
    if (field === 'threshold' && errors.threshold) {
      setErrors((prev) => ({ ...prev, threshold: undefined }));
    }
  };

  // Channel functions
  const addChannel = () => setChannels((c) => [...c, { channelType: 'EMAIL', email: '' }]);

  const updateChannel = <K extends keyof Channel>(idx: number, field: K, val: Channel[K]) => {
    setChannels((c) => c.map((ch, i) => (i === idx ? { ...ch, [field]: val } : ch)));

    // Clear validation errors
    if (errors.channels && errors.channels[idx]) {
      const newErrors = [...errors.channels];
      newErrors[idx] = '';

      if (newErrors.every((err) => !err)) {
        setErrors((prev) => ({ ...prev, channels: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, channels: newErrors }));
      }
    }
  };

  const removeChannel = (idx: number) => setChannels((c) => c.filter((_, i) => i !== idx));

  // Validate form
  const validateForm = () => {
    const newErrors: {
      threshold?: string;
      channels?: string[];
    } = {};

    // Validate threshold
    if (!row.threshold || isNaN(Number(row.threshold))) {
      newErrors.threshold = 'Threshold must be a valid number';
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
    if (!validateForm()) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors in the form before submitting',
      });
      return;
    }

    // Get the original chain and market - don't allow changes
    const chainId = alert.selectedChains?.[0]?.chainId || 0;
    const chainConnect = [{ chainId }];

    // Use the original asset connection
    const assetConnect =
      alert.selectedAssets?.map((asset) => ({
        chainId_address: `${asset.chainId}_${asset.address.toLowerCase()}`,
      })) || [];

    const payload = {
      actionType,
      walletAddress,
      notificationFrequency: row.frequency,
      selectedChains: chainConnect,
      selectedAssets: assetConnect,
      compareProtocols: [row.platform], // Keep the original platform
      isComparison: true, // Ensure this remains a comparison alert
      conditions: [
        {
          conditionType: actionType === 'SUPPLY' ? 'RATE_DIFF_ABOVE' : 'RATE_DIFF_BELOW',
          thresholdValue: row.threshold,
          severity: row.severity,
        },
      ],
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

      {/* Comparison Settings */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">{actionType === 'SUPPLY' ? 'Supply' : 'Borrow'} Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">
            Update alert conditions for comparing Compound with {toSentenceCase(row.platform)} for {actionType.toLowerCase()} rates.
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary-color">
                  <TableHead className="text-theme-primary">Platform</TableHead>
                  <TableHead className="text-theme-primary">Chain</TableHead>
                  <TableHead className="text-theme-primary">Market</TableHead>
                  <TableHead className="text-theme-primary">Alert Me If {actionType === 'SUPPLY' ? 'Higher' : 'Lower'} By</TableHead>
                  <TableHead className="text-theme-primary">Severity</TableHead>
                  <TableHead className="text-theme-primary">Frequency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-primary-color">
                  <TableCell className="text-theme-primary">{toSentenceCase(row.platform)}</TableCell>
                  <TableCell className="text-theme-primary">{row.chain}</TableCell>
                  <TableCell className="text-theme-primary">{row.market}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Input
                          type="text"
                          placeholder="Value"
                          value={row.threshold}
                          onChange={(e) => updateRow('threshold', e.target.value)}
                          className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                            errors.threshold ? 'border-red-500' : ''
                          }`}
                        />
                        <span className="ml-2 text-theme-muted">% APR</span>
                      </div>
                      {errors.threshold && <div className="mt-1 text-red-500 text-sm">{errors.threshold}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select value={row.severity} onValueChange={(value) => updateRow('severity', value as SeverityLevel)}>
                      <SelectTrigger className="w-[120px] hover-border-primary">
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
                  </TableCell>
                  <TableCell>
                    <Select value={row.frequency} onValueChange={(value) => updateRow('frequency', value as NotificationFrequency)}>
                      <SelectTrigger className="w-[140px] hover-border-primary">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-block">
                        {frequencyOptions.map((f) => (
                          <div key={f.value} className="hover-border-primary hover-text-primary">
                            <SelectItem value={f.value}>{f.label}</SelectItem>
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
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
                  {errors.channels && errors.channels[i] && <div className="mt-1 text-red-500 text-sm">{errors.channels[i]}</div>}
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
                  {errors.channels && errors.channels[i] && <div className="mt-1 text-red-500 text-sm">{errors.channels[i]}</div>}
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
