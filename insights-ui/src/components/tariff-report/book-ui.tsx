'use client';

import type React from 'react';

import { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, FileText, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

// This component will be embedded in your existing app
export default function BookUI({ report }: { report: IndustryTariffReport }) {
  const [activePage, setActivePage] = useState<string>('executiveSummary');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    industryAreaHeadings: false,
    executiveSummary: true,
    introduction: false,
    tariffUpdates: false,
    understandIndustry: false,
    industryAreas: false,
    evaluateIndustryAreas: false,
    finalConclusion: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border bg-background shadow-lg">
      {/* Left side - Book spine/navigation */}
      <div className="w-80 overflow-y-auto border-r bg-muted/30">
        <div className="flex flex-col p-4">
          <h2 className="mb-4 text-xl font-bold">Industry Tariff Report</h2>

          {/* Navigation items based on IndustryTariffReport structure */}
          <NavSection
            title="Industry Area Headings"
            section="industryAreaHeadings"
            isOpen={openSections.industryAreaHeadings}
            toggleSection={toggleSection}
            setActivePage={setActivePage}
            activePage={activePage}
          >
            <NavItem title="Headings" id="industryAreaHeadings.headings" activePage={activePage} setActivePage={setActivePage} isArray />
          </NavSection>

          <NavSection
            title="Executive Summary"
            section="executiveSummary"
            isOpen={openSections.executiveSummary}
            toggleSection={toggleSection}
            setActivePage={setActivePage}
            activePage={activePage}
          >
            <NavItem title="Summary" id="executiveSummary" activePage={activePage} setActivePage={setActivePage} />
          </NavSection>

          <NavSection
            title="Introduction"
            section="introduction"
            isOpen={openSections.introduction}
            toggleSection={toggleSection}
            setActivePage={setActivePage}
            activePage={activePage}
          >
            <NavItem title="About Sector" id="introduction.aboutSector" activePage={activePage} setActivePage={setActivePage} />
            <NavItem title="About Consumption" id="introduction.aboutConsumption" activePage={activePage} setActivePage={setActivePage} />
            <NavItem title="Past Growth" id="introduction.pastGrowth" activePage={activePage} setActivePage={setActivePage} />
            <NavItem title="Future Growth" id="introduction.futureGrowth" activePage={activePage} setActivePage={setActivePage} />
            <NavItem title="US Production" id="introduction.usProduction" activePage={activePage} setActivePage={setActivePage} />
            <NavItem title="Country Specific Imports" id="introduction.countrySpecificImports" activePage={activePage} setActivePage={setActivePage} isArray />
          </NavSection>

          <NavSection
            title="Tariff Updates"
            section="tariffUpdates"
            isOpen={openSections.tariffUpdates}
            toggleSection={toggleSection}
            setActivePage={setActivePage}
            activePage={activePage}
          >
            <NavItem title="Country Specific Tariffs" id="tariffUpdates.countrySpecificTariffs" activePage={activePage} setActivePage={setActivePage} isArray />
          </NavSection>

          <NavSection
            title="Understand Industry"
            section="understandIndustry"
            isOpen={openSections.understandIndustry}
            toggleSection={toggleSection}
            setActivePage={setActivePage}
            activePage={activePage}
          >
            <NavItem title="Overview" id="understandIndustry" activePage={activePage} setActivePage={setActivePage} />
            <NavItem title="Sections" id="understandIndustry.sections" activePage={activePage} setActivePage={setActivePage} isArray />
          </NavSection>

          <NavSection
            title="Industry Areas"
            section="industryAreas"
            isOpen={openSections.industryAreas}
            toggleSection={toggleSection}
            setActivePage={setActivePage}
            activePage={activePage}
          >
            <NavItem title="Areas" id="industryAreas" activePage={activePage} setActivePage={setActivePage} isArray />
          </NavSection>

          <NavSection
            title="Evaluate Industry Areas"
            section="evaluateIndustryAreas"
            isOpen={openSections.evaluateIndustryAreas}
            toggleSection={toggleSection}
            setActivePage={setActivePage}
            activePage={activePage}
          >
            <NavItem title="Areas Evaluation" id="evaluateIndustryAreas" activePage={activePage} setActivePage={setActivePage} isArray />
          </NavSection>

          <NavSection
            title="Final Conclusion"
            section="finalConclusion"
            isOpen={openSections.finalConclusion}
            toggleSection={toggleSection}
            setActivePage={setActivePage}
            activePage={activePage}
          >
            <NavItem title="Conclusion" id="finalConclusion" activePage={activePage} setActivePage={setActivePage} />
            <NavItem title="Positive Impacts" id="finalConclusion.positiveImpacts" activePage={activePage} setActivePage={setActivePage} />
            <NavItem title="Negative Impacts" id="finalConclusion.negativeImpacts" activePage={activePage} setActivePage={setActivePage} />
          </NavSection>
        </div>
      </div>

      {/* Right side - Book content */}
      <div className="flex-1 overflow-y-auto bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative min-h-[calc(100vh-12rem)] rounded-lg bg-white p-8 shadow-md">
            {/* Page corner fold effect */}
            <div className="absolute right-0 top-0 h-12 w-12 bg-muted/20">
              <div className="absolute right-0 top-0 h-0 w-0 border-l-[48px] border-b-[48px] border-l-transparent border-b-white"></div>
            </div>

            {/* Content based on selected page */}
            <ContentRenderer report={report} activePage={activePage} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation section component
function NavSection({
  title,
  section,
  isOpen,
  toggleSection,
  children,
  setActivePage,
  activePage,
}: {
  title: string;
  section: string;
  isOpen: boolean;
  toggleSection: (section: string) => void;
  children: React.ReactNode;
  setActivePage: (page: string) => void;
  activePage: string;
}) {
  return (
    <div className="mb-2">
      <button
        onClick={() => toggleSection(section)}
        className={cn(
          'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium',
          activePage.startsWith(section) ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
        )}
      >
        <div className="flex items-center">
          <Folder className="mr-2 h-4 w-4" />
          {title}
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {isOpen && <div className="ml-4 mt-1 space-y-1">{children}</div>}
    </div>
  );
}

// Navigation item component
function NavItem({
  title,
  id,
  activePage,
  setActivePage,
  isArray = false,
}: {
  title: string;
  id: string;
  activePage: string;
  setActivePage: (page: string) => void;
  isArray?: boolean;
}) {
  return (
    <button
      onClick={() => setActivePage(id)}
      className={cn(
        'flex w-full items-center rounded-md px-3 py-2 text-left text-sm',
        activePage === id ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-muted'
      )}
    >
      {isArray ? <ChevronUp className="mr-2 h-4 w-4 rotate-90" /> : <FileText className="mr-2 h-4 w-4" />}
      {title}
    </button>
  );
}

// Content renderer based on active page
function ContentRenderer({ report, activePage }: { report: IndustryTariffReport; activePage: string }) {
  // Helper function to get nested property by path
  const getNestedProperty = (obj: any, path: string) => {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === undefined) return undefined;
      current = current[part];
    }

    return current;
  };

  // Get content based on active page
  const content = getNestedProperty(report, activePage);

  if (!content) {
    return <div className="prose">Select a section from the navigation</div>;
  }

  // Render different content based on the type and structure
  if (typeof content === 'string') {
    return <div className="prose">{content}</div>;
  }

  if (Array.isArray(content)) {
    return (
      <div className="prose">
        <h2>List Items</h2>
        <ul className="mt-4 space-y-4">
          {content.map((item, index) => (
            <li key={index} className="rounded-md border p-4">
              {typeof item === 'string' ? (
                item
              ) : (
                <div>
                  {item.title && <h3 className="mb-2 text-lg font-medium">{item.title}</h3>}
                  {Object.entries(item).map(([key, value]) => {
                    if (key === 'title') return null;
                    if (typeof value === 'string') {
                      return (
                        <div key={key} className="mb-2">
                          <span className="font-medium">{key}: </span>
                          {value}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // For objects like executiveSummary
  return (
    <div className="prose">
      {content.title && <h1>{content.title}</h1>}
      {Object.entries(content).map(([key, value]) => {
        if (key === 'title') return null;

        if (typeof value === 'string') {
          return (
            <div key={key} className="mb-4">
              <h3 className="text-lg font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
              <p>{value}</p>
            </div>
          );
        }

        if (typeof value === 'object' && value !== null) {
          return (
            <div key={key} className="mb-4">
              <h3 className="text-lg font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
              {Object.entries(value).map(([subKey, subValue]) => {
                if (subKey === 'title') return <h4 key={subKey}>{subValue as string}</h4>;
                if (typeof subValue === 'string') {
                  return <p key={subKey}>{subValue}</p>;
                }
                return null;
              })}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

// Type definitions based on the provided interfaces
export interface TariffReportIndustry {
  name: string;
  companiesToIgnore: string[];
  asOfDate: string;
}

interface PublicCompany {
  name: string;
  ticker: string;
}

export interface IndustrySubHeading {
  title: string;
  oneLineSummary: string;
  companies: PublicCompany[];
}

export interface IndustryHeading {
  title: string;
  oneLineSummary: string;
  subHeadings: IndustrySubHeading[];
}

export interface IndustryAreaHeadings {
  headings: IndustryHeading[];
}

export interface ExecutiveSummary {
  title: string;
  executiveSummary: string;
}

export interface Introduction {
  aboutSector: { title: string; aboutSector: string };
  aboutConsumption: { title: string; aboutConsumption: string };
  pastGrowth: { title: string; aboutGrowth: string };
  futureGrowth: { title: string; aboutGrowth: string };
  usProduction: { title: string; aboutProduction: string };
  countrySpecificImports: Array<{ title: string; aboutImport: string }>;
}

export interface CountrySpecificTariff {
  countryName: string;
  tariffDetails: string;
  changes: string;
}

export interface TariffUpdatesForIndustry {
  countrySpecificTariffs: CountrySpecificTariff[];
}

export interface UnderstandIndustry {
  title: string;
  sections: {
    title: string;
    paragraphs: string[];
  }[];
}

export interface IndustryAreaSection {
  title: string;
  industryAreas: string;
}

export type ChartUrls = { chartCode: string; chartUrl: string }[];

interface CompanyProduct {
  productName: string;
  productDescription: string;
  percentageOfRevenue: string;
  competitors: string[];
}

interface PerformanceMetrics {
  revenueGrowth: string;
  costOfRevenue: string;
  profitabilityGrowth: string;
  rocGrowth: string;
}

export interface NewChallenger {
  companyName: string;
  companyDescription: string;
  companyWebsite: string;
  companyTicker: string;
  products: CompanyProduct[];
  aboutManagement: string;
  uniqueAdvantage: string;
  pastPerformance: PerformanceMetrics;
  futureGrowth: PerformanceMetrics;
  competitors: string;
  impactOfTariffs: string;
  chartUrls?: ChartUrls;
}

export interface EstablishedPlayer {
  companyName: string;
  companyDescription: string;
  companyWebsite: string;
  companyTicker: string;
  products: CompanyProduct[];
  aboutManagement: string;
  uniqueAdvantage: string;
  pastPerformance: PerformanceMetrics;
  futureGrowth: PerformanceMetrics;
  competitors: string;
  impactOfTariffs: string;
  chartUrls?: ChartUrls;
}

export interface HeadwindsAndTailwinds {
  headwinds: string[];
  tailwinds: string[];
  headwindChartUrls?: ChartUrls;
  tailwindChartUrls?: ChartUrls;
}

export interface PositiveTariffImpactOnCompanyType {
  companyType: string;
  impact: string;
  reasoning: string;
  chartUrls?: ChartUrls;
}

export interface NegativeTariffImpactOnCompanyType {
  companyType: string;
  impact: string;
  reasoning: string;
  chartUrls?: ChartUrls;
}

export interface EvaluateIndustryArea {
  title: string;
  aboutParagraphs: string[];
  newChallengers: NewChallenger[];
  establishedPlayers: EstablishedPlayer[];
  headwindsAndTailwinds: HeadwindsAndTailwinds;
  positiveTariffImpactOnCompanyType: PositiveTariffImpactOnCompanyType[];
  negativeTariffImpactOnCompanyType: NegativeTariffImpactOnCompanyType[];
  tariffImpactSummary: string;
  tariffImpactSummaryChartUrls?: ChartUrls;
}

interface PositiveImpacts {
  title: string;
  positiveImpacts: string;
}

interface NegativeImpacts {
  title: string;
  negativeImpacts: string;
}

export interface FinalConclusion {
  title: string;
  conclusionBrief: string;
  positiveImpacts: PositiveImpacts;
  negativeImpacts: NegativeImpacts;
  finalStatements: string;
}

export interface IndustryTariffReport {
  industryAreaHeadings: IndustryAreaHeadings;
  executiveSummary: ExecutiveSummary;
  introduction: Introduction;
  tariffUpdates: TariffUpdatesForIndustry;
  understandIndustry: UnderstandIndustry;
  industryAreas: IndustryAreaSection[];
  evaluateIndustryAreas: EvaluateIndustryArea[];
  finalConclusion: FinalConclusion;
}
