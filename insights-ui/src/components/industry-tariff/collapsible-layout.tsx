'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReportLeftNavigation from './report-left-navigation';
import { TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import type React from 'react';

interface CollapsibleLayoutProps {
  children: React.ReactNode;
  report: IndustryTariffReport;
  industryId: TariffIndustryId;
}

export default function CollapsibleLayout({ children, report, industryId }: CollapsibleLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative">
      {/* Floating Toggle Button - only visible when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-6 left-6 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
          aria-label="Show navigation"
        >
          <Menu className="h-5 w-5" />
          <span className="text-sm font-medium">Navigation</span>
        </button>
      )}

      <div className="flex min-h-[calc(100vh-10rem)] overflow-hidden rounded-lg border border-color background-color shadow-lg">
        {/* Left side - Book spine/navigation */}
        <div className={cn('transition-all duration-300 ease-in-out overflow-hidden', isSidebarOpen ? 'w-72' : 'w-0')}>
          <div className="w-72 h-full">
            <ReportLeftNavigation report={report} industryId={industryId} onToggle={toggleSidebar} showToggle={true} />
          </div>
        </div>

        {/* Right side - Book content */}
        <div className="flex-1 bg-background p-2 sm:p-3 lg:p-4">
          <div className={cn('mx-auto transition-all duration-300', isSidebarOpen ? 'max-w-4xl' : 'max-w-6xl')}>
            <div className="relative min-h-[calc(100vh-10rem)] rounded-lg block-bg-color p-2 sm:p-2 lg:p-4 shadow-md">
              {/* Page corner fold effect */}
              <div className="absolute right-0 top-0 h-12 w-12 bg-muted/20">
                <div className="absolute right-0 top-0 h-0 w-0 border-l-[48px] border-b-[48px] border-l-transparent border-b-[var(--block-bg)]"></div>
              </div>

              {/* Content from child page */}
              <div className="prose max-w-none">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
