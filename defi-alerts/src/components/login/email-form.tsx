"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign } from "lucide-react";
import { useNotificationContext } from "@dodao/web-core/ui/contexts/NotificationContext";

interface EmailFormProps {
  onSubmit: (email: string) => Promise<string | null | undefined>;
  initialEmail?: string;
}

export function EmailForm({ onSubmit, initialEmail = "" }: EmailFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotificationContext();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const errorMessage = await onSubmit(email);

    if (errorMessage) {
      showNotification({
        type: "error",
        heading: "Request failed",
        message: errorMessage,
      });
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-theme-primary">
          Email address
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-theme-muted">
            <AtSign size={18} />
          </div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="pl-10 border border-theme-primary focus-border-primary"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full text-primary-text border border-transparent bg-primary-color hover-border-body"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Continue with Email"}
      </Button>
    </form>
  );
}
