import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ReportCoverActions from '@/components/industry-tariff/section-actions/ReportCoverActions';
import { getMarkdownContentForReportCover, getMarkdownContentForExecutiveSummary } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
import { getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import type { IndustryTariffReport, ReportCover } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ industryId: string }> }): Promise<Metadata> {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
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

export default async function IndustryTariffReportPage({ params }: { params: Promise<{ industryId: TariffIndustryId }> }) {
  const { industryId } = await params;

  const definition = getTariffIndustryDefinitionById(industryId);

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
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

  const reportCover: ReportCover | undefined = report?.reportCover;
  const markdownContent = reportCover && getMarkdownContentForReportCover(reportCover);

  // Get executive summary content for better SEO
  const executiveSummaryContent = report.executiveSummary ? parseMarkdown(getMarkdownContentForExecutiveSummary(report.executiveSummary)) : null;

  // Prepare tariff updates summary with complete newChanges
  const tariffUpdatesSummary =
    report.tariffUpdates?.countrySpecificTariffs?.map((tariff) => ({
      countryName: tariff.countryName,
      newChangesFirstSentence: tariff.newChanges,
    })) || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">{report?.reportCover?.title || 'Tariff report for ' + industryId}</h1>
        <PrivateWrapper>
          <ReportCoverActions industryId={industryId} />
        </PrivateWrapper>
      </div>

      {/* SEO Warning Banner for Admins */}
      {isSeoMissing && (
        <PrivateWrapper>
          <div className="my-6 sm:my-8 p-3 bg-amber-100 border border-amber-300 rounded-md text-amber-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <span className="font-medium">SEO metadata is missing for this page</span>
              </div>
            </div>
          </div>
        </PrivateWrapper>
      )}

      {/* Report Cover Content */}
      <div
        dangerouslySetInnerHTML={{
          __html: (markdownContent && parseMarkdown(markdownContent)) || 'No content available',
        }}
        className="markdown-body"
      />

      {/* Latest Tariff Actions Summary */}
      {tariffUpdatesSummary.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Latest {definition.name} Tariff Actions</h2>
          <div className="space-y-4 mb-4">
            {tariffUpdatesSummary.map((tariff, index) => (
              <div key={index}>
                <h3 className="font-bold text-lg">{tariff.countryName}</h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdown(tariff.newChangesFirstSentence),
                  }}
                  className="markdown-body"
                />
              </div>
            ))}
          </div>
          <a href={`/industry-tariff-report/${industryId}/tariff-updates`} className="link-color underline font-medium">
            See full country breakdown
          </a>
        </div>
      )}

      {/* Executive Summary Content for SEO */}
      {executiveSummaryContent && (
        <div className="mt-8">
          <div
            dangerouslySetInnerHTML={{
              __html: executiveSummaryContent,
            }}
            className="markdown-body"
          />
        </div>
      )}

      {/* Related Industries Section */}
      {definition.relatedIndustryIds && definition.relatedIndustryIds.length > 0 && (
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-xl font-bold mb-4 text-color">Related Industry Reports</h3>
          <p className="text-muted-foreground mb-6">
            Explore tariff impacts on related industries that may affect your supply chain, sourcing decisions, or market opportunities.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {definition.relatedIndustryIds.map((relatedIndustryId) => {
              const relatedDefinition = getTariffIndustryDefinitionById(relatedIndustryId);
              return (
                <div
                  key={relatedIndustryId}
                  className="flex flex-col overflow-hidden rounded-lg shadow-lg border border-color hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex-1 background-color p-6">
                    <div className="flex items-center text-xs font-medium mb-3">
                      <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                        Related Report
                      </span>
                    </div>

                    <Link href={`/industry-tariff-report/${relatedIndustryId}`} className="block mt-2 group">
                      <h4 className="text-lg font-semibold group-hover:text-primary-color transition-colors text-color">{relatedDefinition.name}</h4>
                    </Link>

                    <p className="mt-3 text-muted-foreground line-clamp-3">{relatedDefinition.reportOneLiner}</p>
                  </div>

                  <div className="block-bg-color border-t border-color p-4">
                    <Link href={`/industry-tariff-report/${relatedIndustryId}`} className="group flex items-center text-sm font-medium primary-color">
                      View report
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
