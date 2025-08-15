'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, BarChart3, Shield, Eye, EyeOff } from 'lucide-react';

interface InstructorLoginProps {
  onLogin: (email: string) => void;
  onSwitchToStudent: () => void;
}

export function InstructorLogin({ onLogin, onSwitchToStudent }: InstructorLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock login - in real app would validate credentials
    if (email && password) {
      onLogin(email);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-purple-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GenAI Simulations</h1>
          <p className="text-gray-600">Professor monitoring and analytics portal</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Instructor Login</CardTitle>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Instructor Portal
              </Badge>
            </div>
            <CardDescription className="text-center">Monitor student progress and case study analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="instructor@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button variant="ghost" size="sm" onClick={onSwitchToStudent} className="text-blue-600 hover:text-blue-700">
                Switch to Student Portal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructor Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <span className="text-xs text-gray-600">Progress Analytics</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Users className="h-6 w-6 text-purple-600" />
            <span className="text-xs text-gray-600">Student Monitoring</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <BookOpen className="h-6 w-6 text-purple-600" />
            <span className="text-xs text-gray-600">Case Study Insights</span>
          </div>
        </div>
      </div>
    </div>
  );
}
