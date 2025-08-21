'use client';

import { LogOut, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminNavbarProps {
  title: string;
  subtitle?: string;
  userEmail: string;
  onLogout: () => void;
  icon?: React.ReactNode;
  iconColor?: string;
}

export default function AdminNavbar({ title, subtitle, userEmail, onLogout, icon, iconColor = 'from-emerald-500 to-green-600' }: AdminNavbarProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100/50 shadow-lg relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className={`bg-gradient-to-br ${iconColor} p-3 rounded-2xl shadow-lg`}>{icon || <Shield className="h-8 w-8 text-white" />}</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{title}</h1>
              {subtitle && (
                <p className="text-emerald-600/80 font-medium flex items-center space-x-1">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>{subtitle}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">{userEmail}</div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
