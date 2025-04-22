"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CompoundMarketAlertPage() {
  const router = useRouter();
  const [alertType, setAlertType] = useState<string>("borrow");
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [conditionType, setConditionType] = useState<string>(
    "APR rises above threshold"
  );
  const [threshold, setThreshold] = useState<string>("");
  const [severity, setSeverity] = useState<string>("none");
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);

  const toggleChain = (chain: string) => {
    if (selectedChains.includes(chain)) {
      setSelectedChains(selectedChains.filter((c) => c !== chain));
    } else {
      setSelectedChains([...selectedChains, chain]);
    }
  };

  const toggleMarket = (market: string) => {
    if (selectedMarkets.includes(market)) {
      setSelectedMarkets(selectedMarkets.filter((m) => m !== market));
    } else {
      setSelectedMarkets([...selectedMarkets, market]);
    }
  };

  const handleCreateAlert = () => {
    // In a real app, you would save the alert configuration
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
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Add New Condition +
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-1 flex items-center">#</div>
            <div className="col-span-5">Condition Type</div>
            <div className="col-span-3">Threshold</div>
            <div className="col-span-3">Severity Level</div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1">1.</div>
            <div className="col-span-5 relative">
              <div
                className="border border-gray-300 rounded-md px-3 py-2 flex justify-between items-center cursor-pointer"
                onClick={() => setShowConditionDropdown(!showConditionDropdown)}
              >
                <span>{conditionType}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {showConditionDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  {[
                    "APR rises above threshold",
                    "APR falls below threshold",
                    "APR is outside a range",
                  ].map((type) => (
                    <div
                      key={type}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setConditionType(type);
                        setShowConditionDropdown(false);
                      }}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-3 flex items-center">
              <input
                type="text"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="Value"
                className="border border-gray-300 rounded-md px-3 py-2 w-24"
              />
              <span className="ml-2">%</span>
            </div>

            <div className="col-span-3 relative">
              <div
                className="border border-gray-300 rounded-md px-3 py-2 flex justify-between items-center cursor-pointer"
                onClick={() => setShowSeverityDropdown(!showSeverityDropdown)}
              >
                <span className="capitalize">
                  {severity === "none" ? "None" : severity}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {showSeverityDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  {[
                    {
                      value: "none",
                      label: "None",
                      description: "No Color Indicator",
                    },
                    {
                      value: "low",
                      label: "Low",
                      description: "Informational",
                    },
                    {
                      value: "medium",
                      label: "Medium",
                      description: "Attention Needed",
                    },
                    {
                      value: "high",
                      label: "High",
                      description: "Urgent Action",
                    },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSeverity(option.value);
                        setShowSeverityDropdown(false);
                      }}
                    >
                      <div className="flex items-center">
                        {option.value !== "none" && (
                          <div
                            className={`w-4 h-4 rounded-full mr-2 ${
                              option.value === "low"
                                ? "bg-blue-300"
                                : option.value === "medium"
                                ? "bg-yellow-300"
                                : option.value === "high"
                                ? "bg-red-300"
                                : ""
                            }`}
                          ></div>
                        )}
                        <div>
                          <div className="capitalize">{option.label}</div>
                          <div className="text-xs text-gray-500">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Channel Settings */}
      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium">Delivery Channel Settings</h2>
          <p className="text-sm text-gray-500">
            Choose how you want to receive your alerts.
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Delivery Channel 1</h3>

          <div className="mb-3">
            <p className="text-sm text-gray-500 mb-1">Channel Type</p>
            <select className="border border-gray-300 rounded-md px-3 py-2 w-full">
              <option>Email</option>
            </select>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Email Address</p>
            <input
              type="email"
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
          + Add Another Channel
        </button>
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
