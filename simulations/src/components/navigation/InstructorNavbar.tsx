'use client';

import { logoutUser } from '@/utils/auth-utils';
import { LogOut, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstructorNavbarProps {
  title: string;
  subtitle?: string;
  userEmail?: string;
  icon?: React.ReactNode;
  iconColor?: string;
}

export default function InstructorNavbar({ title, subtitle, userEmail, icon, iconColor = 'from-purple-500 to-indigo-600' }: InstructorNavbarProps) {
  return (
    <header className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className={`bg-gradient-to-br ${iconColor} p-3 rounded-2xl shadow-lg`}>{icon || <GraduationCap className="h-8 w-8 text-white" />}</div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{title}</h1>
              {subtitle && (
                <p className="text-gray-600 flex items-center space-x-1">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>{userEmail ? `${subtitle}, ${userEmail}` : subtitle}</span>
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={logoutUser}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 bg-transparent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
