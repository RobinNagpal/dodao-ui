"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PersonalizedSetupPage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState("");

  const handleNext = () => {
    // In a real app, you would validate the wallet address and fetch positions
    // For now, we'll just navigate to the next page based on the previous selection
    const alertType =
      localStorage.getItem("selectedPersonalizedAlertType") || "compound";

    if (alertType === "compound") {
      router.push("/alerts/create/personalized-market");
    } else {
      router.push("/alerts/create/personalized-comparison");
    }
  };

  const handleBack = () => {
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
        <span className="text-gray-700">Personalized Setup</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">Set Up Personalized Alerts</h1>
      <p className="text-gray-600 mb-8">
        Configure alerts based on your wallet activity.
      </p>

      <div className="border border-gray-200 rounded-lg p-8 mb-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-2">Enter Your Wallet Address</h2>
          <p className="text-gray-600 mb-6">
            Write your wallet address to see your active positions and set up
            personalized alerts.
          </p>

          <div className="mb-8">
            <label
              htmlFor="walletAddress"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Wallet Address
            </label>
            <input
              type="text"
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            >
              <span className="mr-1">{"<-"}</span> Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-[#0f172a] text-white rounded-md hover:bg-[#1e293b] flex items-center"
            >
              Next <span className="ml-1">{"->"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
