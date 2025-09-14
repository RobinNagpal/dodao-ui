'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { Mail } from 'lucide-react';
import * as React from 'react';

// Strict and explicit prop types
interface EmailSentMessageProps {
  email: string;
  onChangeEmail: () => void;
}

export function EmailSentMessage({ email, onChangeEmail }: EmailSentMessageProps): JSX.Element {
  return (
    <div className="bg-neutral-950 text-neutral-200 flex items-center justify-center p-6 relative">
      {/* Header / Brand */}
      <div className="absolute top-6 left-6 flex items-center gap-3 select-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
          <p className="text-neutral-400 mt-2">We just sent you a secure sign‑in link.</p>
        </div>

        <Card className="bg-neutral-900 border border-neutral-800 text-neutral-200 shadow-xl">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center justify-center">
              <CardTitle className="text-2xl font-semibold text-center">Verify your inbox</CardTitle>
            </div>
            <CardDescription className="text-center text-neutral-400">Open the link to access KoalaGains Insights.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-5">
              <div className="p-3 rounded-full bg-neutral-800 border border-neutral-700">
                <Mail className="h-6 w-6 text-neutral-100" aria-hidden="true" />
              </div>

              <p className="text-center text-sm text-neutral-300">
                We've sent a sign‑in link to <span className="font-medium text-neutral-100">{email}</span>.
                <br />
                Please check your inbox (and spam) and click the link to continue.
              </p>

              <Button
                type="button"
                className="w-full h-11 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 rounded-xl transition-colors"
                onClick={onChangeEmail}
              >
                Use a different email
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-neutral-500">Did not get it? It can take a minute to arrive.</p>
      </div>
    </div>
  );
}
