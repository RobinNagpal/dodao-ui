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
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Condition,
  type Channel,
  type ConditionType,
  type SeverityLevel,
  type NotificationFrequency,
  severityOptions,
  frequencyOptions,
} from "@/types/alerts";
import { useNotificationContext } from "@dodao/web-core/ui/contexts/NotificationContext";

export default function CompoundMarketAlertPage() {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const [alertType, setAlertType] = useState<"borrow" | "supply">("borrow");
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [notificationFrequency, setNotificationFrequency] =
    useState<string>("IMMEDIATE");

  const [conditions, setConditions] = useState<Condition[]>([
    { conditionType: "APR_RISE_ABOVE", thresholdValue: "", severity: "NONE" },
  ]);

  const [channels, setChannels] = useState<Channel[]>([
    { channelType: "EMAIL", email: "" },
  ]);

  const toggleChain = (chain: string) =>
    setSelectedChains((cs) =>
      cs.includes(chain) ? cs.filter((c) => c !== chain) : [...cs, chain]
    );

  const toggleMarket = (market: string) =>
    setSelectedMarkets((ms) =>
      ms.includes(market) ? ms.filter((m) => m !== market) : [...ms, market]
    );

  const updateCondition = (i: number, field: keyof Condition, val: string) =>
    setConditions((cs) =>
      cs.map((c, idx) => (idx === i ? { ...c, [field]: val } : c))
    );

  const addChannel = () =>
    setChannels((ch) => [...ch, { channelType: "EMAIL", email: "" }]);

  const updateChannel = (i: number, field: keyof Channel, val: string) =>
    setChannels((ch) =>
      ch.map((c, idx) => (idx === i ? { ...c, [field]: val } : c))
    );

  const removeChannel = (i: number) =>
    setChannels((ch) => ch.filter((_, idx) => idx !== i));

  const handleCreateAlert = async () => {
    const email = localStorage.getItem("email")!;
    const payload = {
      email,
      actionType: alertType.toUpperCase(),
      selectedChains,
      selectedMarkets,
      notificationFrequency,
      conditions: conditions.map((c) => ({
        type: c.conditionType as ConditionType,
        value: c.thresholdValue,
        min: c.thresholdLow,
        max: c.thresholdHigh,
        severity: c.severity as SeverityLevel,
      })),
      deliveryChannels: channels.map((c) => ({
        type: c.channelType,
        email: c.channelType === "EMAIL" ? c.email : undefined,
        url: c.channelType === "WEBHOOK" ? c.webhookUrl : undefined,
      })),
    };

    try {
      const res = await fetch(`${baseUrl}/api/alerts/create/compound-market`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        showNotification({
          type: "error",
          heading: "Couldn’t create alert",
          message: json.error || "Unknown server error",
        });
        return;
      }

      showNotification({
        type: "success",
        heading: "Alert created",
        message: "Your market alert was saved successfully.",
      });
      router.push("/alerts");
    } catch (err: any) {
      console.error("Error creating alert:", err);
      showNotification({
        type: "error",
        heading: "Network Error",
        message: err.message || "Please try again.",
      });
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm mb-6">
        <Link
          href="/"
          className="text-theme-muted hover-text-slate-900 flex items-center gap-1"
        >
          <Home size={14} />
          <span>Home</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-slate-400" />
        <Link
          href="/alerts"
          className="text-theme-muted hover-text-slate-900 flex items-center gap-1"
        >
          <Bell size={14} />
          <span>Alerts</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-slate-400" />
        <Link
          href="/alerts/create"
          className="text-theme-muted hover-text-slate-900 flex items-center gap-1"
        >
          <TrendingUp size={14} />
          <span>Create Alert</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-slate-400" />
        <span className="text-theme-primary font-medium">Compound Market</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-theme-primary">
          Create Market Alert
        </h1>
        <p className="text-theme-muted">
          Configure a new market alert with your preferred settings.
        </p>
      </div>

      {/* Alert Type */}
      <Card className="mb-6 border-theme-border-primary">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">
            Alert Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">
            Choose the type of alert you want to create.
          </p>

          <RadioGroup
            value={alertType}
            onValueChange={(value) =>
              setAlertType(value as "borrow" | "supply")
            }
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="borrow" id="borrow" />
              <Label htmlFor="borrow" className="text-theme-primary">
                Borrow Alert
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="supply" id="supply" />
              <Label htmlFor="supply" className="text-theme-primary">
                Supply Alert
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Market Selection */}
      <Card className="mb-6 border-theme-border-primary">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">
            Market Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">
            Select the chains and markets you want to monitor.
          </p>

          <div className="mb-6">
            <h3 className="text-md font-medium mb-1 text-theme-primary">
              Chains
            </h3>
            <p className="text-sm text-theme-muted mb-3">
              Select one or more chains to monitor.
            </p>

            <div className="flex flex-wrap gap-3">
              {["Ethereum", "Arbitrum", "Optimism", "Polygon", "Base"].map(
                (chain) => (
                  <div
                    key={chain}
                    onClick={() => toggleChain(chain)}
                    className={`border rounded-md px-3 py-2 flex items-center cursor-pointer transition-colors ${
                      selectedChains.includes(chain)
                        ? "border-primary bg-theme-bg-muted"
                        : "border-theme-border-primary"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
                        selectedChains.includes(chain)
                          ? "bg-primary border-primary"
                          : "border-theme-border-secondary"
                      }`}
                    >
                      {selectedChains.includes(chain) && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 1L3.5 6.5L1 4"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-theme-primary">{chain}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium mb-1 text-theme-primary">
              Markets
            </h3>
            <p className="text-sm text-theme-muted mb-3">
              Select one or more markets to monitor.
            </p>

            <div className="flex flex-wrap gap-3">
              {["USDC", "Wrapped BTC", "USDT", "ETH", "USDS"].map((market) => (
                <div
                  key={market}
                  onClick={() => toggleMarket(market)}
                  className={`border rounded-md px-3 py-2 flex items-center cursor-pointer transition-colors ${
                    selectedMarkets.includes(market)
                      ? "border-primary bg-theme-bg-muted"
                      : "border-theme-border-primary"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
                      selectedMarkets.includes(market)
                        ? "bg-primary border-primary"
                        : "border-theme-border-secondary"
                    }`}
                  >
                    {selectedMarkets.includes(market) && (
                      <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 1L3.5 6.5L1 4"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-theme-primary">{market}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condition Settings */}
      <Card className="mb-6 border-theme-border-primary">
        <CardHeader className="pb-1 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-theme-primary">
            Condition Settings
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setConditions((cs) => [
                ...cs,
                { conditionType: "APR_RISE_ABOVE", severity: "NONE" },
              ])
            }
            className="text-theme-primary border-theme-border-primary"
          >
            <Plus size={16} className="mr-1" /> Add Condition
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">
            Define when you want to be alerted about market changes.
          </p>

          {/* Conditions List */}
          {conditions.map((cond, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-4 mb-4 items-center border-t border-theme-border-primary pt-4"
            >
              <div className="col-span-1 flex items-center text-theme-muted">
                <Badge
                  variant="outline"
                  className="h-6 w-6 flex items-center justify-center p-0 rounded-full"
                >
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select condition type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APR_RISE_ABOVE">
                      APR rises above threshold
                    </SelectItem>
                    <SelectItem value="APR_FALLS_BELOW">
                      APR falls below threshold
                    </SelectItem>
                    <SelectItem value="APR_OUTSIDE_RANGE">
                      APR is outside a range
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Thresholds */}
              {cond.conditionType === "APR_OUTSIDE_RANGE" ? (
                <div className="col-span-3 flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Min"
                    value={cond.thresholdLow || ""}
                    onChange={(e) =>
                      updateCondition(i, "thresholdLow", e.target.value)
                    }
                    className="border-theme-border-primary"
                  />
                  <Input
                    type="text"
                    placeholder="Max"
                    value={cond.thresholdHigh || ""}
                    onChange={(e) =>
                      updateCondition(i, "thresholdHigh", e.target.value)
                    }
                    className="border-theme-border-primary"
                  />
                  <span className="text-theme-muted">%</span>
                </div>
              ) : (
                <div className="col-span-3 flex items-center">
                  <Input
                    type="text"
                    placeholder="Value"
                    value={cond.thresholdValue || ""}
                    onChange={(e) =>
                      updateCondition(i, "thresholdValue", e.target.value)
                    }
                    className="border-theme-border-primary"
                  />
                  <span className="ml-2 text-theme-muted">%</span>
                </div>
              )}

              {/* Severity */}
              <div className="col-span-3">
                <Select
                  value={cond.severity}
                  onValueChange={(value) =>
                    setConditions((cs) =>
                      cs.map((c, idx) =>
                        idx === i
                          ? { ...c, severity: value as SeverityLevel }
                          : c
                      )
                    )
                  }
                >
                  <SelectTrigger className="w-full">
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
              </div>

              {/* Remove */}
              {conditions.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setConditions((cs) => cs.filter((_, idx) => idx !== i))
                  }
                  className="col-span-1 text-red-500 h-8 w-8"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          ))}

          {/* Notification Frequency */}
          <div className="mt-6">
            <Label
              htmlFor="frequency"
              className="block text-sm font-medium mb-2"
            >
              Notification Frequency
            </Label>
            <Select
              value={notificationFrequency}
              onValueChange={(value) =>
                setNotificationFrequency(value as NotificationFrequency)
              }
            >
              <SelectTrigger className="w-full" id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-theme-muted mt-4">
              This limits how often you'll receive notifications for this alert,
              regardless of how many thresholds are triggered.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Channel Settings */}
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

        <div className="space-x-4">
          <Button
            onClick={handleCreateAlert}
            className="bg-primary text-white hover-bg-slate-800"
          >
            Create Alert
          </Button>
        </div>
      </div>
    </div>
  );
}
