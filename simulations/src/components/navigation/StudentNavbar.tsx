'use client';

import { Brain, GraduationCap, Sparkles } from 'lucide-react';

interface StudentNavbarProps {
  title: string;
  subtitle?: string;
  userEmail: string;
  moduleNumber?: number;
  exerciseNumber?: number;
  icon?: React.ReactNode;
  iconColor?: string;
}

export default function StudentNavbar({
  title,
  subtitle,
  userEmail,
  moduleNumber,
  exerciseNumber,
  icon,
  iconColor = 'from-blue-500 to-purple-600',
}: StudentNavbarProps) {
  return (
    <header className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4">
            <div className={`bg-gradient-to-br ${iconColor} p-3 rounded-2xl shadow-lg`}>{icon || <GraduationCap className="h-8 w-8 text-white" />}</div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{title}</h1>
              <div className="flex items-center space-x-2">
                {subtitle && (
                  <p className="text-gray-600 flex items-center space-x-1">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span>{subtitle}</span>
                  </p>
                )}
                {moduleNumber && exerciseNumber && (
                  <>
                    {subtitle && <span className="text-gray-400">•</span>}
                    <span className="text-sm text-gray-500 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                      Module {moduleNumber}, Exercise {exerciseNumber}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">{userEmail}</div>
        </div>
      </div>
    </header>
  );
}
