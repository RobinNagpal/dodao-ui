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
import { type SupplyRow, type BorrowRow, type Channel, severityOptions, frequencyOptions, type ConditionType } from '@/types/alerts';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import {
  AlertCategory,
  AlertActionType,
  NotificationFrequency,
  ConditionType as PrismaConditionType,
  SeverityLevel,
  DeliveryChannelType,
} from '@prisma/client';
import { CreatePersonalizedAlertPayload, PersonalizedAlertCreationResponse } from '@/app/api/alerts/create/personalized-market/route';

export default function PersonalizedMarketAlertPage() {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const { postData, loading: isSubmitting } = usePostData<PersonalizedAlertCreationResponse, CreatePersonalizedAlertPayload>({
    successMessage: 'Your personalized market alert was saved successfully.',
    errorMessage: "Couldn't create personalized alert",
    redirectPath: '/alerts',
  });

  const [email, setEmail] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');

  // Validation errors
  const [errors, setErrors] = useState<{
    supplyConditions?: string[];
    borrowConditions?: string[];
    channels?: string[];
  }>({});

  useEffect(() => {
    setEmail(localStorage.getItem('email') ?? '');
    setWalletAddress(localStorage.getItem('walletAddress') ?? '');
  }, []);

  // 1) supply rows
  const defaultSupply: SupplyRow = {
    chain: 'Polygon',
    market: 'USDT',
    rate: '7.8%',
    conditionType: 'APR_RISE_ABOVE',
    threshold: '',
    severity: 'NONE',
    frequency: 'ONCE_PER_ALERT',
  };
  const secondSupply: SupplyRow = {
    chain: 'Polygon',
    market: 'USDC.e',
    rate: '6.2%',
    conditionType: 'APR_FALLS_BELOW',
    threshold: '',
    severity: 'NONE',
    frequency: 'ONCE_PER_ALERT',
  };
  const [supplyRows, setSupplyRows] = useState<SupplyRow[]>([defaultSupply, secondSupply]);

  const updateSupplyRow = <K extends keyof SupplyRow>(idx: number, field: K, val: SupplyRow[K]) =>
    setSupplyRows((s) => s.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));

  // 2) one borrow row
  const defaultBorrow: BorrowRow = {
    chain: 'Base',
    market: 'ETH',
    rate: '3.8%',
    conditionType: 'APR_FALLS_BELOW',
    threshold: '',
    severity: 'NONE',
    frequency: 'ONCE_PER_ALERT',
  };

  const [borrowRows, setBorrowRows] = useState<BorrowRow[]>([{ ...defaultBorrow }]);

  const updateBorrowRow = <K extends keyof BorrowRow>(idx: number, field: K, val: BorrowRow[K]) =>
    setBorrowRows((s) => s.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));

  // 3) delivery channels
  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: '' }]);
  const addChannel = () => setChannels((c) => [...c, { channelType: 'EMAIL', email: '' }]);
  const updateChannel = <K extends keyof Channel>(idx: number, field: K, val: Channel[K]) =>
    setChannels((c) => c.map((ch, i) => (i === idx ? { ...ch, [field]: val } : ch)));
  const removeChannel = (idx: number) => setChannels((c) => c.filter((_, i) => i !== idx));

  // Clear validation errors when user makes changes
  useEffect(() => {
    if (errors.supplyConditions) {
      const newSupplyErrors = [...errors.supplyConditions];
      let hasChanges = false;

      supplyRows.forEach((row, index) => {
        if (row.conditionType === 'APR_OUTSIDE_RANGE') {
          if (row.thresholdLow && row.thresholdHigh && !isNaN(Number(row.thresholdLow)) && !isNaN(Number(row.thresholdHigh)) && newSupplyErrors[index]) {
            newSupplyErrors[index] = '';
            hasChanges = true;
          }
        } else {
          if (row.threshold && !isNaN(Number(row.threshold)) && newSupplyErrors[index]) {
            newSupplyErrors[index] = '';
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        if (newSupplyErrors.every((err) => !err)) {
          setErrors((prev) => ({ ...prev, supplyConditions: undefined }));
        } else {
          setErrors((prev) => ({ ...prev, supplyConditions: newSupplyErrors }));
        }
      }
    }
  }, [supplyRows, errors.supplyConditions]);

  useEffect(() => {
    if (errors.borrowConditions) {
      const newBorrowErrors = [...errors.borrowConditions];
      let hasChanges = false;

      borrowRows.forEach((row, index) => {
        if (row.conditionType === 'APR_OUTSIDE_RANGE') {
          if (row.thresholdLow && row.thresholdHigh && !isNaN(Number(row.thresholdLow)) && !isNaN(Number(row.thresholdHigh)) && newBorrowErrors[index]) {
            newBorrowErrors[index] = '';
            hasChanges = true;
          }
        } else {
          if (row.threshold && !isNaN(Number(row.threshold)) && newBorrowErrors[index]) {
            newBorrowErrors[index] = '';
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        if (newBorrowErrors.every((err) => !err)) {
          setErrors((prev) => ({ ...prev, borrowConditions: undefined }));
        } else {
          setErrors((prev) => ({ ...prev, borrowConditions: newBorrowErrors }));
        }
      }
    }
  }, [borrowRows, errors.borrowConditions]);

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

  // Helpers
  const conditionOptions = [
    { label: 'APR rises above threshold', value: 'APR_RISE_ABOVE' },
    { label: 'APR falls below threshold', value: 'APR_FALLS_BELOW' },
    { label: 'APR is outside a range', value: 'APR_OUTSIDE_RANGE' },
  ] as const;

  // Validate form before submission
  const validateForm = () => {
    const newErrors: {
      supplyConditions?: string[];
      borrowConditions?: string[];
      channels?: string[];
    } = {};

    // Validate supply conditions
    const supplyConditionErrors: string[] = [];
    supplyRows.forEach((row, index) => {
      if (row.conditionType === 'APR_OUTSIDE_RANGE') {
        if (!row.thresholdLow || !row.thresholdHigh) {
          supplyConditionErrors[index] = 'Both min and max thresholds are required';
        } else if (isNaN(Number(row.thresholdLow)) || isNaN(Number(row.thresholdHigh))) {
          supplyConditionErrors[index] = 'Min and max thresholds must be valid numbers';
        }
      } else {
        if (!row.threshold) {
          supplyConditionErrors[index] = 'Threshold value is required';
        } else if (isNaN(Number(row.threshold))) {
          supplyConditionErrors[index] = 'Threshold value must be a valid number';
        }
      }
    });

    if (supplyConditionErrors.some((error) => error)) {
      newErrors.supplyConditions = supplyConditionErrors;
    }

    // Validate borrow conditions
    const borrowConditionErrors: string[] = [];
    borrowRows.forEach((row, index) => {
      if (row.conditionType === 'APR_OUTSIDE_RANGE') {
        if (!row.thresholdLow || !row.thresholdHigh) {
          borrowConditionErrors[index] = 'Both min and max thresholds are required';
        } else if (isNaN(Number(row.thresholdLow)) || isNaN(Number(row.thresholdHigh))) {
          borrowConditionErrors[index] = 'Min and max thresholds must be valid numbers';
        }
      } else {
        if (!row.threshold) {
          borrowConditionErrors[index] = 'Threshold value is required';
        } else if (isNaN(Number(row.threshold))) {
          borrowConditionErrors[index] = 'Threshold value must be a valid number';
        }
      }
    });

    if (borrowConditionErrors.some((error) => error)) {
      newErrors.borrowConditions = borrowConditionErrors;
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

  // Submit → two POSTs: one for SUPPLY, one for BORROW
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

    // Create and submit supply alerts
    for (const row of supplyRows) {
      const payload: CreatePersonalizedAlertPayload = {
        email: 'test@example.com',
        walletAddress: walletAddress,
        category: 'PERSONALIZED' as AlertCategory,
        actionType: 'SUPPLY' as AlertActionType,
        selectedChains: [row.chain],
        selectedMarkets: [row.market],
        compareProtocols: [],
        notificationFrequency: row.frequency as NotificationFrequency,
        conditions: [
          row.conditionType === 'APR_OUTSIDE_RANGE'
            ? {
                type: row.conditionType as PrismaConditionType,
                min: row.thresholdLow,
                max: row.thresholdHigh,
                severity: row.severity as SeverityLevel,
              }
            : {
                type: row.conditionType as PrismaConditionType,
                value: row.threshold,
                severity: row.severity as SeverityLevel,
              },
        ],
        deliveryChannels: channels.map((c) => ({
          type: c.channelType as DeliveryChannelType,
          email: c.channelType === 'EMAIL' ? c.email : undefined,
          webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
        })),
      };

      await postData(`${baseUrl}/api/alerts/create/personalized-market`, payload);
    }

    // Create and submit borrow alerts
    for (const row of borrowRows) {
      const payload: CreatePersonalizedAlertPayload = {
        email: 'test@example.com',
        walletAddress: walletAddress,
        category: 'PERSONALIZED' as AlertCategory,
        actionType: 'BORROW' as AlertActionType,
        selectedChains: [row.chain],
        selectedMarkets: [row.market],
        compareProtocols: [],
        notificationFrequency: row.frequency as NotificationFrequency,
        conditions: [
          row.conditionType === 'APR_OUTSIDE_RANGE'
            ? {
                type: row.conditionType as PrismaConditionType,
                min: row.thresholdLow,
                max: row.thresholdHigh,
                severity: row.severity as SeverityLevel,
              }
            : {
                type: row.conditionType as PrismaConditionType,
                value: row.threshold,
                severity: row.severity as SeverityLevel,
              },
        ],
        deliveryChannels: channels.map((c) => ({
          type: c.channelType as DeliveryChannelType,
          email: c.channelType === 'EMAIL' ? c.email : undefined,
          webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
        })),
      };

      await postData(`${baseUrl}/api/alerts/create/personalized-market`, payload);
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
        <span className="text-primary-color font-medium">Personalized Market Alert</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-theme-primary">Create Personalized Market Alert</h1>
        <p className="text-theme-muted">Configure market alerts specifically for your positions on Compound.</p>
      </div>

      {/* Supply Positions */}
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
                  <TableHead className="text-theme-primary">Chain</TableHead>
                  <TableHead className="text-theme-primary">Market</TableHead>
                  <TableHead className="text-theme-primary">Rate</TableHead>
                  <TableHead className="text-theme-primary">Condition</TableHead>
                  <TableHead className="text-theme-primary">Threshold</TableHead>
                  <TableHead className="text-theme-primary">Severity</TableHead>
                  <TableHead className="text-theme-primary">Frequency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplyRows.map((r, i) => (
                  <TableRow key={i} className="border-primary-color">
                    <TableCell className="text-theme-primary">{r.chain}</TableCell>
                    <TableCell className="text-theme-primary">{r.market}</TableCell>
                    <TableCell className="text-theme-primary">{r.rate}</TableCell>
                    <TableCell>
                      <Select value={r.conditionType} onValueChange={(value) => updateSupplyRow(i, 'conditionType', value as ConditionType)}>
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
                      {r.conditionType === 'APR_OUTSIDE_RANGE' ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            placeholder="Min"
                            value={r.thresholdLow || ''}
                            onChange={(e) => updateSupplyRow(i, 'thresholdLow', e.target.value)}
                            className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                              errors.supplyConditions && errors.supplyConditions[i] ? 'border-red-500' : ''
                            }`}
                          />
                          <Input
                            type="text"
                            placeholder="Max"
                            value={r.thresholdHigh || ''}
                            onChange={(e) => updateSupplyRow(i, 'thresholdHigh', e.target.value)}
                            className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                              errors.supplyConditions && errors.supplyConditions[i] ? 'border-red-500' : ''
                            }`}
                          />
                          <span className="text-theme-muted">%</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Input
                            type="text"
                            placeholder="Value"
                            value={r.threshold || ''}
                            onChange={(e) => updateSupplyRow(i, 'threshold', e.target.value)}
                            className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                              errors.supplyConditions && errors.supplyConditions[i] ? 'border-red-500' : ''
                            }`}
                          />
                          <span className="ml-2 text-theme-muted">%</span>
                        </div>
                      )}
                      {errors.supplyConditions && errors.supplyConditions[i] && (
                        <div className="mt-1 flex items-center text-red-500 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          <span>{errors.supplyConditions[i]}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select value={r.severity} onValueChange={(value) => updateSupplyRow(i, 'severity', value as SupplyRow['severity'])}>
                        <SelectTrigger className="w-[120px] hover-border-primary">
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
                      <Select value={r.frequency} onValueChange={(value) => updateSupplyRow(i, 'frequency', value as SupplyRow['frequency'])}>
                        <SelectTrigger className="w-[140px] hover-border-primary">
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

      {/* Borrow Position */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">Borrow Position</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">Set alert conditions for each of your borrow positions.</p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary-color">
                  <TableHead className="text-theme-primary">Chain</TableHead>
                  <TableHead className="text-theme-primary">Market</TableHead>
                  <TableHead className="text-theme-primary">Rate</TableHead>
                  <TableHead className="text-theme-primary">Condition</TableHead>
                  <TableHead className="text-theme-primary">Threshold</TableHead>
                  <TableHead className="text-theme-primary">Severity</TableHead>
                  <TableHead className="text-theme-primary">Frequency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowRows.map((r, i) => (
                  <TableRow key={i} className="border-primary-color">
                    <TableCell className="text-theme-primary">{r.chain}</TableCell>
                    <TableCell className="text-theme-primary">{r.market}</TableCell>
                    <TableCell className="text-theme-primary">{r.rate}</TableCell>
                    <TableCell>
                      <Select value={r.conditionType} onValueChange={(value) => updateBorrowRow(i, 'conditionType', value as ConditionType)}>
                        <SelectTrigger className="w-full hover-border-primary">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent className="bg-block">
                          {conditionOptions.map((opt) => (
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
                      {r.conditionType === 'APR_OUTSIDE_RANGE' ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            placeholder="Min"
                            value={r.thresholdLow || ''}
                            onChange={(e) => updateBorrowRow(i, 'thresholdLow', e.target.value)}
                            className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                              errors.borrowConditions && errors.borrowConditions[i] ? 'border-red-500' : ''
                            }`}
                          />
                          <Input
                            type="text"
                            placeholder="Max"
                            value={r.thresholdHigh || ''}
                            onChange={(e) => updateBorrowRow(i, 'thresholdHigh', e.target.value)}
                            className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                              errors.borrowConditions && errors.borrowConditions[i] ? 'border-red-500' : ''
                            }`}
                          />
                          <span className="text-theme-muted">%</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Input
                            type="text"
                            placeholder="Value"
                            value={r.threshold || ''}
                            onChange={(e) => updateBorrowRow(i, 'threshold', e.target.value)}
                            className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                              errors.borrowConditions && errors.borrowConditions[i] ? 'border-red-500' : ''
                            }`}
                          />
                          <span className="ml-2 text-theme-muted">%</span>
                        </div>
                      )}
                      {errors.borrowConditions && errors.borrowConditions[i] && (
                        <div className="mt-1 flex items-center text-red-500 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          <span>{errors.borrowConditions[i]}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select value={r.severity} onValueChange={(value) => updateBorrowRow(i, 'severity', value as BorrowRow['severity'])}>
                        <SelectTrigger className="w-[120px] hover-border-primary">
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
                      <Select value={r.frequency} onValueChange={(value) => updateBorrowRow(i, 'frequency', value as BorrowRow['frequency'])}>
                        <SelectTrigger className="w-[140px] hover-border-primary">
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
