'use client';

import type React from 'react';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { ShieldCheck, BarChart3, LineChart } from 'lucide-react';

// Strict props for the login component
interface UserLoginProps {
  onLogin: (email: string) => void;
  onGoogleSignIn?: () => void;
  errorMessage?: string;
}

export function UserLogin({ onLogin, onGoogleSignIn, errorMessage }: UserLoginProps): JSX.Element {
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
      <div className="mx-auto max-w-md px-6">
        <div className="relative isolate">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                KoalaGains <span className="text-indigo-400">Insights</span>
              </h1>

              <p className="mt-3 text-base leading-7 text-gray-300 max-w-2xl mx-auto">Institutional‑grade, value‑driven stock insights for everyone.</p>
            </div>

            <div className="mt-6">
              <Card className="bg-gray-700/40 backdrop-blur-sm rounded-xl border border-gray-600/40 hover:border-indigo-500/50 transition-all duration-300 shadow-lg">
                <CardHeader>
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

                  {onGoogleSignIn && (
                    <>
                      <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-gray-700/40 px-3 text-gray-400">or</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={onGoogleSignIn}
                        className="w-full h-11 flex items-center justify-center gap-3 rounded-md border border-gray-600 bg-gray-800/60 px-4 text-sm font-medium text-gray-200 hover:bg-gray-700/60 hover:border-gray-500 transition-colors duration-200"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Continue with Google
                      </button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: BarChart3, label: 'Save Favorite Stocks', color: 'from-emerald-500 to-teal-600' },
                { icon: LineChart, label: 'Add Notes to Tickers', color: 'from-blue-500 to-cyan-600' },
                { icon: ShieldCheck, label: 'View Stock Analysis', color: 'from-indigo-500 to-purple-600' },
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
