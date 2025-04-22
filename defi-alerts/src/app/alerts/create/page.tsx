"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateAlertPage() {
  const router = useRouter();

  const handleSelectAlertType = (type: string, subtype: string) => {
    if (type === "general" && subtype === "compound") {
      router.push("/alerts/create/compound-market");
    } else if (type === "general" && subtype === "outperforms") {
      router.push("/alerts/create/compare-compound");
    } else if (type === "personalized") {
      // Store the selected personalized alert type for later use
      localStorage.setItem("selectedPersonalizedAlertType", subtype);
      router.push("/alerts/create/personalized-setup");
    }
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
        <span className="text-gray-700">Create Alert</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">Create Alert</h1>
      <p className="text-gray-600 mb-8">
        Choose the type of alert you want to create.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Market Alerts */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">General Market Alerts</h2>
          <p className="text-gray-600 mb-6">
            Monitor any market or chain on Compound
          </p>

          {/* Compound Alerts */}
          <div
            className="border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer hover:border-gray-400 transition flex justify-between items-center"
            onClick={() => handleSelectAlertType("general", "compound")}
          >
            <div>
              <h3 className="font-medium">Compound Alerts</h3>
              <p className="text-gray-500 text-sm">
                Get notified when market rates change
              </p>
            </div>
            <div className="text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>

          {/* When Compound Outperforms */}
          <div
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition flex justify-between items-center"
            onClick={() => handleSelectAlertType("general", "outperforms")}
          >
            <div>
              <h3 className="font-medium">When Compound Outperforms</h3>
              <p className="text-gray-500 text-sm">
                Get notified when Compound offers better rates than other
                protocols
              </p>
            </div>
            <div className="text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Your Personalized Alerts */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Your Personalized Alerts</h2>
          <p className="text-gray-600 mb-6">
            Monitor markets based on your wallet activity
          </p>

          {/* Compound Alerts */}
          <div
            className="border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer hover:border-gray-400 transition flex justify-between items-center"
            onClick={() => handleSelectAlertType("personalized", "compound")}
          >
            <div>
              <h3 className="font-medium">Compound Alerts</h3>
              <p className="text-gray-500 text-sm">
                Get notified when market rates change for your positions
              </p>
            </div>
            <div className="text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>

          {/* When Compound Outperforms */}
          <div
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition flex justify-between items-center"
            onClick={() => handleSelectAlertType("personalized", "outperforms")}
          >
            <div>
              <h3 className="font-medium">When Compound Outperforms</h3>
              <p className="text-gray-500 text-sm">
                Get notified when you can earn more or save more using Compound
                based on your positions
              </p>
            </div>
            <div className="text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
