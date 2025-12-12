import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ReportCoverActions from '@/components/industry-tariff/section-actions/ReportCoverActions';
import { renderSection } from '@/components/industry-tariff/renderers/SectionRenderer';

import { getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { tariffReportTag } from '@/utils/tariff-report-tags';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ industryId: string }> }): Promise<Metadata> {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, {
    next: { tags: [tariffReportTag(industryId)] },
  });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return {
      title: 'Industry Tariff Report',
      description: 'Comprehensive analysis of tariff impacts on industry',
    };
  }

  // Get the SEO details specific to the report cover
  const seoDetails = report.reportSeoDetails?.reportCoverSeoDetails;

  // Create a title that includes the industry name
  const industryName = report.executiveSummary?.title || 'Industry';
  const seoTitle = seoDetails?.title || `${industryName} Tariff Report | Comprehensive Analysis`;
  const seoDescription =
    seoDetails?.shortDescription ||
    `Comprehensive analysis of tariff impacts on the ${industryName} industry, including market trends, company impacts, and strategic implications.`;
  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${industryId}`;

  // Create keywords from SEO details or fallback to generic ones
  const keywords = seoDetails?.keywords || [industryName, 'tariff report', 'tariff impact', 'industry analysis', 'market trends', 'trade policy', 'KoalaGains'];

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
    },
    keywords: keywords,
  };
}

export default async function IndustryTariffReportPage({ params }: { params: Promise<{ industryId: string }> }) {
  const { industryId } = await params;

  const definition = getTariffIndustryDefinitionById(industryId as TariffIndustryId);

  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, {
    next: { tags: [tariffReportTag(industryId)] },
  });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Report not found</h1>
        <p className="mt-4">The requested industry tariff report could not be found.</p>
      </div>
    );
  }

  // Check if SEO data exists for this page
  const seoDetails = report.reportSeoDetails?.reportCoverSeoDetails;
  const isSeoMissing = !seoDetails || !seoDetails.title || !seoDetails.shortDescription || !seoDetails.keywords?.length;

  // Prepare tariff updates summary with complete newChanges
  const tariffUpdatesSummary =
    report.tariffUpdates?.countrySpecificTariffs?.map((tariff) => ({
      countryName: tariff.countryName,
      newChangesFirstSentence: tariff.newChanges,
    })) || [];

  return (
    <div className="mx-auto max-w-7xl py-2">
      {/* Title and Actions */}
      <div className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold heading-color">{report?.reportCover?.title || 'Tariff report for ' + industryId}</h1>
          <PrivateWrapper>
            <ReportCoverActions industryId={industryId} />
          </PrivateWrapper>
        </div>
      </div>

      {/* SEO Warning Banner for Admins */}
      {isSeoMissing && (
        <PrivateWrapper>
          <div className="mb-8 p-4 bg-amber-100 border border-amber-300 rounded-md text-amber-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <span className="font-medium">SEO metadata is missing for this page</span>
              </div>
            </div>
          </div>
        </PrivateWrapper>
      )}

      <div className="space-y-12">
        {/* Report Cover Content */}
        {renderSection(
          'Overview',
          report.reportCover ? (
            <div
              className="prose max-w-none markdown markdown-body"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(report.reportCover.reportCoverContent) }}
            />
          ) : (
            <p className="text-gray-500 italic">No content available</p>
          )
        )}

        {/* Latest Tariff Actions Summary */}
        {tariffUpdatesSummary.length > 0 &&
          renderSection(
            `Latest ${definition.name} Tariff Actions`,
            <div>
              <div className="space-y-4 mb-4">
                {tariffUpdatesSummary.map((tariff, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="font-bold text-lg mb-2">{tariff.countryName}</h3>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdown(tariff.newChangesFirstSentence),
                      }}
                      className="markdown markdown-body"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <a href={`/industry-tariff-report/${industryId}/tariff-updates`} className="link-color underline font-medium">
                  See full country breakdown
                </a>
              </div>
            </div>
          )}

        {/* Executive Summary Content for SEO */}
        {report.executiveSummary &&
          renderSection(
            'Executive Summary',
            <div
              className="prose max-w-none markdown markdown-body"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(report.executiveSummary.executiveSummary) }}
            />
          )}

        {/* Related Industries Section */}
        {definition.relatedIndustryIds &&
          definition.relatedIndustryIds.length > 0 &&
          renderSection(
            'Related Industry Reports',
            <div>
              <p className="text-muted-foreground mb-6">
                Explore tariff impacts on related industries that may affect your supply chain, sourcing decisions, or market opportunities.
              </p>
              <div className="space-y-6">
                {definition.relatedIndustryIds.map((relatedIndustryId) => {
                  const relatedDefinition = getTariffIndustryDefinitionById(relatedIndustryId);
                  return (
                    <div
                      key={relatedIndustryId}
                      className="bg-gray-900 rounded-lg shadow-sm overflow-hidden border border-color hover:shadow-xl transition-all duration-300"
                    >
                      <div className="background-color p-2">
                        <div className="flex items-center text-xs font-medium mb-3">
                          <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                            Related Report
                          </span>
                        </div>

                        <Link href={`/industry-tariff-report/${relatedIndustryId}`} className="block mt-2 group">
                          <h4 className="text-lg font-semibold group-hover:text-primary-color transition-colors link-color">{relatedDefinition.name}</h4>
                        </Link>

                        <p className="mt-3 text-muted-foreground line-clamp-3">{relatedDefinition.reportOneLiner}</p>

                        <div className="mt-4">
                          <Link href={`/industry-tariff-report/${relatedIndustryId}`} className="group flex items-center text-sm font-medium link-color">
                            View report
                            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
