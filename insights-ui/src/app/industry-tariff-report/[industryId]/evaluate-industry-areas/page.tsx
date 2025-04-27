import { getNumberOfHeadings } from '@/scripts/industry-tariff-reports/tariff-industries';
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
    <div>
      <h1 className="text-2xl font-bold mb-6 heading-color">Evaluate Industry Areas</h1>

      {industryAreaHeadings.headings.map((heading, index) => {
        return (
          <div>
            <li>{heading.title}</li>
            {heading.subHeadings.map((subHeading, subIndex) => {
              const indexInArray = index * getNumberOfHeadings(industryId) + subIndex;
              const evaluated = report?.evaluateIndustryAreas[indexInArray];
              if (!evaluated) {
                return null;
              }

              return (
                <Link
                  key={index + '-' + subIndex}
                  href={`/industry-tariff-report/${industryId}/evaluate-industry-areas/${index}-${subIndex}`}
                  className="border rounded-md  p-4 link-color hover:underline"
                >
                  <div>
                    <h3 className="text-lg font-medium mb-2 heading-color">{evaluated.title}</h3>

                    {evaluated.aboutParagraphs?.length > 0 && <p className="mb-2">{evaluated.aboutParagraphs?.substring(0, 200)}...</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
