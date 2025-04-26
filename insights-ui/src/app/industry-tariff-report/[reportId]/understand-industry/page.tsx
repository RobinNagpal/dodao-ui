import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { IndustryTariffReport } from '@/types/industry-tariff/industry-tariff-report-types';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import UnderstandIndustryActions from '@/components/industry-tariff/section-actions/UnderstandIndustryActions';
import Link from 'next/link';

export default async function UnderstandIndustryPage({ params }: { params: { reportId: string } }) {
  const { reportId } = params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${reportId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  const { understandIndustry } = report;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <UnderstandIndustryActions reportId={reportId} />
        </PrivateWrapper>
      </div>

      <h1 className="text-2xl font-bold mb-6 heading-color">{understandIndustry.title}</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 heading-color">Industry Sections</h2>
        <div className="space-y-4">
          {understandIndustry.sections.map((section, index) => (
            <div key={index} className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2 heading-color">{section.title}</h3>
              {section.paragraphs.length > 0 && (
                <p className="mb-2">
                  {section.paragraphs[0]}
                  {section.paragraphs.length > 1 ? '...' : ''}
                </p>
              )}
              <Link href={`/industry-tariff-report/${reportId}/understand-industry/sections/${index}`} className="link-color hover:underline">
                Read more
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
