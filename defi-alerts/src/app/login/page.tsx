"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState(1); // 1 for email entry, 2 for verification code
  const router = useRouter();

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      setStep(2);
    }
  };

  const handleVerificationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (verificationCode) {
      // In a real app, you would verify the code here
      router.push("/alerts");
    }
  };

  const handleUseAnotherEmail = () => {
    setStep(1);
    setVerificationCode("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-6 border border-gray-200 rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-2">
          Compound III Alerts
        </h1>

        {step === 1 ? (
          <>
            <p className="text-gray-600 text-center mb-6">
              Enter your email to sign in to your account
            </p>

            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0f172a] text-white py-3 rounded-md hover:bg-[#1e293b] transition mb-3"
              >
                Continue with Email
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-gray-600 text-center mb-4">
              Enter the verification code sent to your email
            </p>

            <p className="text-gray-600 text-center mb-6">
              We sent a verification code to {email}
            </p>

            <form onSubmit={handleVerificationSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="verificationCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0f172a] text-white py-3 rounded-md hover:bg-[#1e293b] transition mb-3"
              >
                Sign In
              </button>
            </form>

            <button
              onClick={handleUseAnotherEmail}
              className="w-full text-center text-gray-600 hover:text-gray-900"
            >
              Use a different email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
