import { getNumberOfHeadings, getNumberOfSubHeadings } from '@/scripts/industry-tariff-reports/tariff-industries';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';

export default async function EvaluateIndustryAreasPage({ params }: { params: Promise<{ industryId: string }> }) {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  const { industryAreaHeadings } = report;

  if (!industryAreaHeadings?.headings || industryAreaHeadings?.headings?.length === 0) {
    return <div>No industry area headings found</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-6 heading-color">Evaluate Industry Areas</h1>

      {industryAreaHeadings.headings.map((heading, index) => (
        <div key={`heading-${index}`} className="mb-6">
          <h2 className="text-xl font-semibold mb-3 heading-color">{heading.title}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heading.subHeadings.map((subHeading, subIndex) => {
              const indexInArray = index * getNumberOfSubHeadings(industryId) + subIndex;
              const evaluated = report?.evaluateIndustryAreas[indexInArray];

              if (!evaluated) {
                return (
                  <li key={`subheading-${index}-${subIndex}`} className="list-none">
                    Data not available
                  </li>
                );
              }

              return (
                <li key={`subheading-${index}-${subIndex}`} className="list-none">
                  <Link
                    href={`/industry-tariff-report/${industryId}/evaluate-industry-areas/${index}-${subIndex}`}
                    className="block h-full border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="p-5 flex flex-col h-full">
                      <h3 className="text-lg font-medium mb-3 heading-color">{evaluated.title}</h3>

                      {evaluated.aboutParagraphs?.length > 0 && (
                        <p className="text-sm opacity-80 flex-grow">
                          {evaluated.aboutParagraphs.substring(0, 180)}
                          {evaluated.aboutParagraphs.length > 180 && '...'}
                        </p>
                      )}

                      <div className="mt-3 text-sm link-color font-medium">Read analysis →</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
