"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import getBaseUrl from "@dodao/web-core/utils/api/getBaseURL";
import {
  Condition,
  Channel,
  ConditionType,
  SeverityLevel,
  NotificationFrequency,
  severityOptions,
  frequencyOptions,
} from "@/types/alerts";

export default function CompoundMarketAlertPage() {
  const router = useRouter();
  const baseUrl = getBaseUrl();

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

    const res = await fetch(`${baseUrl}/api/alerts/create/compound-market`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Failed to create alert");
      return;
    }
    router.push("/alerts");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>
        <span className="mx-2">{">"}</span>
        <Link href="/alerts" className="hover:text-gray-700">
          Alerts
        </Link>
        <span className="mx-2">{">"}</span>
        <Link href="/alerts/create" className="hover:text-gray-700">
          Create Alert
        </Link>
        <span className="mx-2">{">"}</span>
        <span className="text-gray-700">Compound Market</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">Create Market Alert</h1>
      <p className="text-gray-600 mb-8">
        Configure a new market alert with your preferred settings.
      </p>

      {/* Alert Type */}
      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Alert Type</h2>
        <p className="text-sm text-gray-500 mb-4">
          Choose the type of alert you want to create.
        </p>

        <div className="flex items-center mb-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="alertType"
              checked={alertType === "borrow"}
              onChange={() => setAlertType("borrow")}
              className="mr-2"
            />
            <span>Borrow Alert</span>
          </label>
        </div>

        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="radio"
              name="alertType"
              checked={alertType === "supply"}
              onChange={() => setAlertType("supply")}
              className="mr-2"
            />
            <span>Supply Alert</span>
          </label>
        </div>
      </div>

      {/* Market Selection */}
      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Market Selection</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select the chains and markets you want to monitor.
        </p>

        <div className="mb-6">
          <h3 className="text-md font-medium mb-2">Chains</h3>
          <p className="text-sm text-gray-500 mb-3">
            Select one or more chains to monitor.
          </p>

          <div className="flex flex-wrap gap-3">
            {["Ethereum", "Arbitrum", "Optimism", "Polygon", "Base"].map(
              (chain) => (
                <div
                  key={chain}
                  onClick={() => toggleChain(chain)}
                  className={`border rounded-md px-3 py-2 flex items-center cursor-pointer ${
                    selectedChains.includes(chain)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedChains.includes(chain)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  <span>{chain}</span>
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium mb-2">Markets</h3>
          <p className="text-sm text-gray-500 mb-3">
            Select one or more markets to monitor.
          </p>

          <div className="flex flex-wrap gap-3">
            {["USDC", "Wrapped BTC", "USDT", "ETH", "USDS"].map((market) => (
              <div
                key={market}
                onClick={() => toggleMarket(market)}
                className={`border rounded-md px-3 py-2 flex items-center cursor-pointer ${
                  selectedMarkets.includes(market)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedMarkets.includes(market)}
                  onChange={() => {}}
                  className="mr-2"
                />
                <span>{market}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Condition Settings */}
      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-medium">Condition Settings</h2>
            <p className="text-sm text-gray-500">
              Define when you want to be alerted about market changes.
            </p>
          </div>
          <button
            onClick={() =>
              setConditions((cs) => [
                ...cs,
                { conditionType: "APR_RISE_ABOVE", severity: "NONE" },
              ])
            }
            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            Add New Condition +
          </button>
        </div>

        {/* Conditions List */}
        {conditions.map((cond, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-4 mb-4 items-center border-t pt-4"
          >
            <div className="col-span-1 flex items-center">{i + 1}.</div>

            {/* Type */}
            <div className="col-span-4">
              <select
                value={cond.conditionType}
                onChange={(e) =>
                  setConditions((cs) =>
                    cs.map((c, idx) =>
                      idx === i
                        ? {
                            ...c,
                            conditionType: e.target.value as ConditionType,
                          }
                        : c
                    )
                  )
                }
                className="border rounded px-3 py-2 w-full"
              >
                <option value="APR_RISE_ABOVE">
                  APR rises above threshold
                </option>
                <option value="APR_FALLS_BELOW">
                  APR falls below threshold
                </option>
                <option value="APR_OUTSIDE_RANGE">
                  APR is outside a range
                </option>
              </select>
            </div>

            {/* Thresholds */}
            {cond.conditionType === "APR_OUTSIDE_RANGE" ? (
              <>
                <div className="col-span-3 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Min"
                    value={cond.thresholdLow}
                    onChange={(e) =>
                      updateCondition(i, "thresholdLow", e.target.value)
                    }
                    className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Max"
                    value={cond.thresholdHigh}
                    onChange={(e) =>
                      updateCondition(i, "thresholdHigh", e.target.value)
                    }
                    className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  />
                  <span>%</span>
                </div>
              </>
            ) : (
              <div className="col-span-3 flex items-center">
                <input
                  type="text"
                  placeholder="Value"
                  value={cond.thresholdValue}
                  onChange={(e) =>
                    updateCondition(i, "thresholdValue", e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                />
                <span className="ml-2">%</span>
              </div>
            )}

            {/* Severity */}
            <div className="col-span-3">
              <select
                value={cond.severity}
                onChange={(e) =>
                  setConditions((cs) =>
                    cs.map((c, idx) =>
                      idx === i
                        ? { ...c, severity: e.target.value as SeverityLevel }
                        : c
                    )
                  )
                }
                className="border rounded px-3 py-2 w-full"
              >
                {severityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Remove */}
            {conditions.length > 1 && (
              <button
                onClick={() =>
                  setConditions((cs) => cs.filter((_, idx) => idx !== i))
                }
                className="col-span-1 text-red-500"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Notification Frequency */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Notification Frequency
          </label>
          <select
            value={notificationFrequency}
            onChange={(e) =>
              setNotificationFrequency(e.target.value as NotificationFrequency)
            }
            className="border rounded px-3 py-2 w-full"
          >
            {frequencyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Delivery Channel Settings */}
      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-medium">Delivery Channel Settings</h2>
            <p className="text-sm text-gray-500">
              Choose how you want to receive your alerts.
            </p>
          </div>
          <button
            onClick={addChannel}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            + Add Another Channel
          </button>
        </div>

        {channels.map((ch, i) => (
          <div key={i} className="mb-4 flex items-center gap-4">
            <select
              value={ch.channelType}
              onChange={(e) =>
                updateChannel(
                  i,
                  "channelType",
                  e.target.value as Channel["channelType"]
                )
              }
              className="border border-gray-300 rounded-md px-3 py-2"
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
                className="border border-gray-300 rounded-md px-3 py-2 flex-1"
              />
            ) : (
              <input
                type="url"
                placeholder="https://webhook.site/..."
                value={ch.webhookUrl}
                onChange={(e) => updateChannel(i, "webhookUrl", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 flex-1"
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

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.push("/alerts/create")}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateAlert}
          className="px-4 py-2 bg-[#0f172a] text-white rounded-md hover:bg-[#1e293b]"
        >
          Create Alert
        </button>
      </div>
    </div>
  );
}
