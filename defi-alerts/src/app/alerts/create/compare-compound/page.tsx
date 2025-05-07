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
  type Channel,
  type NotificationFrequency,
  type SeverityLevel,
  frequencyOptions,
  severityOptions,
  GeneralComparisonRow,
} from "@/types/alerts";
import { useNotificationContext } from "@dodao/web-core/ui/contexts/NotificationContext";

export default function CompareCompoundPage() {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const { showNotification } = useNotificationContext();

  const [alertType, setAlertType] = useState<"supply" | "borrow">("supply");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [notificationFrequency, setNotificationFrequency] =
    useState<NotificationFrequency>("ONCE_PER_ALERT");

  const [thresholds, setThresholds] = useState<GeneralComparisonRow[]>([
    {
      platform: "",
      chain: "",
      market: "",
      threshold: "",
      severity: "NONE",
      frequency: "ONCE_PER_ALERT",
    },
  ]);

  const [channels, setChannels] = useState<Channel[]>([
    { channelType: "EMAIL", email: "" },
  ]);

  // toggles
  const togglePlatform = (p: string) =>
    setSelectedPlatforms((ps) =>
      ps.includes(p) ? ps.filter((x) => x !== p) : [...ps, p]
    );
  const toggleChain = (c: string) =>
    setSelectedChains((cs) =>
      cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]
    );
  const toggleMarket = (m: string) =>
    setSelectedMarkets((ms) =>
      ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]
    );

  // threshold handlers
  const addThreshold = () =>
    setThresholds((ts) => [
      ...ts,
      {
        platform: "",
        chain: "",
        market: "",
        threshold: "",
        severity: "NONE",
        frequency: "ONCE_PER_ALERT",
      },
    ]);

  const updateThreshold = (
    idx: number,
    field: keyof GeneralComparisonRow,
    val: string
  ) =>
    setThresholds((ts) =>
      ts.map((t, i) => (i === idx ? { ...t, [field]: val } : t))
    );
  const removeThreshold = (idx: number) =>
    setThresholds((ts) => ts.filter((_, i) => i !== idx));

  // channel handlers
  const addChannel = () =>
    setChannels((ch) => [...ch, { channelType: "EMAIL", email: "" }]);
  const updateChannel = (idx: number, field: keyof Channel, val: string) =>
    setChannels((ch) =>
      ch.map((c, i) => (i === idx ? { ...c, [field]: val } : c))
    );
  const removeChannel = (idx: number) =>
    setChannels((ch) => ch.filter((_, i) => i !== idx));

  const handleCreateAlert = async () => {
    if (
      !selectedPlatforms.length ||
      !selectedChains.length ||
      !selectedMarkets.length
    ) {
      showNotification({
        type: "error",
        heading: "Incomplete form",
        message: "Please pick at least one platform, chain, and market.",
      });
      return;
    }

    const email = localStorage.getItem("email")!;
    const payload = {
      email,
      category: "GENERAL",
      actionType: alertType.toUpperCase(), // SUPPLY or BORROW
      isComparison: true,
      selectedChains,
      selectedMarkets,
      compareProtocols: selectedPlatforms,
      notificationFrequency,
      conditions: thresholds.map((t) => ({
        type: alertType === "supply" ? "RATE_DIFF_ABOVE" : "RATE_DIFF_BELOW",
        value: t.threshold,
        severity: t.severity,
      })),
      deliveryChannels: channels.map((c) => ({
        type: c.channelType,
        email: c.channelType === "EMAIL" ? c.email : undefined,
        webhookUrl: c.channelType === "WEBHOOK" ? c.webhookUrl : undefined,
      })),
    };

    try {
      const res = await fetch(`${baseUrl}/api/alerts/create/compare-compound`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        // show backend’s error message
        showNotification({
          type: "error",
          heading: "Couldn’t create comparison alert",
          message: json.error || "Unknown server error",
        });
        return;
      }

      // success
      showNotification({
        type: "success",
        heading: "Alert created 🎉",
        message: "You’ll now be notified when Compound beats other rates.",
      });
      router.push("/alerts");
    } catch (err: any) {
      // network or unexpected failure
      showNotification({
        type: "error",
        heading: "Network error",
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
        <span className="text-theme-primary font-medium">Compare Compound</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-theme-primary">
          Compare Compound Rates
        </h1>
        <p className="text-theme-muted">
          Set up alerts to monitor when Compound offers better rates than other
          DeFi platforms.
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
              setAlertType(value as "supply" | "borrow")
            }
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="supply" id="supply" />
              <Label htmlFor="supply" className="text-theme-primary">
                Supply Comparison (Alert when Compound offers higher rates)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="borrow" id="borrow" />
              <Label htmlFor="borrow" className="text-theme-primary">
                Borrow Comparison (Alert when Compound offers lower rates)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Platforms / Chains / Markets */}
      <Card className="mb-6 border-theme-border-primary">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">
            Market Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">
            Select the platforms to compare with and the markets you want to
            monitor.
          </p>
          {/* Platforms */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-1 text-theme-primary">
              Compare With
            </h3>
            <p className="text-sm text-theme-muted mb-3">
              Select one or more platforms to compare Compound rates against.
            </p>

            <div className="flex flex-wrap gap-3">
              {["Aave", "Morpho", "Spark"].map((p) => (
                <div
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`border rounded-md px-3 py-2 flex items-center cursor-pointer transition-colors ${
                    selectedPlatforms.includes(p)
                      ? "border-primary bg-theme-bg-muted"
                      : "border-theme-border-primary"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
                      selectedPlatforms.includes(p)
                        ? "bg-primary border-primary"
                        : "border-theme-border-secondary"
                    }`}
                  >
                    {selectedPlatforms.includes(p) && (
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
                  <span className="text-theme-primary">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chains */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-1 text-theme-primary">
              Chains
            </h3>
            <p className="text-sm text-theme-muted mb-3">
              Select one or more chains to monitor.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                "Ethereum",
                "Optimism",
                "Arbitrum",
                "Polygon",
                "Base",
                "Unichain",
                "Ronin",
                "Mantle",
                "Scroll",
              ].map((c) => (
                <div
                  key={c}
                  onClick={() => toggleChain(c)}
                  className={`border rounded-md px-3 py-2 flex items-center cursor-pointer transition-colors ${
                    selectedChains.includes(c)
                      ? "border-primary bg-theme-bg-muted"
                      : "border-theme-border-primary"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
                      selectedChains.includes(c)
                        ? "bg-primary border-primary"
                        : "border-theme-border-secondary"
                    }`}
                  >
                    {selectedChains.includes(c) && (
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
                  <span className="text-theme-primary">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Markets */}
          <div>
            <h3 className="text-md font-medium mb-1 text-theme-primary">
              Markets
            </h3>
            <p className="text-sm text-theme-muted mb-3">
              Select one or more markets to monitor.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                "USDC",
                "USDS",
                "USDT",
                "ETH",
                "wstETH",
                "USDe",
                "USDC.e",
                "USDbC",
                "AERO",
              ].map((m) => (
                <div
                  key={m}
                  onClick={() => toggleMarket(m)}
                  className={`border rounded-md px-3 py-2 flex items-center cursor-pointer transition-colors ${
                    selectedMarkets.includes(m)
                      ? "border-primary bg-theme-bg-muted"
                      : "border-theme-border-primary"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
                      selectedMarkets.includes(m)
                        ? "bg-primary border-primary"
                        : "border-theme-border-secondary"
                    }`}
                  >
                    {selectedMarkets.includes(m) && (
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
                  <span className="text-theme-primary">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thresholds */}
      <Card className="mb-6 border-theme-border-primary">
        <CardHeader className="pb-1 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-theme-primary">
            Rate Difference Thresholds
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={addThreshold}
            className="text-theme-primary border-theme-border-primary"
          >
            <Plus size={16} className="mr-1" /> Add Threshold
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-theme-muted mb-4">
            {alertType === "supply"
              ? "Notify when Compound supply APR > other APR by threshold."
              : "Notify when Compound borrow APR < other APR by threshold."}
          </p>

          {thresholds.map((th, i) => (
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

              <div className="col-span-5 flex items-center">
                <Input
                  type="text"
                  value={th.threshold}
                  onChange={(e) =>
                    updateThreshold(i, "threshold", e.target.value)
                  }
                  className="w-20 border-theme-border-primary"
                  placeholder="0.5"
                />
                <span className="ml-2 text-theme-muted">% APR</span>
              </div>

              <div className="col-span-5">
                <Select
                  value={th.severity}
                  onValueChange={(value) =>
                    updateThreshold(i, "severity", value as SeverityLevel)
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

              {thresholds.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeThreshold(i)}
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
