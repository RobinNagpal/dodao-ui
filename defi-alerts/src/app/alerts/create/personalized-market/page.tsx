"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import getBaseUrl from "@dodao/web-core/utils/api/getBaseURL";
import {
  SupplyRow,
  BorrowRow,
  Channel,
  severityOptions,
  frequencyOptions,
  ConditionType,
} from "@/types/alerts";

export default function PersonalizedMarketAlertPage() {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const email = localStorage.getItem("email")!;
  const walletAddress = localStorage.getItem("walletAddress")!;

  // 1) supply rows
  const defaultSupply: SupplyRow = {
    chain: "Ethereum",
    market: "ETH",
    rate: "7.8%",
    conditionType: "APR_RISE_ABOVE",
    threshold: "",
    severity: "NONE",
    frequency: "AT_MOST_ONCE_PER_DAY",
  };
  const secondSupply: SupplyRow = {
    chain: "Solana",
    market: "SOL",
    rate: "6.2%",
    conditionType: "APR_FALLS_BELOW",
    threshold: "",
    severity: "LOW",
    frequency: "AT_MOST_ONCE_PER_DAY",
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
    market: "DAI",
    rate: "3.8%",
    conditionType: "APR_RISE_ABOVE",
    threshold: "",
    severity: "NONE",
    frequency: "AT_MOST_ONCE_PER_DAY",
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
    <div className="p-6 max-w-6xl mx-auto">
      {/* …breadcrumb & header… */}
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
        <span className="text-gray-700">Personalized Market Alert</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        Create Personalized Market Alert
      </h1>
      <p className="text-gray-600 mb-8">
        Configure market alerts specifically for your positions on Compound.
      </p>

      {/* Supply Positions */}
      <div className="border p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Supply Positions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th>Chain</th>
                <th>Market</th>
                <th>Rate</th>
                <th>Condition</th>
                <th>Threshold</th>
                <th>Severity</th>
                <th>Frequency</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {supplyRows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">{r.chain}</td>
                  <td className="py-2">
                    {r.market}
                    <div className="text-xs text-gray-500">{r.rate}</div>
                  </td>
                  <td className="py-2">{r.rate}</td>
                  <td className="py-2">
                    <select
                      value={r.conditionType}
                      onChange={(e) =>
                        updateSupplyRow(
                          i,
                          "conditionType",
                          e.target.value as ConditionType
                        )
                      }
                      className="border px-2 py-1 rounded"
                    >
                      {conditionOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2">
                    {r.conditionType === "APR_OUTSIDE_RANGE" ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Min"
                          value={r.thresholdLow}
                          onChange={(e) =>
                            updateSupplyRow(i, "thresholdLow", e.target.value)
                          }
                          className="border px-2 py-1 rounded w-20"
                        />
                        <input
                          type="text"
                          placeholder="Max"
                          value={r.thresholdHigh}
                          onChange={(e) =>
                            updateSupplyRow(i, "thresholdHigh", e.target.value)
                          }
                          className="border px-2 py-1 rounded w-20"
                        />
                        <span>%</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={r.threshold}
                          onChange={(e) =>
                            updateSupplyRow(i, "threshold", e.target.value)
                          }
                          className="border px-2 py-1 rounded w-20"
                        />
                        <span className="ml-2">%</span>
                      </div>
                    )}
                  </td>

                  <td className="py-2">
                    <select
                      value={r.severity}
                      onChange={(e) =>
                        updateSupplyRow(
                          i,
                          "severity",
                          e.target.value as SupplyRow["severity"]
                        )
                      }
                      className="border px-2 py-1 rounded"
                    >
                      {severityOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2">
                    <select
                      value={r.frequency}
                      onChange={(e) =>
                        updateSupplyRow(
                          i,
                          "frequency",
                          e.target.value as SupplyRow["frequency"]
                        )
                      }
                      className="border px-2 py-1 rounded"
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
      </div>

      {/* Borrow Position */}
      <div className="border p-6 rounded-lg mb-6">
        <h2 className="text-lg font-medium mb-2">Borrow Position</h2>
        <div className="overflow-x-auto">
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th>Chain</th>
                <th>Market</th>
                <th>Rate</th>
                <th>Condition</th>
                <th>Threshold</th>
                <th>Severity</th>
                <th>Frequency</th>
              </tr>
            </thead>
            <tbody>
              {borrowRows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">{r.chain}</td>
                  <td className="py-2">
                    {r.market}
                    <div className="text-xs text-gray-500">{r.rate}</div>
                  </td>
                  <td className="py-2">{r.rate}</td>
                  <td className="py-2">
                    <select
                      value={r.conditionType}
                      onChange={(e) =>
                        updateBorrowRow(
                          i,
                          "conditionType",
                          e.target.value as ConditionType
                        )
                      }
                      className="border px-2 py-1 rounded"
                    >
                      {conditionOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2">
                    {r.conditionType === "APR_OUTSIDE_RANGE" ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Min"
                          value={r.thresholdLow}
                          onChange={(e) =>
                            updateBorrowRow(i, "thresholdLow", e.target.value)
                          }
                          className="border px-2 py-1 rounded w-20"
                        />
                        <input
                          type="text"
                          placeholder="Max"
                          value={r.thresholdHigh}
                          onChange={(e) =>
                            updateBorrowRow(i, "thresholdHigh", e.target.value)
                          }
                          className="border px-2 py-1 rounded w-20"
                        />
                        <span>%</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={r.threshold}
                          onChange={(e) =>
                            updateBorrowRow(i, "threshold", e.target.value)
                          }
                          className="border px-2 py-1 rounded w-20"
                        />
                        <span className="ml-2">%</span>
                      </div>
                    )}
                  </td>

                  <td className="py-2">
                    <select
                      value={r.severity}
                      onChange={(e) =>
                        updateBorrowRow(
                          i,
                          "severity",
                          e.target.value as BorrowRow["severity"]
                        )
                      }
                      className="border px-2 py-1 rounded"
                    >
                      {severityOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2">
                    <select
                      value={r.frequency}
                      onChange={(e) =>
                        updateBorrowRow(
                          i,
                          "frequency",
                          e.target.value as BorrowRow["frequency"]
                        )
                      }
                      className="border px-2 py-1 rounded"
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
                updateChannel(
                  i,
                  "channelType",
                  e.target.value as Channel["channelType"]
                )
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
