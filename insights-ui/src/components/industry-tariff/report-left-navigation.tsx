'use client';

import { cn } from '@/lib/utils';

import { getNumberOfSubHeadings } from '@/scripts/industry-tariff-reports/tariff-industries';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { ChevronDown, ChevronRight, ChevronUp, FileText, Folder } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';

interface BookNavigationProps {
  report: IndustryTariffReport;
  industryId: string;
}

export default function ReportLeftNavigation({ report, industryId }: BookNavigationProps) {
  const pathname = usePathname();

  console.log('pathname', pathname);
  // Helper function to check if a path is active
  const isActive = (path: string) => pathname === path;

  // Helper function to check if a section should be expanded
  const isSectionExpanded = (section: string) => pathname.includes(`/${section}`);

  return (
    <div className="w-80 overflow-y-auto border-r border-color background-color">
      <div className="flex flex-col p-4">
        <h2 className="mb-4 text-xl font-bold">Industry Tariff Report</h2>

        {/* Navigation items based on IndustryTariffReport structure */}

        <NavSection
          title="Executive Summary"
          section="executive-summary"
          isExpanded={isSectionExpanded('executive-summary')}
          reportId={industryId}
          currentPath={pathname}
          isActive={isActive(`/industry-tariff-report/${industryId}/executive-summary`)}
        />

        <NavSection
          title="Tariff Updates"
          section="tariff-updates"
          isExpanded={isSectionExpanded('tariff-updates')}
          reportId={industryId}
          currentPath={pathname}
          isActive={isActive(`/industry-tariff-report/${industryId}/tariff-updates`)}
        />

        <NavSection
          title="Understand Industry"
          section="understand-industry"
          reportId={industryId}
          currentPath={pathname}
          isActive={isActive(`/industry-tariff-report/${industryId}/understand-industry`)}
        />

        <NavSection
          title="Industry Areas"
          section="industry-areas"
          reportId={industryId}
          currentPath={pathname}
          isActive={isActive(`/industry-tariff-report/${industryId}/industry-areas`)}
        />

        <NavSection
          title="Evaluate Industry Areas"
          section="evaluate-industry-areas"
          isExpanded={isSectionExpanded('evaluate-industry-areas')}
          reportId={industryId}
          currentPath={pathname}
          isActive={isActive(`/industry-tariff-report/${industryId}/evaluate-industry-areas`)}
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
}: {
  title: string;
  section: string;
  isExpanded?: boolean;
  children?: React.ReactNode;
  reportId: string;
  currentPath: string;
  isActive: boolean;
}) {
  return (
    <div className="mb-2">
      <Link
        href={`/industry-tariff-report/${reportId}/${section}`}
        className={cn(
          'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium',
          isActive ? 'bg-primary-color primary-text-color' : 'hover:block-bg-color'
        )}
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
function NavItem({ title, href, isActive, isArray = false }: { title: string; href: string; isActive: boolean; isArray?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex w-full items-center rounded-md px-3 py-2 text-left text-sm',
        isActive ? 'bg-primary-color/10 font-medium primary-color' : 'hover:block-bg-color'
      )}
    >
      {isArray ? <ChevronUp className="mr-2 h-4 w-4 rotate-90" /> : <FileText className="mr-2 h-4 w-4" />}
      {title}
    </Link>
  );
}
