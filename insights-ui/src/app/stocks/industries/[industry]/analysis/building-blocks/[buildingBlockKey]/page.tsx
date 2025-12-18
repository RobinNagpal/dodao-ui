import type { IndustryAnalysisWithRelations, SubIndustryAnalysisWithRelations } from '@/types/ticker-typesv1';
import AnalysisDisplay from '@/components/analysis/AnalysisDisplay';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getBuildingBlockAnalysisTag, getIndustryAnalysisTag } from '@/utils/ticker-v1-cache-utils';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ industry: string; buildingBlockKey: string }>;
};

export async function generateMetadata(props: { params: Promise<{ industry: string; buildingBlockKey: string }> }): Promise<Metadata> {
  const { industry, buildingBlockKey } = await props.params;
  const decodedBuildingBlockKey = decodeURIComponent(buildingBlockKey);

  try {
    const data = await fetchBuildingBlockAnalysis(industry, decodedBuildingBlockKey);

    return {
      title: `${data.name} - Building Block Analysis`,
      description: data.metaDescription || `Detailed analysis of ${data.name} building block.`,
      openGraph: {
        title: `${data.name} - Building Block Analysis`,
        description: data.metaDescription || `Detailed analysis of ${data.name} building block.`,
        type: 'article',
      },
    };
  } catch (error) {
    return {
      title: `${decodedBuildingBlockKey} - Building Block Analysis`,
      description: `Building block analysis for ${decodedBuildingBlockKey}`,
    };
  }
}

const WEEK = 60 * 60 * 24 * 7;

async function fetchBuildingBlockAnalysis(industryKey: string, buildingBlockKey: string): Promise<SubIndustryAnalysisWithRelations> {
  const baseUrl = getBaseUrlForServerSidePages();

  // Get the specific building block analysis by buildingBlockKey
  const res = await fetch(`${baseUrl}/api/sub-industry-analysis/${encodeURIComponent(buildingBlockKey)}`, {
    next: { revalidate: WEEK, tags: [getBuildingBlockAnalysisTag(industryKey, buildingBlockKey)] },
  });

  return await res.json();
}

async function getIndustryName(industryKey: string): Promise<string> {
  const baseUrl = getBaseUrlForServerSidePages();

  const res = await fetch(`${baseUrl}/api/industry-analysis/${encodeURIComponent(industryKey)}`, {
    next: { revalidate: WEEK, tags: [getIndustryAnalysisTag(industryKey)] },
  });

  const analysis: IndustryAnalysisWithRelations = await res.json();
  return analysis.industry?.name || industryKey;
}

export default async function BuildingBlockAnalysisPage({ params }: PageProps) {
  const resolvedParams = await params;
  const industryKey = decodeURIComponent(resolvedParams.industry);
  const buildingBlockKey = decodeURIComponent(resolvedParams.buildingBlockKey);

  try {
    const [buildingBlockData, industryName] = await Promise.all([fetchBuildingBlockAnalysis(industryKey, buildingBlockKey), getIndustryName(industryKey)]);

    const breadcrumbs = [
      { name: `${industryName} Analysis`, href: `/stocks/industries/${industryKey}/analysis`, current: false },
      { name: `${buildingBlockData.name} Analysis`, href: `/stocks/industries/${industryKey}/analysis/building-blocks/${buildingBlockKey}`, current: true },
    ];

    return <AnalysisDisplay title={buildingBlockData.name} details={buildingBlockData.details} breadcrumbs={breadcrumbs} />;
  } catch (error) {
    console.error('Error fetching building block analysis:', error);
    notFound();
  }
}
