'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, BotIcon, GraduationCap, Sparkles, Target } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

// Import UserRole type from user.ts

// Define props with strict types
interface UserLoginProps {
  onEmailLogin: (email: string) => Promise<string | null>;
  onSignInCodeLogin: (email: string, code: string) => Promise<string | null>;
  errorMessage?: string;
}

export function UserLogin({ onEmailLogin, onSignInCodeLogin, errorMessage: externalErrorMessage }: UserLoginProps) {
  const [email, setEmail] = useState('');
  const [signInCode, setSignInCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'code'>('email');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    let error: string | null = null;

    if (loginMethod === 'email') {
      // Email login
      if (email) {
        error = await onEmailLogin(email);
      }
    } else {
      // Sign-in code login
      if (email && signInCode) {
        error = await onSignInCodeLogin(email, signInCode);
      } else {
        error = 'Please enter both email and sign-in code';
      }
    }

    if (error) {
      setErrorMessage(error);
    }

    setIsLoading(false);
  };

  // Get configuration
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
    focusBorderColor: 'focus:border-blue-400',
    focusRingColor: 'focus:ring-blue-400/20',
    buttonGradient: 'from-blue-600 to-indigo-600',
    buttonHoverGradient: 'hover:from-blue-700 hover:to-indigo-700',
    buttonShadow: 'shadow-blue-500/25',
    switchButtonBorderColor: 'border-purple-200',
    switchButtonTextColor: 'text-purple-600',
    switchButtonHoverBg: 'hover:bg-purple-50',
    switchButtonHoverBorder: 'hover:border-purple-300',
    featureIconGradient1: 'from-blue-100 to-indigo-100',
    featureIconColor1: 'text-blue-600',
    featureIconGradient2: 'from-cyan-100 to-blue-100',
    featureIconColor2: 'text-cyan-600',
    featureIconGradient3: 'from-indigo-100 to-purple-100',
    featureIconColor3: 'text-indigo-600',
    portalTitle: 'Login',
    portalDescription: 'Sign in to start your GenAI simulation journey',
    emailLabel: 'Email Address',
    emailPlaceholder: 'user@university.edu',
    buttonLabel: loginMethod === 'email' ? 'Send Login Email' : 'Sign In with Code',
    feature1: 'Interactive Cases',
    feature2: 'AI-Guided Learning',
    feature3: 'Real-World Skills',
    mainIcon: <GraduationCap className="h-8 w-8 text-white" />,
    buttonIcon: <GraduationCap className="h-4 w-4" />,
    feature1Icon: <BookOpen className="h-6 w-6 text-blue-600" />,
    feature2Icon: <BotIcon className="h-6 w-6 text-cyan-600" />,
    feature3Icon: <Target className="h-6 w-6 text-indigo-600" />,
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
              <div className={`bg-gradient-to-br ${currentConfig.iconBg} p-4 rounded-2xl shadow-lg`}>{currentConfig.mainIcon}</div>
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
                {currentConfig.portalTitle}
              </CardTitle>
            </div>{' '}
            <CardDescription className="text-center text-gray-600">{currentConfig.portalDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    setErrorMessage(null);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    loginMethod === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Email Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('code');
                    setErrorMessage(null);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    loginMethod === 'code' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign-In Code
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {currentConfig.emailLabel}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={currentConfig.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`h-12 bg-white/50 border-gray-200 ${currentConfig.focusBorderColor} ${currentConfig.focusRingColor} transition-all duration-200`}
                />
              </div>

              {loginMethod === 'code' && (
                <div className="space-y-2">
                  <Label htmlFor="signInCode" className="text-sm font-medium text-gray-700">
                    Sign-In Code
                  </Label>
                  <Input
                    id="signInCode"
                    type="text"
                    placeholder="KG-ABC123"
                    value={signInCode}
                    onChange={(e) => setSignInCode(e.target.value)}
                    required
                    className={`h-12 bg-white/50 border-gray-200 ${currentConfig.focusBorderColor} ${currentConfig.focusRingColor} transition-all duration-200`}
                  />
                </div>
              )}

              {errorMessage && <div className="text-red-500 text-sm mt-1">{errorMessage}</div>}

              <Button
                type="submit"
                className={`w-full h-12 bg-gradient-to-r ${currentConfig.buttonGradient} ${currentConfig.buttonHoverGradient} text-white font-medium shadow-lg ${currentConfig.buttonShadow} transition-all duration-200 transform hover:scale-[1.02]`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {currentConfig.buttonIcon}
                    <span>{currentConfig.buttonLabel}</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="flex flex-col items-center space-y-3 group">
            <div className={`bg-gradient-to-br ${currentConfig.featureIconGradient1} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
              {currentConfig.feature1Icon}
            </div>
            <span className="text-sm text-gray-600 text-center font-medium">{currentConfig.feature1}</span>
          </div>
          <div className="flex flex-col items-center space-y-3 group">
            <div className={`bg-gradient-to-br ${currentConfig.featureIconGradient2} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
              {currentConfig.feature2Icon}
            </div>
            <span className="text-sm text-gray-600 text-center font-medium">{currentConfig.feature2}</span>
          </div>
          <div className="flex flex-col items-center space-y-3 group">
            <div className={`bg-gradient-to-br ${currentConfig.featureIconGradient3} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
              {currentConfig.feature3Icon}
            </div>
            <span className="text-sm text-gray-600 text-center font-medium">{currentConfig.feature3}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
