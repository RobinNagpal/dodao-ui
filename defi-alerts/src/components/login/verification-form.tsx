'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';

interface VerificationFormProps {
  email: string;
  onSubmit: (code: string) => Promise<string | null | undefined>;
  onChangeEmail: () => void;
}

export function VerificationForm({ email, onSubmit, onChangeEmail }: VerificationFormProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotificationContext();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const errorMessage = await onSubmit(verificationCode);

    if (errorMessage) {
      showNotification({
        type: 'error',
        heading: 'Invalid code',
        message: errorMessage,
      });
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 text-center">
        <p className="text-sm text-theme-muted">We’ve sent a verification code to</p>
        <p className="font-medium text-theme-primary">{email}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="verificationCode" className="text-theme-primary">
          Verification Code
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-theme-muted">
            <KeyRound size={18} />
          </div>
          <Input
            id="verificationCode"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="pl-10 tracking-wider font-mono border-theme-border-primary focus-border-primary"
            required
            autoComplete="one-time-code"
            maxLength={6}
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-primary-color text-primary-text border border-transparent hover-border-body" disabled={isSubmitting}>
        {isSubmitting ? 'Verifying...' : 'Sign In'}
      </Button>

      <Button type="button" className="w-full border text-primary-color hover-border-body" onClick={onChangeEmail}>
        Use a different email
      </Button>
    </form>
  );
}
