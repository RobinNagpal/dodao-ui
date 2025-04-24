"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailFormProps {
  onSubmit: (email: string) => Promise<string | null | undefined>;
  initialEmail?: string;
}

export function EmailForm({ onSubmit, initialEmail = "" }: EmailFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const errorMessage = await onSubmit(email);

    if (errorMessage) {
      setError(errorMessage);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <AtSign size={18} />
          </div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="pl-10"
            required
            autoComplete="email"
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
        {isSubmitting ? "Sending..." : "Continue with Email"}
      </Button>
    </form>
  );
}
