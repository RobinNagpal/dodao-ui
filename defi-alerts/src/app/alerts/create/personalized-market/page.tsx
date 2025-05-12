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
  type SupplyRow,
  type BorrowRow,
  type Channel,
  severityOptions,
  frequencyOptions,
  type ConditionType,
} from "@/types/alerts";

export default function PersonalizedMarketAlertPage() {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const email = localStorage.getItem("email")!;
  const walletAddress = localStorage.getItem("walletAddress")!;

  // 1) supply rows
  const defaultSupply: SupplyRow = {
    chain: "Polygon",
    market: "USDT",
    rate: "7.8%",
    conditionType: "APR_RISE_ABOVE",
    threshold: "",
    severity: "NONE",
    frequency: "ONCE_PER_ALERT",
  };
  const secondSupply: SupplyRow = {
    chain: "Polygon",
    market: "USDC.e",
    rate: "6.2%",
    conditionType: "APR_FALLS_BELOW",
    threshold: "",
    severity: "NONE",
    frequency: "ONCE_PER_ALERT",
  };
  const [supplyRows, setSupplyRows] = useState<SupplyRow[]>([
    defaultSupply,
    secondSupply,
  ]);

  const updateSupplyRow = (idx: number, field: keyof SupplyRow, val: any) =>
    setSupplyRows((s) =>
      s.map((r, i) => (i === idx ? { ...r, [field]: val } : r))
    );

  // 2) one borrow row
  const defaultBorrow: BorrowRow = {
    chain: "Base",
    market: "ETH",
    rate: "3.8%",
    conditionType: "APR_FALLS_BELOW",
    threshold: "",
    severity: "NONE",
    frequency: "ONCE_PER_ALERT",
  };

  const [borrowRows, setBorrowRows] = useState<BorrowRow[]>([
    { ...defaultBorrow },
  ]);

  const updateBorrowRow = (idx: number, field: keyof BorrowRow, val: any) =>
    setBorrowRows((s) =>
      s.map((r, i) => (i === idx ? { ...r, [field]: val } : r))
    );

  // 3) delivery channels
  const [channels, setChannels] = useState<Channel[]>([
    { channelType: "EMAIL", email: "" },
  ]);
  const addChannel = () =>
    setChannels((c) => [...c, { channelType: "EMAIL", email: "" }]);
  const updateChannel = (idx: number, field: keyof Channel, val: any) =>
    setChannels((c) =>
      c.map((ch, i) => (i === idx ? { ...ch, [field]: val } : ch))
    );
  const removeChannel = (idx: number) =>
    setChannels((c) => c.filter((_, i) => i !== idx));

  // Helpers
  const conditionOptions = [
    { label: "APR rises above threshold", value: "APR_RISE_ABOVE" },
    { label: "APR falls below threshold", value: "APR_FALLS_BELOW" },
    { label: "APR is outside a range", value: "APR_OUTSIDE_RANGE" },
  ] as const;

  // Submit → two POSTs: one for SUPPLY, one for BORROW
  const handleCreateAlert = async () => {
    // 1) supply alerts
    await Promise.all(
      supplyRows.map((r) =>
        fetch(`${baseUrl}/api/alerts/create/personalized-market`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            walletAddress,
            category: "PERSONALIZED",
            actionType: "SUPPLY",
            selectedChains: [r.chain],
            selectedMarkets: [r.market],
            compareProtocols: [],
            notificationFrequency: r.frequency,
            conditions: [
              r.conditionType === "APR_OUTSIDE_RANGE"
                ? {
                    type: r.conditionType,
                    min: r.thresholdLow,
                    max: r.thresholdHigh,
                    severity: r.severity,
                  }
                : {
                    type: r.conditionType,
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

    // 2) borrow alert
    await Promise.all(
      borrowRows.map((r) =>
        fetch(`${baseUrl}/api/alerts/create/personalized-market`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            walletAddress,
            category: "PERSONALIZED",
            actionType: "BORROW",
            selectedChains: [r.chain],
            selectedMarkets: [r.market],
            compareProtocols: [],
            notificationFrequency: r.frequency,
            conditions: [
              r.conditionType === "APR_OUTSIDE_RANGE"
                ? {
                    type: r.conditionType,
                    min: r.thresholdLow,
                    max: r.thresholdHigh,
                    severity: r.severity,
                  }
                : {
                    type: r.conditionType,
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
          className="text-theme-muted hover-text-primary flex items-center gap-1"
        >
          <Home size={14} />
          <span>Home</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-theme-muted" />
        <Link
          href="/alerts"
          className="text-theme-muted hover-text-primary flex items-center gap-1"
        >
          <Bell size={14} />
          <span>Alerts</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-theme-muted" />
        <Link
          href="/alerts/create"
          className="text-theme-muted hover-text-primary flex items-center gap-1"
        >
          <TrendingUp size={14} />
          <span>Create Alert</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-theme-muted" />
        <span className="text-theme-primary font-medium">
          Personalized Market Alert
        </span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-theme-primary">
          Create Personalized Market Alert
        </h1>
        <p className="text-theme-muted">
          Configure market alerts specifically for your positions on Compound.
        </p>
      </div>

      {/* Supply Positions */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
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
                <TableRow className="border-primary-color">
                  <TableHead className="text-theme-primary">Chain</TableHead>
                  <TableHead className="text-theme-primary">Market</TableHead>
                  <TableHead className="text-theme-primary">Rate</TableHead>
                  <TableHead className="text-theme-primary">
                    Condition
                  </TableHead>
                  <TableHead className="text-theme-primary">
                    Threshold
                  </TableHead>
                  <TableHead className="text-theme-primary">Severity</TableHead>
                  <TableHead className="text-theme-primary">
                    Frequency
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplyRows.map((r, i) => (
                  <TableRow key={i} className="border-primary-color">
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
                      <Select
                        value={r.conditionType}
                        onValueChange={(value) =>
                          updateSupplyRow(
                            i,
                            "conditionType",
                            value as ConditionType
                          )
                        }
                      >
                        <SelectTrigger className="w-full hover-border-primary">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent className="bg-block">
                          {conditionOptions.map((opt) => (
                            <div
                              key={opt.value}
                              className="hover-border-primary hover-text-primary"
                            >
                              <SelectItem value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {r.conditionType === "APR_OUTSIDE_RANGE" ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            placeholder="Min"
                            value={r.thresholdLow || ""}
                            onChange={(e) =>
                              updateSupplyRow(i, "thresholdLow", e.target.value)
                            }
                            className="w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                          />
                          <Input
                            type="text"
                            placeholder="Max"
                            value={r.thresholdHigh || ""}
                            onChange={(e) =>
                              updateSupplyRow(
                                i,
                                "thresholdHigh",
                                e.target.value
                              )
                            }
                            className="w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                          />
                          <span className="text-theme-muted">%</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Input
                            type="text"
                            placeholder="Value"
                            value={r.threshold || ""}
                            onChange={(e) =>
                              updateSupplyRow(i, "threshold", e.target.value)
                            }
                            className="w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                          />
                          <span className="ml-2 text-theme-muted">%</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.severity}
                        onValueChange={(value) =>
                          updateSupplyRow(
                            i,
                            "severity",
                            value as SupplyRow["severity"]
                          )
                        }
                      >
                        <SelectTrigger className="w-[120px] hover-border-primary">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent className="bg-block">
                          {severityOptions.map((opt) => (
                            <div
                              key={opt.value}
                              className="hover-border-primary hover-text-primary"
                            >
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.frequency}
                        onValueChange={(value) =>
                          updateSupplyRow(
                            i,
                            "frequency",
                            value as SupplyRow["frequency"]
                          )
                        }
                      >
                        <SelectTrigger className="w-[140px] hover-border-primary">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-block">
                          {frequencyOptions.map((f) => (
                            <div
                              key={f.value}
                              className="hover-border-primary hover-text-primary"
                            >
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
          <CardTitle className="text-lg text-theme-primary">
            Borrow Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">
            Set alert conditions for each of your borrow positions.
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary-color">
                  <TableHead className="text-theme-primary">Chain</TableHead>
                  <TableHead className="text-theme-primary">Market</TableHead>
                  <TableHead className="text-theme-primary">Rate</TableHead>
                  <TableHead className="text-theme-primary">
                    Condition
                  </TableHead>
                  <TableHead className="text-theme-primary">
                    Threshold
                  </TableHead>
                  <TableHead className="text-theme-primary">Severity</TableHead>
                  <TableHead className="text-theme-primary">
                    Frequency
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowRows.map((r, i) => (
                  <TableRow key={i} className="border-primary-color">
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
                      <Select
                        value={r.conditionType}
                        onValueChange={(value) =>
                          updateBorrowRow(
                            i,
                            "conditionType",
                            value as ConditionType
                          )
                        }
                      >
                        <SelectTrigger className="w-full hover-border-primary">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent className="bg-block">
                          {conditionOptions.map((opt) => (
                            <div
                              key={opt.value}
                              className="hover-border-primary hover-text-primary"
                            >
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {r.conditionType === "APR_OUTSIDE_RANGE" ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            placeholder="Min"
                            value={r.thresholdLow || ""}
                            onChange={(e) =>
                              updateBorrowRow(i, "thresholdLow", e.target.value)
                            }
                            className="w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                          />
                          <Input
                            type="text"
                            placeholder="Max"
                            value={r.thresholdHigh || ""}
                            onChange={(e) =>
                              updateBorrowRow(
                                i,
                                "thresholdHigh",
                                e.target.value
                              )
                            }
                            className="w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                          />
                          <span className="text-theme-muted">%</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Input
                            type="text"
                            placeholder="Value"
                            value={r.threshold || ""}
                            onChange={(e) =>
                              updateBorrowRow(i, "threshold", e.target.value)
                            }
                            className="w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                          />
                          <span className="ml-2 text-theme-muted">%</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.severity}
                        onValueChange={(value) =>
                          updateBorrowRow(
                            i,
                            "severity",
                            value as BorrowRow["severity"]
                          )
                        }
                      >
                        <SelectTrigger className="w-[120px] hover-border-primary">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent className="bg-block">
                          {severityOptions.map((opt) => (
                            <div
                              key={opt.value}
                              className="hover-border-primary hover-text-primary"
                            >
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.frequency}
                        onValueChange={(value) =>
                          updateBorrowRow(
                            i,
                            "frequency",
                            value as BorrowRow["frequency"]
                          )
                        }
                      >
                        <SelectTrigger className="w-[140px] hover-border-primary">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-block">
                          {frequencyOptions.map((f) => (
                            <div
                              key={f.value}
                              className="hover-border-primary hover-text-primary"
                            >
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
          <CardTitle className="text-lg text-theme-primary">
            Delivery Channel Settings
          </CardTitle>
          <Button
            size="sm"
            onClick={addChannel}
            className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary"
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

              {ch.channelType === "EMAIL" ? (
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={ch.email || ""}
                  onChange={(e) => updateChannel(i, "email", e.target.value)}
                  className="flex-1 border-theme-primary focus-border-primary focus:outline-none transition-colors"
                />
              ) : (
                <Input
                  type="url"
                  placeholder="https://webhook.site/..."
                  value={ch.webhookUrl || ""}
                  onChange={(e) =>
                    updateChannel(i, "webhookUrl", e.target.value)
                  }
                  className="flex-1 border-theme-primary focus-border-primary focus:outline-none transition-colors"
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
          onClick={() => router.push("/alerts/create")}
          className="border hover-border-primary"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <Button
          onClick={handleCreateAlert}
          className="border text-primary-color hover-border-body"
        >
          Create Personalized Alerts
        </Button>
      </div>
    </div>
  );
}
