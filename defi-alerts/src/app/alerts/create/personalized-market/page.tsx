"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PersonalizedMarketAlertPage() {
  const router = useRouter();
  const [supplyCondition, setSupplyCondition] = useState(
    "APR rises above threshold"
  );
  const [borrowCondition, setBorrowCondition] = useState(
    "APR rises above threshold"
  );
  const [supplyThreshold, setSupplyThreshold] = useState("");
  const [borrowThreshold, setBorrowThreshold] = useState("");
  const [supplyNotificationFrequency, setSupplyNotificationFrequency] =
    useState("At most once every day");
  const [borrowNotificationFrequency, setBorrowNotificationFrequency] =
    useState("At most once every day");
  const [supplySeverity, setSupplySeverity] = useState("none");
  const [borrowSeverity, setBorrowSeverity] = useState("none");
  const [showSupplyConditionDropdown, setShowSupplyConditionDropdown] =
    useState(false);
  const [showBorrowConditionDropdown, setShowBorrowConditionDropdown] =
    useState(false);
  const [showSupplySeverityDropdown, setShowSupplySeverityDropdown] =
    useState(false);
  const [showBorrowSeverityDropdown, setShowBorrowSeverityDropdown] =
    useState(false);

  const handleCreateAlert = () => {
    // In a real app, you would save the alert configuration
    router.push("/alerts");
  };

  const handleCancel = () => {
    router.push("/alerts/create");
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
        <span className="text-gray-700">Personalized Market Alert</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        Create Personalized Market Alert
      </h1>
      <p className="text-gray-600 mb-8">
        Configure market alerts specifically for your positions on Compound.
      </p>

      {/* Personalized Alert Info */}
      <div className="border border-gray-200 rounded-lg p-6 mb-6 flex items-center">
        <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center mr-3">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        </div>
        <div>
          <p className="font-medium">Personalized Alert</p>
          <p className="text-sm text-gray-600">
            This alert will be configured for your wallet’s positions on
            Compound. We’ve pre-selected your active markets.
          </p>
        </div>
      </div>

      {/* Supply Positions */}
      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-2">Supply Positions</h2>
        <p className="text-sm text-gray-500 mb-4">
          Set alert conditions for each of your supply positions.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-medium">Chain</th>
                <th className="text-left py-2 px-4 font-medium">Market</th>
                <th className="text-left py-2 px-4 font-medium">
                  Current Rate
                </th>
                <th className="text-left py-2 px-4 font-medium">
                  Condition Type
                </th>
                <th className="text-left py-2 px-4 font-medium">Threshold</th>
                <th className="text-left py-2 px-4 font-medium">
                  Severity Level
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4">Ethereum</td>
                <td className="py-3 px-4">
                  ETH
                  <div className="text-xs text-gray-500">1.5 ($3,000)</div>
                </td>
                <td className="py-3 px-4">7.8%</td>
                <td className="py-3 px-4 relative">
                  <div
                    className="border border-gray-300 rounded-md px-3 py-2 flex justify-between items-center cursor-pointer"
                    onClick={() =>
                      setShowSupplyConditionDropdown(
                        !showSupplyConditionDropdown
                      )
                    }
                  >
                    <span>{supplyCondition}</span>
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
                  {showSupplyConditionDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                      {[
                        "APR rises above threshold",
                        "APR falls below threshold",
                        "APR is outside a range",
                      ].map((option) => (
                        <div
                          key={option}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSupplyCondition(option);
                            setShowSupplyConditionDropdown(false);
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={supplyThreshold}
                      onChange={(e) => setSupplyThreshold(e.target.value)}
                      placeholder="Value"
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                    />
                    <span className="ml-2">%</span>
                  </div>
                </td>
                <td className="py-3 px-4 relative">
                  <div
                    className="border border-gray-300 rounded-md px-3 py-2 flex justify-between items-center cursor-pointer"
                    onClick={() =>
                      setShowSupplySeverityDropdown(!showSupplySeverityDropdown)
                    }
                  >
                    <span className="capitalize">
                      {supplySeverity === "none" ? "None" : supplySeverity}
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
                  {showSupplySeverityDropdown && (
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
                            setSupplySeverity(option.value);
                            setShowSupplySeverityDropdown(false);
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-1">
            Maximum Notification Frequency
          </p>
          <div className="relative inline-block w-48">
            <select
              value={supplyNotificationFrequency}
              onChange={(e) => setSupplyNotificationFrequency(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md appearance-none pr-8"
            >
              <option>At most once every day</option>
              <option>At most once every week</option>
              <option>At most once every hour</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This limits how often you’ll receive notifications for this alert,
            regardless of how many conditions are triggered.
          </p>
        </div>
      </div>

      {/* Borrow Positions */}
      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-2">Borrow Positions</h2>
        <p className="text-sm text-gray-500 mb-4">
          Set alert conditions for each of your borrow positions.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-medium">Chain</th>
                <th className="text-left py-2 px-4 font-medium">Market</th>
                <th className="text-left py-2 px-4 font-medium">
                  Current Rate
                </th>
                <th className="text-left py-2 px-4 font-medium">
                  Condition Type
                </th>
                <th className="text-left py-2 px-4 font-medium">Threshold</th>
                <th className="text-left py-2 px-4 font-medium">
                  Severity Level
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4">Base</td>
                <td className="py-3 px-4">
                  DAI
                  <div className="text-xs text-gray-500">2,000 ($2,000)</div>
                </td>
                <td className="py-3 px-4">3.8%</td>
                <td className="py-3 px-4 relative">
                  <div
                    className="border border-gray-300 rounded-md px-3 py-2 flex justify-between items-center cursor-pointer"
                    onClick={() =>
                      setShowBorrowConditionDropdown(
                        !showBorrowConditionDropdown
                      )
                    }
                  >
                    <span>{borrowCondition}</span>
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
                  {showBorrowConditionDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                      {[
                        "APR rises above threshold",
                        "APR falls below threshold",
                        "APR is outside a range",
                      ].map((option) => (
                        <div
                          key={option}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setBorrowCondition(option);
                            setShowBorrowConditionDropdown(false);
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={borrowThreshold}
                      onChange={(e) => setBorrowThreshold(e.target.value)}
                      placeholder="Value"
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                    />
                    <span className="ml-2">%</span>
                  </div>
                </td>
                <td className="py-3 px-4 relative">
                  <div
                    className="border border-gray-300 rounded-md px-3 py-2 flex justify-between items-center cursor-pointer"
                    onClick={() =>
                      setShowBorrowSeverityDropdown(!showBorrowSeverityDropdown)
                    }
                  >
                    <span className="capitalize">
                      {borrowSeverity === "none" ? "None" : borrowSeverity}
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
                  {showBorrowSeverityDropdown && (
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
                            setBorrowSeverity(option.value);
                            setShowBorrowSeverityDropdown(false);
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-1">
            Maximum Notification Frequency
          </p>
          <div className="relative inline-block w-48">
            <select
              value={borrowNotificationFrequency}
              onChange={(e) => setBorrowNotificationFrequency(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md appearance-none pr-8"
            >
              <option>At most once every day</option>
              <option>At most once every week</option>
              <option>At most once every hour</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This limits how often you’ll receive notifications for this alert,
            regardless of how many conditions are triggered.
          </p>
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
            <div className="relative inline-block w-full max-w-xs">
              <select className="w-full p-2 border border-gray-300 rounded-md appearance-none pr-8">
                <option>Email</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Email Address</p>
            <input
              type="email"
              className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
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
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateAlert}
          className="px-4 py-2 bg-[#0f172a] text-white rounded-md hover:bg-[#1e293b]"
        >
          Create Personalized Alert
        </button>
      </div>
    </div>
  );
}
