"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import getBaseUrl from "@dodao/web-core/utils/api/getBaseURL";
import {
  ComparisonRow,
  Channel,
  NotificationFrequency,
  SeverityLevel,
  severityOptions,
  frequencyOptions,
} from "@/types/alerts";

// type CompRow = {
//   platform: string;
//   chain: string;
//   market: string;
//   threshold: string;
//   severity: "NONE" | "LOW" | "MEDIUM" | "HIGH";
//   frequency:
//     | "IMMEDIATE"
//     | "AT_MOST_ONCE_PER_6_HOURS"
//     | "AT_MOST_ONCE_PER_12_HOURS"
//     | "AT_MOST_ONCE_PER_DAY";
// };

// type Channel = {
//   channelType: "EMAIL" | "WEBHOOK";
//   email?: string;
//   webhookUrl?: string;
// };

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
      market: "DAI",
      threshold: "0.5",
      severity: "NONE",
      frequency: "AT_MOST_ONCE_PER_DAY",
    },
  ]);

  // 2) dynamic borrow comparisons
  const [borrowRows, setBorrowRows] = useState<ComparisonRow[]>([
    {
      platform: "Curve",
      chain: "Base",
      market: "ETH",
      threshold: "0.5",
      severity: "NONE",
      frequency: "AT_MOST_ONCE_PER_DAY",
    },
  ]);

  // 3) channels
  const [channels, setChannels] = useState<Channel[]>([
    { channelType: "EMAIL", email: "" },
  ]);

  // helpers
  // const severityOptions = ["NONE", "LOW", "MEDIUM", "HIGH"] as const;
  // const frequencyOptions = [
  //   { label: "Immediate", value: "IMMEDIATE" },
  //   { label: "Once/6h", value: "AT_MOST_ONCE_PER_6_HOURS" },
  //   { label: "Once/12h", value: "AT_MOST_ONCE_PER_12_HOURS" },
  //   { label: "Once/day", value: "AT_MOST_ONCE_PER_DAY" },
  // ] as const;

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
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/">Home</Link>
        <span className="mx-2">{">"}</span>
        <Link href="/alerts">Alerts</Link>
        <span className="mx-2">{">"}</span>
        <Link href="/alerts/create">Create Alert</Link>
        <span className="mx-2">{">"}</span>
        <span className="text-gray-700">Personalized Comparison Alert</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        Get Alerts When Compound Beats Your Other Rates
      </h1>
      <p className="text-gray-600 mb-8">
        Stay updated when Compound outperforms Aave, Curve, or Morpho on any of
        your positions.
      </p>

      {/* Supply Table */}
      <div className="border p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Supply Positions</h2>
        </div>
        <table className="w-full mb-4">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Chain</th>
              <th>Market</th>
              <th>Threshold</th>
              <th>Severity</th>
              <th>Frequency</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {supplyRows.map((r, i) => (
              <tr key={i} className="border-t">
                <td>
                  <p className="px-2 py-1">{r.platform}</p>
                </td>
                <td>
                  <p className="px-2 py-1">{r.chain}</p>
                </td>
                <td>
                  <p className="px-2 py-1">{r.market}</p>
                </td>
                <td>
                  <div className="flex items-center">
                    <input
                      className="border px-2 py-1 rounded w-16"
                      value={r.threshold}
                      onChange={(e) =>
                        updateSupply(i, "threshold", e.target.value)
                      }
                    />
                    <span className="ml-1">APR</span>
                  </div>
                </td>
                <td>
                  <select
                    className="border px-2 py-1 rounded"
                    value={r.severity}
                    onChange={(e) =>
                      updateSupply(i, "severity", e.target.value as any)
                    }
                  >
                    {severityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="border px-2 py-1 rounded"
                    value={r.frequency}
                    onChange={(e) =>
                      updateSupply(
                        i,
                        "frequency",
                        e.target.value as NotificationFrequency
                      )
                    }
                  >
                    {frequencyOptions.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Borrow Table */}
      <div className="border p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Borrow Positions</h2>
        </div>
        <table className="w-full mb-4">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Chain</th>
              <th>Market</th>
              <th>Threshold</th>
              <th>Severity</th>
              <th>Frequency</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {borrowRows.map((r, i) => (
              <tr key={i} className="border-t">
                <td>
                  <p className="px-2 py-1">{r.platform}</p>
                </td>
                <td>
                  <p className="px-2 py-1">{r.chain}</p>
                </td>
                <td>
                  <p className="px-2 py-1">{r.market}</p>
                </td>
                <td>
                  <div className="flex items-center">
                    <input
                      className="border px-2 py-1 rounded w-16"
                      value={r.threshold}
                      onChange={(e) =>
                        updateBorrow(i, "threshold", e.target.value)
                      }
                    />
                    <span className="ml-1">APR</span>
                  </div>
                </td>
                <td>
                  <select
                    className="border px-2 py-1 rounded"
                    value={r.severity}
                    onChange={(e) =>
                      updateBorrow(i, "severity", e.target.value as any)
                    }
                  >
                    {severityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="border px-2 py-1 rounded"
                    value={r.frequency}
                    onChange={(e) =>
                      updateBorrow(
                        i,
                        "frequency",
                        e.target.value as NotificationFrequency
                      )
                    }
                  >
                    {frequencyOptions.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delivery Channels */}
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
        {channels.map((c, i) => (
          <div key={i} className="flex gap-4 mb-4">
            <select
              value={c.channelType}
              onChange={(e) =>
                updateChannel(i, "channelType", e.target.value as any)
              }
              className="border px-2 py-1 rounded"
            >
              <option value="EMAIL">Email</option>
              <option value="WEBHOOK">Webhook</option>
            </select>
            {c.channelType === "EMAIL" ? (
              <input
                type="email"
                placeholder="you@example.com"
                value={c.email}
                onChange={(e) => updateChannel(i, "email", e.target.value)}
                className="border px-2 py-1 rounded flex-1"
              />
            ) : (
              <input
                type="url"
                placeholder="https://..."
                value={c.webhookUrl}
                onChange={(e) => updateChannel(i, "webhookUrl", e.target.value)}
                className="border px-2 py-1 rounded flex-1"
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

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.push("/alerts/create")}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateAlert}
          className="px-4 py-2 bg-[#0f172a] text-white rounded"
        >
          Create Personalized Alerts
        </button>
      </div>
    </div>
  );
}
