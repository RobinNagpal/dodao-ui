"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import getBaseUrl from "@dodao/web-core/utils/api/getBaseURL";
import { EmailForm } from "@/components/login/email-form";
import { VerificationForm } from "@/components/login/verification-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1 for email, 2 for code
  const router = useRouter();
  const baseUrl = getBaseUrl();

  const handleEmailSubmit = async (submittedEmail: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: submittedEmail }),
      });

      if (!res.ok) {
        throw new Error("Failed to send verification code");
      }

      const { userId } = await res.json();
      localStorage.setItem("email", submittedEmail);
      localStorage.setItem("userId", userId);
      setEmail(submittedEmail);
      setStep(2);
    } catch (err) {
      console.error(err);
      return "Error sending verification code. Please try again.";
    }
  };

  const handleVerificationSubmit = async (verificationCode: string) => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch(`${baseUrl}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode, userId }),
      });

      if (!res.ok) {
        throw new Error("Invalid verification code");
      }

      localStorage.setItem("isLoggedIn", "true");
      router.push("/alerts");
      return null;
    } catch (err) {
      console.error(err);
      return "Incorrect code. Please try again.";
    }
  };

  const handleUseAnotherEmail = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    setStep(1);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold">
              DeFi Alerts
            </CardTitle>
            <CardDescription className="text-center text-slate-500">
              Monitor and receive alerts for DeFi markets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <EmailForm onSubmit={handleEmailSubmit} initialEmail={email} />
            ) : (
              <VerificationForm
                email={email}
                onSubmit={handleVerificationSubmit}
                onChangeEmail={handleUseAnotherEmail}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
