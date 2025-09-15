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
    <div className="overflow-hidden bg-gray-800 rounded-xl">
      <div className="mx-auto max-w-md px-6 py-8 sm:py-10">
        <div className="relative isolate">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" aria-hidden />
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                KoalaGains <span className="text-indigo-400">Insights</span>
              </h1>

              <p className="mt-4 text-base leading-7 text-gray-300 max-w-2xl mx-auto">Institutional‑grade, value‑driven stock insights for everyone.</p>
            </div>

            <div className="mt-8">
              <Card className="bg-gray-700/40 backdrop-blur-sm rounded-xl border border-gray-600/40 hover:border-indigo-500/50 transition-all duration-300 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold text-white text-center">Sign in</CardTitle>
                  <CardDescription className="text-center text-gray-300">Access personalized investment insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-200 font-medium">
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
                        className="h-11 bg-gray-800/60 border-gray-600 text-gray-100 placeholder:text-gray-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-600 transition-colors duration-200"
                        aria-invalid={Boolean(localError || errorMessage)}
                        aria-describedby={localError || errorMessage ? 'email-error' : undefined}
                      />
                      {(localError || errorMessage) && (
                        <p id="email-error" className="text-sm text-red-400">
                          {localError ?? errorMessage}
                        </p>
                      )}
                    </div>

                    <Button type="submit" variant="contained" className="w-full h-11 bg-gradient-to-r " disabled={isLoading} primary={true}>
                      {isLoading ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          <span>Signing in…</span>
                        </span>
                      ) : (
                        <span>Continue</span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: BarChart3, label: 'Institutional Signals', color: 'from-emerald-500 to-teal-600' },
                { icon: LineChart, label: 'Value Frameworks', color: 'from-blue-500 to-cyan-600' },
                { icon: ShieldCheck, label: 'Actionable Picks', color: 'from-indigo-500 to-purple-600' },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2 group transition-all duration-300">
                  <div className={`rounded-lg p-2 bg-gradient-to-r ${item.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <item.icon className="h-5 w-5 text-white sm:h-6 sm:w-6" aria-hidden />
                  </div>
                  <span className="text-xs text-gray-300 text-center sm:text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
