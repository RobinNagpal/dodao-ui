"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import getBaseUrl from "@dodao/web-core/utils/api/getBaseURL";
import {
  ChevronRight,
  Home,
  Bell,
  TrendingUp,
  Plus,
  X,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ComparisonRow,
  type Channel,
  type NotificationFrequency,
  severityOptions,
  frequencyOptions,
} from "@/types/alerts";

export default function PersonalizedComparisonPage() {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const email = localStorage.getItem("email")!;
  const walletAddress = localStorage.getItem("walletAddress")!;

  // 1) dynamic supply comparisons
  const [supplyRows, setSupplyRows] = useState<ComparisonRow[]>([
    {
      platform: "Aave",
      chain: "Ethereum",
      market: "wstETH",
      rate: "0.09%",
      threshold: "0.5",
      severity: "NONE",
      frequency: "AT_MOST_ONCE_PER_DAY",
    },
  ]);

  // 2) dynamic borrow comparisons
  const [borrowRows, setBorrowRows] = useState<ComparisonRow[]>([
    {
      platform: "Spark",
      chain: "Ethereum",
      market: "ETH",
      rate: "2.09%",
      threshold: "0.5",
      severity: "NONE",
      frequency: "AT_MOST_ONCE_PER_DAY",
    },
  ]);

  // 3) channels
  const [channels, setChannels] = useState<Channel[]>([
    { channelType: "EMAIL", email: "" },
  ]);

  const updateSupply = (i: number, f: keyof ComparisonRow, v: any) =>
    setSupplyRows((rows) =>
      rows.map((r, idx) => (idx === i ? { ...r, [f]: v } : r))
    );

  const updateBorrow = (i: number, f: keyof ComparisonRow, v: any) =>
    setBorrowRows((rows) =>
      rows.map((r, idx) => (idx === i ? { ...r, [f]: v } : r))
    );

  const addChannel = () =>
    setChannels((chs) => [...chs, { channelType: "EMAIL", email: "" }]);
  const updateChannel = (i: number, f: keyof Channel, v: any) =>
    setChannels((chs) =>
      chs.map((c, idx) => (idx === i ? { ...c, [f]: v } : c))
    );
  const removeChannel = (i: number) =>
    setChannels((chs) => chs.filter((_, idx) => idx !== i));

  // submit: two batches of calls
  const handleCreateAlert = async () => {
    // supply comparisons → RATE_DIFF_ABOVE
    await Promise.all(
      supplyRows.map((r) =>
        fetch(`${baseUrl}/api/alerts/create/personalized-comparison`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            walletAddress,
            category: "PERSONALIZED",
            actionType: "SUPPLY",
            isComparison: true,
            selectedChains: [r.chain],
            selectedMarkets: [r.market],
            compareProtocols: [r.platform],
            notificationFrequency: r.frequency,
            conditions: [
              {
                type: "RATE_DIFF_ABOVE",
                value: r.threshold,
                severity: r.severity,
              },
            ],
            deliveryChannels: channels.map((c) => ({
              type: c.channelType,
              email: c.channelType === "EMAIL" ? c.email : undefined,
              webhookUrl:
                c.channelType === "WEBHOOK" ? c.webhookUrl : undefined,
            })),
          }),
        })
      )
    );

    // borrow comparisons → RATE_DIFF_BELOW
    await Promise.all(
      borrowRows.map((r) =>
        fetch(`${baseUrl}/api/alerts/create/personalized-comparison`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            walletAddress,
            category: "PERSONALIZED",
            actionType: "BORROW",
            isComparison: true,
            selectedChains: [r.chain],
            selectedMarkets: [r.market],
            compareProtocols: [r.platform],
            notificationFrequency: r.frequency,
            conditions: [
              {
                type: "RATE_DIFF_BELOW",
                value: r.threshold,
                severity: r.severity,
              },
            ],
            deliveryChannels: channels.map((c) => ({
              type: c.channelType,
              email: c.channelType === "EMAIL" ? c.email : undefined,
              webhookUrl:
                c.channelType === "WEBHOOK" ? c.webhookUrl : undefined,
            })),
          }),
        })
      )
    );

    router.push("/alerts");
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm mb-6">
        <Link
          href="/"
          className="text-theme-muted hover-text-theme-primary flex items-center gap-1"
        >
          <Home size={14} />
          <span>Home</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-theme-muted" />
        <Link
          href="/alerts"
          className="text-theme-muted hover-text-theme-primary flex items-center gap-1"
        >
          <Bell size={14} />
          <span>Alerts</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-theme-muted" />
        <Link
          href="/alerts/create"
          className="text-theme-muted hover-text-theme-primary flex items-center gap-1"
        >
          <TrendingUp size={14} />
          <span>Create Alert</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-theme-muted" />
        <span className="text-theme-primary font-medium">
          Personalized Comparison Alert
        </span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-theme-primary">
          Get Alerts When Compound Beats Your Other Rates
        </h1>
        <p className="text-theme-muted">
          Stay updated when Compound outperforms Aave, Spark, or Morpho on any
          of your positions.
        </p>
      </div>

      {/* Supply Table */}
      <Card className="mb-6 border-theme-border-primary">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">
            Supply Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">
            Set alert conditions for each of your supply positions.
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Chain</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Alert Me If Higher By</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Frequency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplyRows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-theme-primary">
                      {r.platform}
                    </TableCell>
                    <TableCell className="text-theme-primary">
                      {r.chain}
                    </TableCell>
                    <TableCell className="text-theme-primary">
                      {r.market}
                    </TableCell>
                    <TableCell className="text-theme-primary">
                      {r.rate}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Input
                          className="w-20 border-theme-border-primary"
                          value={r.threshold}
                          onChange={(e) =>
                            updateSupply(i, "threshold", e.target.value)
                          }
                        />
                        <span className="ml-2 text-theme-muted">% APR</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.severity}
                        onValueChange={(value) =>
                          updateSupply(i, "severity", value as any)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          {severityOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.frequency}
                        onValueChange={(value) =>
                          updateSupply(
                            i,
                            "frequency",
                            value as NotificationFrequency
                          )
                        }
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencyOptions.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
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
      <Card className="mb-6 border-theme-border-primary">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">
            Borrow Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">
            Set alert conditions for each of your borrow positions.
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Chain</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Alert Me If Lower By </TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Frequency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowRows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-theme-primary">
                      {r.platform}
                    </TableCell>
                    <TableCell className="text-theme-primary">
                      {r.chain}
                    </TableCell>
                    <TableCell className="text-theme-primary">
                      {r.market}
                    </TableCell>
                    <TableCell className="text-theme-primary">
                      {r.rate}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Input
                          className="w-20 border-theme-border-primary"
                          value={r.threshold}
                          onChange={(e) =>
                            updateBorrow(i, "threshold", e.target.value)
                          }
                        />
                        <span className="ml-2 text-theme-muted">% APR</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.severity}
                        onValueChange={(value) =>
                          updateBorrow(i, "severity", value as any)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          {severityOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.frequency}
                        onValueChange={(value) =>
                          updateBorrow(
                            i,
                            "frequency",
                            value as NotificationFrequency
                          )
                        }
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencyOptions.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
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
      <Card className="mb-6 border-theme-border-primary">
        <CardHeader className="pb-1 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-theme-primary">
            Delivery Channel Settings
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={addChannel}
            className="text-theme-primary border-theme-border-primary"
          >
            <Plus size={16} className="mr-1" /> Add Channel
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">
            Choose how you want to receive your alerts.
          </p>

          {channels.map((ch, i) => (
            <div key={i} className="mb-4 flex items-center gap-4">
              <Select
                value={ch.channelType}
                onValueChange={(value) =>
                  updateChannel(
                    i,
                    "channelType",
                    value as Channel["channelType"]
                  )
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="WEBHOOK">Webhook</SelectItem>
                </SelectContent>
              </Select>

              {ch.channelType === "EMAIL" ? (
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={ch.email || ""}
                  onChange={(e) => updateChannel(i, "email", e.target.value)}
                  className="flex-1 border-theme-border-primary"
                />
              ) : (
                <Input
                  type="url"
                  placeholder="https://webhook.site/..."
                  value={ch.webhookUrl || ""}
                  onChange={(e) =>
                    updateChannel(i, "webhookUrl", e.target.value)
                  }
                  className="flex-1 border-theme-border-primary"
                />
              )}

              {channels.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeChannel(i)}
                  className="text-red-500 h-8 w-8"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/alerts/create")}
          className="border-theme-border-primary text-theme-primary"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <Button
          onClick={handleCreateAlert}
          className="bg-primary text-white hover-bg-slate-800"
        >
          Create Personalized Alerts
        </Button>
      </div>
    </div>
  );
}
