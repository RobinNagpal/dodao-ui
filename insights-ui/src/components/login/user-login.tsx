'use client';

import type React from 'react';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { ShieldCheck, BarChart3, LineChart, TrendingUp } from 'lucide-react';

// Strict props for the login component
interface UserLoginProps {
  onLogin: (email: string) => void;
  errorMessage?: string;
}

export function UserLogin({ onLogin, errorMessage }: UserLoginProps): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateEmail = useCallback((value: string): boolean => {
    // Basic RFC 5322-ish email check (kept simple, explicit typing)
    const pattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setLocalError(null);

      if (!validateEmail(email)) {
        setLocalError('Please enter a valid email address.');
        return;
      }

      setIsLoading(true);

      // Simulate login delay (replace with real auth call)
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));

      onLogin(email);
      setIsLoading(false);
    },
    [email, onLogin, validateEmail]
  );

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-800 ring-1 ring-gray-700">
          <TrendingUp className="h-7 w-7 text-gray-200" aria-hidden />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-100">KoalaGains Insights</h1>
        <p className="mt-2 text-gray-400">Institutional‑grade, value‑driven stock insights for everyone.</p>
      </div>

      <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl text-gray-100 text-center">Sign in</CardTitle>
          <CardDescription className="text-center text-gray-400">Access personalized investment insights</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => setEmail(ev.target.value)}
                required
                className="h-11 bg-gray-950/60 border-gray-800 text-gray-100 placeholder:text-gray-500 focus-visible:ring-gray-500 focus-visible:border-gray-600"
                aria-invalid={Boolean(localError || errorMessage)}
                aria-describedby={localError || errorMessage ? 'email-error' : undefined}
              />
              {(localError || errorMessage) && (
                <p id="email-error" className="text-sm text-red-400">
                  {localError ?? errorMessage}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-11 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-70" disabled={isLoading}>
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-900/30 border-t-gray-900" />
                  <span>Signing in…</span>
                </span>
              ) : (
                <span>Continue</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-lg bg-gray-900/70 ring-1 ring-gray-800 p-2">
            <BarChart3 className="h-5 w-5 text-gray-200" aria-hidden />
          </div>
          <span className="text-xs text-gray-400 text-center">Institutional Signals</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-lg bg-gray-900/70 ring-1 ring-gray-800 p-2">
            <LineChart className="h-5 w-5 text-gray-200" aria-hidden />
          </div>
          <span className="text-xs text-gray-400 text-center">Value Frameworks</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-lg bg-gray-900/70 ring-1 ring-gray-800 p-2">
            <ShieldCheck className="h-5 w-5 text-gray-200" aria-hidden />
          </div>
          <span className="text-xs text-gray-400 text-center">Actionable Picks</span>
        </div>
      </div>
    </div>
  );
}
