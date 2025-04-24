"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import getBaseUrl from "@dodao/web-core/utils/api/getBaseURL";

type Threshold = { value: string; severity: string };
type Channel = {
  channelType: "EMAIL" | "WEBHOOK";
  email?: string;
  webhookUrl?: string;
};

export default function CompareCompoundPage() {
  const router = useRouter();
  const baseUrl = getBaseUrl();

  const [alertType, setAlertType] = useState<"supply" | "borrow">("supply");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [notificationFrequency, setNotificationFrequency] =
    useState<string>("IMMEDIATE");
  const [thresholds, setThresholds] = useState<Threshold[]>([
    { value: "0.5", severity: "NONE" },
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
    setThresholds((ts) => [...ts, { value: "", severity: "NONE" }]);
  const updateThreshold = (idx: number, field: keyof Threshold, val: string) =>
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

  const frequencyOptions = [
    { label: "Immediate", value: "IMMEDIATE" },
    { label: "Hourly", value: "AT_MOST_ONCE_PER_HOUR" },
    { label: "Every 3h", value: "AT_MOST_ONCE_PER_3_HOURS" },
    { label: "Every 6h", value: "AT_MOST_ONCE_PER_6_HOURS" },
    { label: "Every 12h", value: "AT_MOST_ONCE_PER_12_HOURS" },
    { label: "Daily", value: "AT_MOST_ONCE_PER_DAY" },
  ];

  const handleCreateAlert = async () => {
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
        value: t.value,
        severity: t.severity,
      })),
      deliveryChannels: channels.map((c) => ({
        type: c.channelType,
        email: c.channelType === "EMAIL" ? c.email : undefined,
        url: c.channelType === "WEBHOOK" ? c.webhookUrl : undefined,
      })),
    };

    const res = await fetch(`${baseUrl}/api/alerts/create/compare-compound`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Failed to create compare alert");
      return;
    }
    router.push("/alerts");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/">Home</Link>
        <span className="mx-2">{">"}</span>
        <Link href="/alerts">Alerts</Link>
        <span className="mx-2">{">"}</span>
        <Link href="/alerts/create">Create Alert</Link>
        <span className="mx-2">{">"}</span>
        <span className="text-gray-700">Compare Compound</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">Compare Compound Rates</h1>
      <p className="text-gray-600 mb-8">
        Set up alerts to monitor when Compound offers better rates than other
        DeFi platforms.
      </p>

      {/* --- Alert Type --- */}
      <div className="border p-6 rounded-lg mb-6">
        <h2 className="text-lg font-medium mb-4">Alert Type</h2>
        <label className="flex items-center mb-2">
          <input
            type="radio"
            checked={alertType === "supply"}
            onChange={() => setAlertType("supply")}
            className="mr-2"
          />
          Supply Comparison
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            checked={alertType === "borrow"}
            onChange={() => setAlertType("borrow")}
            className="mr-2"
          />
          Borrow Comparison
        </label>
      </div>

      {/* --- Platforms / Chains / Markets --- */}
      <div className="border p-6 rounded-lg mb-6">
        {/* Platforms */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Compare With</h3>
          <div className="flex flex-wrap gap-3">
            {["Aave", "Morpho", "Spark"].map((p) => (
              <div
                key={p}
                onClick={() => togglePlatform(p)}
                className={`border px-3 py-2 rounded cursor-pointer ${
                  selectedPlatforms.includes(p)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes(p)}
                  readOnly
                  className="mr-2"
                />
                {p}
              </div>
            ))}
          </div>
        </div>
        {/* Chains */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Chains</h3>
          <div className="flex flex-wrap gap-3">
            {["Ethereum", "Arbitrum", "Optimism", "Polygon", "Base"].map(
              (c) => (
                <div
                  key={c}
                  onClick={() => toggleChain(c)}
                  className={`border px-3 py-2 rounded cursor-pointer ${
                    selectedChains.includes(c)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedChains.includes(c)}
                    readOnly
                    className="mr-2"
                  />
                  {c}
                </div>
              )
            )}
          </div>
        </div>
        {/* Markets */}
        <div>
          <h3 className="font-medium mb-2">Markets</h3>
          <div className="flex flex-wrap gap-3">
            {["USDC", "WBTC", "USDT", "ETH", "USDS"].map((m) => (
              <div
                key={m}
                onClick={() => toggleMarket(m)}
                className={`border px-3 py-2 rounded cursor-pointer ${
                  selectedMarkets.includes(m)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedMarkets.includes(m)}
                  readOnly
                  className="mr-2"
                />
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Thresholds --- */}
      <div className="border p-6 rounded-lg mb-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-medium">Rate Difference Thresholds</h2>
          <button
            onClick={addThreshold}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
          >
            + Add New Threshold
          </button>
        </div>
        <p className="text-sm mb-4">
          {alertType === "supply"
            ? "Notify when Compound supply APR > other APR by threshold."
            : "Notify when Compound borrow APR < other APR by threshold."}
        </p>

        {thresholds.map((th, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 items-center mb-4">
            <div className="col-span-1">{i + 1}.</div>
            <div className="col-span-5 flex items-center">
              <input
                type="text"
                value={th.value}
                onChange={(e) => updateThreshold(i, "value", e.target.value)}
                className="border px-2 py-1 rounded w-20"
              />
              <span className="ml-2">APR</span>
            </div>
            <div className="col-span-6">
              <select
                value={th.severity}
                onChange={(e) => updateThreshold(i, "severity", e.target.value)}
                className="border px-3 py-2 rounded w-full"
              >
                {["NONE", "LOW", "MEDIUM", "HIGH"].map((v) => (
                  <option key={v} value={v}>
                    {v.charAt(0) + v.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            {thresholds.length > 1 && (
              <button
                onClick={() => removeThreshold(i)}
                className="col-span-1 text-red-500"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {/* Notification Frequency */}
        <div className="border p-6 rounded-lg mb-6">
          <label className="block text-sm font-medium mb-1">
            Notification Frequency
          </label>
          <select
            value={notificationFrequency}
            onChange={(e) => setNotificationFrequency(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          >
            {frequencyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Channels --- */}
      <div className="border p-6 rounded-lg mb-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-medium">Delivery Channels</h2>
          <button
            onClick={addChannel}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
          >
            + Add Another Channel
          </button>
        </div>
        {channels.map((ch, i) => (
          <div key={i} className="flex items-center gap-4 mb-4">
            <select
              value={ch.channelType}
              onChange={(e) =>
                updateChannel(
                  i,
                  "channelType",
                  e.target.value as Channel["channelType"]
                )
              }
              className="border px-3 py-2 rounded"
            >
              <option value="EMAIL">Email</option>
              <option value="WEBHOOK">Webhook</option>
            </select>
            {ch.channelType === "EMAIL" ? (
              <input
                type="email"
                placeholder="you@example.com"
                value={ch.email}
                onChange={(e) => updateChannel(i, "email", e.target.value)}
                className="border px-3 py-2 rounded flex-1"
              />
            ) : (
              <input
                type="url"
                placeholder="https://..."
                value={ch.webhookUrl}
                onChange={(e) => updateChannel(i, "webhookUrl", e.target.value)}
                className="border px-3 py-2 rounded flex-1"
              />
            )}
            {channels.length > 1 && (
              <button onClick={() => removeChannel(i)} className="text-red-500">
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* --- Actions --- */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.push("/alerts/create")}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateAlert}
          className="px-4 py-2 bg-[#0f172a] text-white rounded hover:bg-[#1e293b]"
        >
          Create Alert
        </button>
      </div>
    </div>
  );
}
