'use client';

import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

interface EmailSentMessageProps {
  email: string;
  onChangeEmail: () => void;
}

export function EmailSentMessage({ email, onChangeEmail }: EmailSentMessageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="rounded-full bg-primary-color/10 p-3">
          <Mail className="h-6 w-6 text-primary-color" />
        </div>
        <h3 className="text-xl font-semibold text-theme-primary">Check your email</h3>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-theme-muted">
          We've sent an email to <span className="font-medium text-theme-primary">{email}</span> with a link to sign in.
        </p>
        <p className="text-sm text-theme-muted">
          Please check your inbox and click on the link to complete your login.
        </p>
      </div>
      
      <Button 
        type="button" 
        className="w-full border text-primary-color hover-border-body" 
        onClick={onChangeEmail}
      >
        Use a different email
      </Button>
    </div>
  );
}
