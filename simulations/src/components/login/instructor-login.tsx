'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Shield, Brain, Sparkles, TrendingUp } from 'lucide-react';

interface InstructorLoginProps {
  onLogin: (email: string) => void;
  onSwitchToStudent: () => void;
}

export function InstructorLogin({ onLogin, onSwitchToStudent }: InstructorLoginProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-300/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-4 rounded-2xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-400 to-purple-500 p-1 rounded-full">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent mb-3">
            GenAI Simulations
          </h1>
          <p className="text-gray-600 text-base">Advanced analytics and student monitoring portal</p>
        </div>

        <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-2xl shadow-purple-500/10">
          <CardHeader className="space-y-1 pb-2">
            <div className="relative flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Instructor Portal
                </CardTitle>
              </div>
              <div className="absolute right-0">
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Faculty
                </Badge>
              </div>
            </div>
            <CardDescription className="text-center text-gray-600">Monitor student progress and analyze learning outcomes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Instructor Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="instructor@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white/50 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Access Portal</span>
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
              onClick={onSwitchToStudent}
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 bg-transparent"
            >
              <Brain className="h-4 w-4 mr-2" />
              Switch to Student Portal
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="flex flex-col items-center space-y-3 group">
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600 text-center font-medium">Progress Analytics</span>
          </div>
          <div className="flex flex-col items-center space-y-3 group">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-sm text-gray-600 text-center font-medium">Student Monitoring</span>
          </div>
          <div className="flex flex-col items-center space-y-3 group">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600 text-center font-medium">Case Study Insights</span>
          </div>
        </div>
      </div>
    </div>
  );
}
