// File: src/app/alerts/create/personalized-setup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PersonalizedSetupPage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState("");

  const handleNext = () => {
    if (!walletAddress) {
      alert("Enter a wallet address");
      return;
    }
    // stash for downstream
    localStorage.setItem("walletAddress", walletAddress);

    // route based on earlier choice
    const alertType =
      localStorage.getItem("selectedPersonalizedAlertType") || "compound";

    if (alertType === "compound") {
      router.push("/alerts/create/personalized-market");
    } else {
      router.push("/alerts/create/personalized-comparison");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* …breadcrumb… */}
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
      <div className="border p-8 rounded-lg mb-6">
        <label className="block mb-2 font-medium">Wallet Address</label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="0x…"
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => router.push("/alerts/create")}
          className="px-6 py-2 border rounded"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-[#0f172a] text-white rounded"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
