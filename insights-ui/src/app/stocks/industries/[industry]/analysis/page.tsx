import type { IndustryAnalysisWithRelations } from '@/types/ticker-typesv1';
import AnalysisDisplay from '@/components/analysis/AnalysisDisplay';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getIndustryAnalysisTag } from '@/utils/ticker-v1-cache-utils';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ industry: string }>;
};

export async function generateMetadata(props: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await props.params;
  const industryKey = decodeURIComponent(industry);

  try {
    const data = await fetchIndustryAnalysis(industryKey);

    return {
      title: `${data.name} - Industry Analysis`,
      description: data.metaDescription || `Comprehensive analysis of ${data.name} industry trends, insights, and market dynamics.`,
      openGraph: {
        title: `${data.name} - Industry Analysis`,
        description: data.metaDescription || `Comprehensive analysis of ${data.name} industry trends, insights, and market dynamics.`,
        type: 'article',
      },
    };
  } catch (error) {
    return {
      title: `${industryKey} - Industry Analysis`,
      description: `Industry analysis for ${industryKey}`,
    };
  }
}

async function fetchIndustryAnalysis(industryKey: string): Promise<IndustryAnalysisWithRelations> {
  const baseUrl = getBaseUrlForServerSidePages();

  // Get the specific industry analysis by industryKey
  const res = await fetch(`${baseUrl}/api/industry-analysis/${encodeURIComponent(industryKey)}`, {
    next: { tags: [getIndustryAnalysisTag(industryKey)] },
  });

  return await res.json();
}

export default async function IndustryAnalysisPage({ params }: PageProps) {
  const resolvedParams = await params;
  const industryKey = decodeURIComponent(resolvedParams.industry);

  try {
    const data = await fetchIndustryAnalysis(industryKey);

    const breadcrumbs = [{ name: `${data.industry.name} Analysis`, href: `/stocks/industries/${industryKey}/analysis`, current: true }];

    return <AnalysisDisplay title={data.name} details={data.details} breadcrumbs={breadcrumbs} />;
  } catch (error) {
    console.error('Error fetching industry analysis:', error);
    notFound();
  }
}
