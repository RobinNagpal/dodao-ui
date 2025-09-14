'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { GraduationCap, Mail, Sparkles } from 'lucide-react';

interface EmailSentMessageProps {
  email: string;
  onChangeEmail: () => void;
}

export function EmailSentMessage({ email, onChangeEmail }: EmailSentMessageProps) {
  // Use the same configuration as in user-login.tsx
  const currentConfig = {
    gradientFrom: 'from-indigo-50',
    gradientTo: 'to-cyan-50',
    bgGradient1: 'from-blue-400/20 to-indigo-600/20',
    bgGradient2: 'from-cyan-400/20 to-blue-600/20',
    bgGradient3: 'from-indigo-300/10 to-purple-400/10',
    iconBg: 'from-blue-600 to-indigo-700',
    sparklesBg: 'from-cyan-400 to-blue-500',
    titleGradient: 'from-gray-900 via-blue-800 to-indigo-800',
    cardTitleGradient: 'from-blue-600 to-indigo-600',
    buttonGradient: 'from-blue-600 to-indigo-600',
    buttonHoverGradient: 'hover:from-blue-700 hover:to-indigo-700',
    buttonShadow: 'shadow-blue-500/25',
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${currentConfig.gradientFrom} via-white ${currentConfig.gradientTo} flex items-center justify-center p-4 relative overflow-hidden`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${currentConfig.bgGradient1} rounded-full blur-3xl animate-pulse`}></div>
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br ${currentConfig.bgGradient2} rounded-full blur-3xl animate-pulse delay-1000`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br ${currentConfig.bgGradient3} rounded-full blur-3xl animate-pulse delay-500`}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className={`bg-gradient-to-br ${currentConfig.iconBg} p-4 rounded-2xl shadow-lg`}>
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className={`absolute -top-1 -right-1 bg-gradient-to-r ${currentConfig.sparklesBg} p-1 rounded-full`}>
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className={`text-3xl font-bold bg-gradient-to-r ${currentConfig.titleGradient} bg-clip-text text-transparent mb-3`}>GenAI Simulations</h1>
          <p className="text-gray-600 text-base">Learn business concepts through Gen AI powered cases</p>
        </div>

        <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-2xl shadow-purple-500/10">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center justify-center space-x-2">
              <CardTitle className={`text-2xl font-bold text-center bg-gradient-to-r ${currentConfig.cardTitleGradient} bg-clip-text text-transparent`}>
                Check Your Email
              </CardTitle>
            </div>
            <CardDescription className="text-center text-gray-600">We have sent you a secure sign-in link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className={`bg-gradient-to-br ${currentConfig.iconBg} p-3 rounded-full shadow-lg`}>
                <Mail className="h-6 w-6 text-white" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-gray-600">
                  We have sent a secure sign-in link to <span className="font-medium text-gray-800">{email}</span>. Please check your inbox and click the link
                  to continue your GenAI simulation journey.
                </p>
              </div>

              <Button
                type="button"
                className={`w-full h-12 bg-gradient-to-r ${currentConfig.buttonGradient} ${currentConfig.buttonHoverGradient} text-white font-medium shadow-lg ${currentConfig.buttonShadow} transition-all duration-200 transform hover:scale-[1.02]`}
                onClick={onChangeEmail}
              >
                Use a Different Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
