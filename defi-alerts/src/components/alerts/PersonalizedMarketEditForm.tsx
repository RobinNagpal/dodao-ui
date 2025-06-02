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
import {
  type BorrowRow,
  type SupplyRow,
  type Channel,
  severityOptions,
  frequencyOptions,
  type ConditionType,
  type Alert,
  type SeverityLevel,
  type NotificationFrequency,
} from '@/types/alerts';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PersonalizedMarketEditFormProps {
  alert: Alert;
  alertId: string;
}

export default function PersonalizedMarketEditForm({ alert, alertId }: PersonalizedMarketEditFormProps) {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const { putData, loading: isSubmitting } = usePutData<Alert, any>({
    successMessage: 'Your personalized alert was updated successfully.',
    errorMessage: "Couldn't update personalized alert",
    redirectPath: '/alerts',
  });

  const [email, setEmail] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [actionType, setActionType] = useState<'SUPPLY' | 'BORROW'>('SUPPLY');
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');

  // For the specific alert we're editing
  const [singleRow, setSingleRow] = useState<SupplyRow | BorrowRow>({
    chain: '',
    market: '',
    rate: '0%',
    conditionType: 'APR_RISE_ABOVE',
    threshold: '',
    severity: 'NONE' as SeverityLevel,
    frequency: 'ONCE_PER_ALERT' as NotificationFrequency,
  });

  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: '' }]);

  // Initialize form with alert data
  useEffect(() => {
    if (!alert) return;

    setEmail(localStorage.getItem('email') ?? '');
    setActionType(alert.actionType);
    setStatus(alert.status);
    setWalletAddress(alert.walletAddress || '');

    // Set up the single row for editing
    const chain = alert.selectedChains?.[0]?.name || '';
    const market = alert.selectedAssets?.[0]?.symbol || '';
    const condition = alert.conditions?.[0] || {
      conditionType: 'APR_RISE_ABOVE',
      severity: 'NONE',
      thresholdValue: '',
      thresholdValueLow: '',
      thresholdValueHigh: '',
    };

    setSingleRow({
      chain,
      market,
      rate: '0%', // We don't have actual rates from the alert data
      conditionType: condition.conditionType as ConditionType,
      threshold: condition.thresholdValue?.toString() || '',
      thresholdLow: condition.thresholdValueLow?.toString() || '',
      thresholdHigh: condition.thresholdValueHigh?.toString() || '',
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
  const updateRow = <K extends keyof (SupplyRow | BorrowRow)>(field: K, val: (SupplyRow | BorrowRow)[K]) => {
    setSingleRow((prev) => ({ ...prev, [field]: val }));
  };

  // Channel functions
  const addChannel = () => setChannels((c) => [...c, { channelType: 'EMAIL', email: '' }]);
  const updateChannel = <K extends keyof Channel>(idx: number, field: K, val: Channel[K]) =>
    setChannels((c) => c.map((ch, i) => (i === idx ? { ...ch, [field]: val } : ch)));
  const removeChannel = (idx: number) => setChannels((c) => c.filter((_, i) => i !== idx));

  // Options
  const conditionOptions = [
    { label: 'APR rises above threshold', value: 'APR_RISE_ABOVE' },
    { label: 'APR falls below threshold', value: 'APR_FALLS_BELOW' },
    { label: 'APR is outside a range', value: 'APR_OUTSIDE_RANGE' },
  ] as const;

  // Submit
  const handleUpdateAlert = async () => {
    // Get the original chain and market - don't allow changes
    const chainId = alert.selectedChains?.[0]?.chainId || 0;
    const chainConnect = [{ chainId }];

    // Use the original asset connection
    const assetConnect =
      alert.selectedAssets?.map((asset) => ({
        chainId_address: `${asset.chainId}_${asset.address.toLowerCase()}`,
      })) || [];

    // Build condition based on type
    let condition;
    if (singleRow.conditionType === 'APR_OUTSIDE_RANGE') {
      condition = {
        conditionType: singleRow.conditionType,
        thresholdValueLow: singleRow.thresholdLow,
        thresholdValueHigh: singleRow.thresholdHigh,
        severity: singleRow.severity,
      };
    } else {
      condition = {
        conditionType: singleRow.conditionType,
        thresholdValue: singleRow.threshold,
        severity: singleRow.severity,
      };
    }

    const payload = {
      actionType,
      walletAddress,
      notificationFrequency: singleRow.frequency,
      selectedChains: chainConnect,
      selectedAssets: assetConnect,
      conditions: [condition],
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

      {/* Position Settings */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">{actionType === 'SUPPLY' ? 'Supply' : 'Borrow'} Position</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">Update alert conditions for your {actionType.toLowerCase()} position.</p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary-color">
                  <TableHead className="text-theme-primary">Chain</TableHead>
                  <TableHead className="text-theme-primary">Market</TableHead>
                  <TableHead className="text-theme-primary">Condition</TableHead>
                  <TableHead className="text-theme-primary">Threshold</TableHead>
                  <TableHead className="text-theme-primary">Severity</TableHead>
                  <TableHead className="text-theme-primary">Frequency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-primary-color">
                  <TableCell className="text-theme-primary">{singleRow.chain}</TableCell>
                  <TableCell className="text-theme-primary">{singleRow.market}</TableCell>
                  <TableCell>
                    <Select value={singleRow.conditionType} onValueChange={(value) => updateRow('conditionType', value as ConditionType)}>
                      <SelectTrigger className="w-full hover-border-primary">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent className="bg-block">
                        {conditionOptions.map((opt) => (
                          <div key={opt.value} className="hover-border-primary hover-text-primary">
                            <SelectItem value={opt.value}>{opt.label}</SelectItem>
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {singleRow.conditionType === 'APR_OUTSIDE_RANGE' ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          placeholder="Min"
                          value={singleRow.thresholdLow || ''}
                          onChange={(e) => updateRow('thresholdLow', e.target.value)}
                          className="w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                        />
                        <Input
                          type="text"
                          placeholder="Max"
                          value={singleRow.thresholdHigh || ''}
                          onChange={(e) => updateRow('thresholdHigh', e.target.value)}
                          className="w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                        />
                        <span className="text-theme-muted">%</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Input
                          type="text"
                          placeholder="Value"
                          value={singleRow.threshold || ''}
                          onChange={(e) => updateRow('threshold', e.target.value)}
                          className="w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                        />
                        <span className="ml-2 text-theme-muted">%</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select value={singleRow.severity} onValueChange={(value) => updateRow('severity', value as SeverityLevel)}>
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
                    <Select value={singleRow.frequency} onValueChange={(value) => updateRow('frequency', value as NotificationFrequency)}>
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

        <Button onClick={handleUpdateAlert} className="border text-primary-color hover-border-body" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Alert'}
        </Button>
      </div>
    </>
  );
}
