'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ChevronRight, Home, Bell, TrendingUp, Plus, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type ComparisonRow, type Channel, type NotificationFrequency, severityOptions, frequencyOptions, SeverityLevel } from '@/types/alerts';

export default function PersonalizedComparisonPage() {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const email = localStorage.getItem('email')!;
  const walletAddress = localStorage.getItem('walletAddress')!;

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

  const updateSupply = <K extends keyof ComparisonRow>(i: number, field: K, value: ComparisonRow[K]) =>
    setSupplyRows((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  const updateBorrow = <K extends keyof ComparisonRow>(i: number, field: K, value: ComparisonRow[K]) =>
    setBorrowRows((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  const addChannel = () => setChannels((chs) => [...chs, { channelType: 'EMAIL', email: '' }]);
  const updateChannel = <K extends keyof Channel>(i: number, field: K, value: Channel[K]) =>
    setChannels((chs) => chs.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  const removeChannel = (i: number) => setChannels((chs) => chs.filter((_, idx) => idx !== i));

  // submit: two batches of calls
  const handleCreateAlert = async () => {
    // supply comparisons → RATE_DIFF_ABOVE
    await Promise.all(
      supplyRows.map((r) =>
        fetch(`${baseUrl}/api/alerts/create/personalized-comparison`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            walletAddress,
            category: 'PERSONALIZED',
            actionType: 'SUPPLY',
            isComparison: true,
            selectedChains: [r.chain],
            selectedMarkets: [r.market],
            compareProtocols: [r.platform],
            notificationFrequency: r.frequency,
            conditions: [
              {
                type: 'RATE_DIFF_ABOVE',
                value: r.threshold,
                severity: r.severity,
              },
            ],
            deliveryChannels: channels.map((c) => ({
              type: c.channelType,
              email: c.channelType === 'EMAIL' ? c.email : undefined,
              webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
            })),
          }),
        })
      )
    );

    // borrow comparisons → RATE_DIFF_BELOW
    await Promise.all(
      borrowRows.map((r) =>
        fetch(`${baseUrl}/api/alerts/create/personalized-comparison`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            walletAddress,
            category: 'PERSONALIZED',
            actionType: 'BORROW',
            isComparison: true,
            selectedChains: [r.chain],
            selectedMarkets: [r.market],
            compareProtocols: [r.platform],
            notificationFrequency: r.frequency,
            conditions: [
              {
                type: 'RATE_DIFF_BELOW',
                value: r.threshold,
                severity: r.severity,
              },
            ],
            deliveryChannels: channels.map((c) => ({
              type: c.channelType,
              email: c.channelType === 'EMAIL' ? c.email : undefined,
              webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
            })),
          }),
        })
      )
    );

    router.push('/alerts');
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
                          className="w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                          value={r.threshold}
                          placeholder="0.5"
                          onChange={(e) => updateSupply(i, 'threshold', e.target.value)}
                        />
                        <span className="ml-2 text-theme-muted">% APR</span>
                      </div>
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
                          className="w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                          value={r.threshold}
                          placeholder="0.5"
                          onChange={(e) => updateBorrow(i, 'threshold', e.target.value)}
                        />
                        <span className="ml-2 text-theme-muted">% APR</span>
                      </div>
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
      <div className="flex justify-between">
        <Button onClick={() => router.push('/alerts/create')} className="border hover-border-primary">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <Button onClick={handleCreateAlert} className="border text-primary-color hover-border-body">
          Create Personalized Alerts
        </Button>
      </div>
    </div>
  );
}
