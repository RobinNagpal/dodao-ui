'use client';

import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';

interface BookContentProps {
  report: IndustryTariffReport;
  activePage: string;
}

export default function BookContent({ report, activePage }: BookContentProps) {
  return (
    <div className="flex-1 overflow-y-auto background-color p-8">
      <div className="mx-auto max-w-4xl">
        <div className="relative min-h-[calc(100vh-16rem)] rounded-lg block-bg-color p-8 shadow-md">
          {/* Page corner fold effect */}
          <div className="absolute right-0 top-0 h-12 w-12 bg-muted/20">
            <div className="absolute right-0 top-0 h-0 w-0 border-l-[48px] border-b-[48px] border-l-transparent border-b-[var(--block-bg)]"></div>
          </div>

          {/* Content based on selected page */}
          <ContentRenderer report={report} activePage={activePage} />
        </div>
      </div>
    </div>
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
