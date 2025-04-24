"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VerificationFormProps {
  email: string;
  onSubmit: (code: string) => Promise<string | null | undefined>;
  onChangeEmail: () => void;
}

export function VerificationForm({
  email,
  onSubmit,
  onChangeEmail,
}: VerificationFormProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const errorMessage = await onSubmit(verificationCode);

    if (errorMessage) {
      setError(errorMessage);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 text-center">
        <p className="text-sm text-slate-500">
          We've sent a verification code to
        </p>
        <p className="font-medium text-slate-700">{email}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="verificationCode">Verification Code</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <KeyRound size={18} />
          </div>
          <Input
            id="verificationCode"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="pl-10 tracking-wider font-mono"
            required
            autoComplete="one-time-code"
            maxLength={6}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full bg-slate-900 hover:bg-slate-800"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Verifying..." : "Sign In"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full text-slate-500 hover:text-slate-900 hover:bg-slate-100"
        onClick={onChangeEmail}
      >
        Use a different email
      </Button>
    </form>
  );
}
