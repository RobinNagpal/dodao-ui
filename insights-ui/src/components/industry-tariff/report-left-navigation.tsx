'use client';

import { cn } from '@/lib/utils';

import { getNumberOfSubHeadings, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { ChevronDown, ChevronRight, ChevronUp, FileText, Folder, Home, X } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type React from 'react';

interface BookNavigationProps {
  report: IndustryTariffReport;
  industryId: TariffIndustryId;
  isMobile?: boolean;
  onNavItemClick?: () => void;
  onToggle?: () => void;
  showToggle?: boolean;
}

export default function ReportLeftNavigation({ report, industryId, isMobile = false, onNavItemClick, onToggle, showToggle = false }: BookNavigationProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Helper function to check if a path is active
  const isActive = (path: string) => pathname === path;

  // Helper function to check if a section should be expanded
  const isSectionExpanded = (section: string) => {
    if (expandedSections[section] !== undefined) {
      return expandedSections[section];
    }
    return pathname.includes(`/${section}`);
  };

  // Toggle section expansion - only used in mobile view
  const toggleSection = (section: string) => {
    if (isMobile) {
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !isSectionExpanded(section),
      }));
    }
  };

  // Handle navigation item click
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
              <Link href={`/industry-tariff-report/${industryId}`} className="p-1 rounded-full hover:bg-muted link-color" onClick={handleNavClick}>
                <Home className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Navigation items based on IndustryTariffReport structure */}
        <Link
          href={`/industry-tariff-report/${industryId}`}
          className={cn(
            'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium',
            pathname.endsWith(industryId) ? 'bg-primary-color primary-text-color' : 'hover:block-bg-color'
          )}
        >
          <div className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> Introduction
          </div>
        </Link>

        <NavSection
          title="Top 5 Trade Partners"
          section="tariff-updates"
          isExpanded={isSectionExpanded('tariff-updates')}
          reportId={industryId}
          currentPath={pathname}
          isActive={isActive(`/industry-tariff-report/${industryId}/tariff-updates`)}
          onClick={() => toggleSection('tariff-updates')}
          onNavItemClick={handleNavClick}
          isMobile={isMobile}
        />

        <NavSection
          title="All Key Markets"
          section="all-countries-tariff-updates"
          isExpanded={isSectionExpanded('all-countries-tariff-updates')}
          reportId={industryId}
          currentPath={pathname}
          isActive={isActive(`/industry-tariff-report/${industryId}/all-countries-tariff-updates`)}
          onClick={() => toggleSection('all-countries-tariff-updates')}
          onNavItemClick={handleNavClick}
          isMobile={isMobile}
        />

        <NavSection
          title="Understand Industry"
          section="understand-industry"
          reportId={industryId}
          currentPath={pathname}
          isActive={isActive(`/industry-tariff-report/${industryId}/understand-industry`)}
          onClick={() => toggleSection('understand-industry')}
          onNavItemClick={handleNavClick}
          isMobile={isMobile}
        />

        <NavSection
          title="Industry Areas"
          section="industry-areas"
          reportId={industryId}
          currentPath={pathname}
          isActive={isActive(`/industry-tariff-report/${industryId}/industry-areas`)}
          onClick={() => toggleSection('industry-areas')}
          onNavItemClick={handleNavClick}
          isMobile={isMobile}
        />

        <NavSection
          title="Evaluate Industry Areas"
          section="evaluate-industry-areas"
          isExpanded={isSectionExpanded('evaluate-industry-areas')}
          reportId={industryId}
          currentPath={pathname}
          isActive={isActive(`/industry-tariff-report/${industryId}/evaluate-industry-areas`)}
          onClick={() => toggleSection('evaluate-industry-areas')}
          onNavItemClick={handleNavClick}
          isMobile={isMobile}
        >
          {report.industryAreas?.areas?.flatMap((heading, index) => {
            return heading.subAreas.map((subHeading, subIndex) => {
              const indexInArray = index * getNumberOfSubHeadings(industryId) + subIndex;
              const evaluated = report?.evaluateIndustryAreas?.[indexInArray];
              const title = evaluated?.title || subHeading.title || index + '-' + subIndex;
              return (
                <NavItem
                  key={index + '-' + subIndex}
                  title={title}
                  href={`/industry-tariff-report/${industryId}/evaluate-industry-areas/${index + '-' + subIndex}`}
                  isActive={pathname.includes(`/industry-tariff-report/${industryId}/evaluate-industry-areas/${index + '-' + subIndex}`)}
                  isArray
                  onNavItemClick={handleNavClick}
                />
              );
            });
          })}
        </NavSection>

        <NavSection
          title="Final Conclusion"
          section="final-conclusion"
          reportId={industryId}
          currentPath={pathname}
          isActive={isActive(`/industry-tariff-report/${industryId}/final-conclusion`)}
          onClick={() => toggleSection('final-conclusion')}
          onNavItemClick={handleNavClick}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}

// Navigation section component
function NavSection({
  title,
  section,
  isExpanded = false,
  children,
  reportId,
  currentPath,
  isActive = false,
  onClick,
  onNavItemClick,
  isMobile = false,
}: {
  title: string;
  section: string;
  isExpanded?: boolean;
  children?: React.ReactNode;
  reportId: string;
  currentPath: string;
  isActive: boolean;
  onClick?: () => void;
  onNavItemClick?: () => void;
  isMobile?: boolean;
}) {
  // For mobile, we want to handle section clicks differently
  const handleSectionClick = (e: React.MouseEvent) => {
    if (isMobile && children && onClick) {
      e.preventDefault();
      onClick();
    } else if (onNavItemClick) {
      onNavItemClick();
    }
  };

  return (
    <div className="mb-2">
      <Link
        href={`/industry-tariff-report/${reportId}/${section}`}
        className={cn(
          'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium',
          isActive ? 'bg-primary-color primary-text-color' : 'hover:block-bg-color'
        )}
        onClick={handleSectionClick}
      >
        <div className="flex items-center">
          {children ? <Folder className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
          {title}
        </div>
        {children && (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
      </Link>
      {isExpanded && children && <div className="ml-4 mt-1 space-y-1">{children}</div>}
    </div>
  );
}

// Navigation item component
function NavItem({
  title,
  href,
  isActive,
  isArray = false,
  onNavItemClick,
}: {
  title: string;
  href: string;
  isActive: boolean;
  isArray?: boolean;
  onNavItemClick?: () => void;
}) {
  const handleClick = () => {
    if (onNavItemClick) {
      onNavItemClick();
    }
  };

  return (
    <Link
      href={href}
      className={cn(
        'flex w-full items-center rounded-md px-3 py-2 text-left text-sm',
        isActive ? 'bg-primary-color/10 font-medium primary-color' : 'hover:block-bg-color'
      )}
      onClick={handleClick}
    >
      {isArray ? <ChevronUp className="mr-2 h-4 w-4 rotate-90" /> : <FileText className="mr-2 h-4 w-4" />}
      {title}
    </Link>
  );
}
