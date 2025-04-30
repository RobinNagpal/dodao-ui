import PrivateWrapper from '@/components/auth/PrivateWrapper';
import TariffUpdatesActions from '@/components/industry-tariff/section-actions/TariffUpdatesActions';

import { getMarkdownContentForCountryTariffs } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default async function TariffUpdatesPage({ params }: { params: Promise<{ industryId: string }> }) {
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

  if (!report.tariffUpdates) {
    return <div>No tariff updates available</div>;
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">Tariff Updates</h1>
        <PrivateWrapper>
          <TariffUpdatesActions industryId={industryId} />
        </PrivateWrapper>
      </div>

      {report.tariffUpdates.countrySpecificTariffs.map((countryTariff, index) => {
        const markdownContent = getMarkdownContentForCountryTariffs(countryTariff);
        return (
          <div key={countryTariff.countryName} className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{countryTariff.countryName}</h2>
              <PrivateWrapper>
                <TariffUpdatesActions industryId={industryId} tariffIndex={index} countryName={countryTariff.countryName} />
              </PrivateWrapper>
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: markdownContent && parseMarkdown(markdownContent),
              }}
              className="markdown-body"
            />
          </div>
        );
      })}
    </div>
  );
}
