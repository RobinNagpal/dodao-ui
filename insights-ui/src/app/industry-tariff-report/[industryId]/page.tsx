import { renderIndustryCoverBody } from '@/components/industry-tariff/cover/IndustryCoverBody';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { tariffReportTag } from '@/utils/tariff-report-tags';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ industryId: string }> }): Promise<Metadata> {
  const { industryId } = await params;

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

  const seoDetails = report.reportSeoDetails?.reportCoverSeoDetails;

  const industryName = report.executiveSummary?.title || 'Industry';
  const seoTitle = seoDetails?.title || `${industryName} Tariff Report | Comprehensive Analysis`;
  const seoDescription =
    seoDetails?.shortDescription ||
    `Comprehensive analysis of tariff impacts on the ${industryName} industry, including market trends, company impacts, and strategic implications.`;
  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${industryId}`;

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
  return renderIndustryCoverBody(industryId);
}
