'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BookOpen, Users, GraduationCap, Sparkles, Brain, Target } from 'lucide-react';

interface StudentLoginProps {
  onLogin: (email: string) => void;
  onSwitchToInstructor: () => void;
}

export function StudentLogin({ onLogin, onSwitchToInstructor }: StudentLoginProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock login - in real app would validate credentials
    if (email) {
      onLogin(email);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-cyan-400 to-blue-500 p-1 rounded-full">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">GenAI Simulations</h1>
          <p className="text-gray-600 text-base">Master business concepts through intelligent simulations</p>
        </div>

        <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-2xl shadow-blue-500/10">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Student Portal
              </CardTitle>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-300"></div>
            </div>
            <CardDescription className="text-center text-gray-600">Access your personalized learning journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToInstructor}
              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 bg-transparent"
            >
              <Users className="h-4 w-4 mr-2" />
              Switch to Instructor Portal
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="flex flex-col items-center space-y-3 group">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600 text-center font-medium">Interactive Cases</span>
          </div>
          <div className="flex flex-col items-center space-y-3 group">
            <div className="bg-gradient-to-br from-cyan-100 to-blue-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <Brain className="h-6 w-6 text-cyan-600" />
            </div>
            <span className="text-sm text-gray-600 text-center font-medium">AI-Powered Learning</span>
          </div>
          <div className="flex flex-col items-center space-y-3 group">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <Target className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-sm text-gray-600 text-center font-medium">Real-World Skills</span>
          </div>
        </div>
      </div>
    </div>
  );
}
