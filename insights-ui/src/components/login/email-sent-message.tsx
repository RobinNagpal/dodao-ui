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
    <div className="overflow-hidden bg-gray-800 rounded-xl">
      <div className="mx-auto max-w-md px-6 py-8 sm:py-10">
        <div className="relative isolate">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg transition-transform duration-300">
                  <Mail className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Check your <span className="text-indigo-400">email</span>
              </h1>

              <p className="mt-4 text-base leading-7 text-gray-300 max-w-2xl mx-auto">We just sent you a secure sign‑in link.</p>
            </div>

            <div className="mt-8">
              <Card className="bg-gray-700/40 backdrop-blur-sm rounded-xl border border-gray-600/40 hover:border-indigo-500/50 transition-all duration-300 shadow-lg">
                <CardHeader className="space-y-1 pb-2">
                  <div className="flex items-center justify-center">
                    <CardTitle className="text-xl font-semibold text-white text-center">Verify your inbox</CardTitle>
                  </div>
                  <CardDescription className="text-center text-gray-300">Open the link to access KoalaGains Insights.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center space-y-5">
                    <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg">
                      <Mail className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>

                    <p className="text-center text-sm text-gray-300 sm:text-base">
                      We have sent a sign‑in link to <span className="font-medium text-white">{email}</span>.
                      <br />
                      Please check your inbox (and spam) and click the link to continue.
                    </p>

                    <Button
                      type="button"
                      className="w-full h-11 border border-indigo-600 bg-transparent text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all duration-200 rounded-lg shadow-lg"
                      onClick={onChangeEmail}
                    >
                      Use a different email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400 sm:text-sm">Did not get it? It can take a minute to arrive.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
