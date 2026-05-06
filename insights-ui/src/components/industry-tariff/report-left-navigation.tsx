'use client';

import { cn } from '@/lib/utils';

import { ChevronRight, FileText, Home, X } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';

interface ReportLeftNavigationProps {
  // Path the "Introduction" link points at; sections are appended (e.g. `${basePath}/tariff-updates`).
  basePath: string;
  isMobile?: boolean;
  onNavItemClick?: () => void;
  onToggle?: () => void;
  showToggle?: boolean;
  lastModified?: string;
}

const NAV_SECTIONS: ReadonlyArray<{ title: string; section: string }> = [
  { title: 'Tariff Updates - Top 5 Trade Partners', section: 'tariff-updates' },
  { title: 'Understand Industry', section: 'understand-industry' },
  { title: 'Industry Areas', section: 'industry-areas' },
  { title: 'Final Conclusion', section: 'final-conclusion' },
];

export default function ReportLeftNavigation({
  basePath,
  isMobile = false,
  onNavItemClick,
  onToggle,
  showToggle = false,
  lastModified,
}: ReportLeftNavigationProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    if (isMobile && onNavItemClick) {
      onNavItemClick();
    }
  };

  return (
    <div className={cn('overflow-y-auto border-r border-color background-color h-full', isMobile ? 'w-full' : 'w-72')}>
      <div className="flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Explore Report</h2>
          <div className="flex items-center gap-2">
            {showToggle && onToggle && (
              <button onClick={onToggle} className="p-1 rounded-md hover:bg-muted transition-colors" title="Hide navigation">
                <X className="h-5 w-5" />
              </button>
            )}
            {isMobile && (
              <Link href={basePath} className="p-1 rounded-full hover:bg-muted link-color" onClick={handleNavClick}>
                <Home className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        <Link
          href={basePath}
          className={cn(
            'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium',
            pathname === basePath ? 'bg-primary-color primary-text-color' : 'hover:block-bg-color'
          )}
          onClick={handleNavClick}
        >
          <div className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> Introduction
          </div>
        </Link>

        {NAV_SECTIONS.map(({ title, section }) => {
          const href = `${basePath}/${section}`;
          const active = pathname === href;
          return (
            <div key={section} className="mb-2">
              <Link
                href={href}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium',
                  active ? 'bg-primary-color primary-text-color' : 'hover:block-bg-color'
                )}
                onClick={handleNavClick}
              >
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  {title}
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}

        {lastModified && (
          <div className="px-3 py-2 text-xs text-muted-foreground border-t border-color">
            <div className="flex items-center gap-2 mt-2">
              <span className="font-medium">Last Updated:</span>
              <span>
                {new Date(lastModified).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
