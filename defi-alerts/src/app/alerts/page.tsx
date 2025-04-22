"use client";

import { useRouter } from "next/navigation";

export default function AlertsPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Alerts Page</h1>
      <button
        onClick={() => router.push("/alerts/create")}
        className="px-4 py-2 bg-[#0f172a] text-white rounded-md hover:bg-[#1e293b] transition"
      >
        Create New Alert
      </button>
    </div>
  );
}
