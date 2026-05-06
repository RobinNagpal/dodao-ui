import type { IndustrySeoResponse } from '@/app/api/industry-tariff-reports/[industry]/seo/route';
import type { PageSeoDetails, TariffReportSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { tariffReportTag } from '@/utils/tariff-report-tags';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { Metadata } from 'next';

async function fetchIndustrySeo(industryId: string): Promise<IndustrySeoResponse | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/seo`, {
      next: { tags: [tariffReportTag(industryId)] },
    });
    if (!res.ok) return null;
    return (await res.json()) as IndustrySeoResponse;
  } catch {
    return null;
  }
}

interface MetadataInputs {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords: string[];
}

function buildMetadata({ title, description, canonicalUrl, keywords }: MetadataInputs): Metadata {
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description },
    keywords,
  };
}

type SeoSectionKey = Exclude<keyof TariffReportSeoDetails, 'evaluateIndustryAreasSeoDetails'>;

interface SectionConfig {
  seoKey: SeoSectionKey;
  fallbackTitle: (industryName: string) => string;
  fallbackDescription: (industryName: string) => string;
  fallbackKeywords: (industryName: string) => string[];
}

const SECTION_CONFIGS: Record<'cover' | 'tariffUpdates' | 'understandIndustry' | 'industryAreas' | 'finalConclusion', SectionConfig> = {
  cover: {
    seoKey: 'reportCoverSeoDetails',
    fallbackTitle: (n) => `${n} Tariff Report | Comprehensive Analysis`,
    fallbackDescription: (n) =>
      `Comprehensive analysis of tariff impacts on the ${n} industry, including market trends, company impacts, and strategic implications.`,
    fallbackKeywords: (n) => [n, 'tariff report', 'tariff impact', 'industry analysis', 'market trends', 'trade policy', 'KoalaGains'],
  },
  tariffUpdates: {
    seoKey: 'tariffUpdatesSeoDetails',
    fallbackTitle: (n) => `${n} Top 5 Trade Partners | Trade Impact Analysis`,
    fallbackDescription: (n) =>
      `Detailed analysis of recent tariff changes affecting the ${n} industry, including country-specific impacts and trade agreement changes.`,
    fallbackKeywords: (n) => [n, 'tariff updates', 'trade agreements', 'import tariffs', 'export tariffs', 'KoalaGains'],
  },
  understandIndustry: {
    seoKey: 'understandIndustrySeoDetails',
    fallbackTitle: (n) => `Understanding the ${n} | Industry Overview`,
    fallbackDescription: (n) => `Comprehensive explanation of the ${n} industry, including key operations, value chain, and market dynamics.`,
    fallbackKeywords: (n) => [n, 'industry overview', 'value chain', 'market dynamics', 'business operations', 'industry primer', 'KoalaGains'],
  },
  industryAreas: {
    seoKey: 'industryAreasSeoDetails',
    fallbackTitle: (n) => `${n} Structure | Industry Segments Analysis`,
    fallbackDescription: (n) => `Detailed breakdown of ${n} industry structure, major segments, and how they interact with each other.`,
    fallbackKeywords: (n) => [n, 'industry structure', 'market segments', 'industry breakdown', 'sector analysis', 'industry overview', 'KoalaGains'],
  },
  finalConclusion: {
    seoKey: 'finalConclusionSeoDetails',
    fallbackTitle: (n) => `${n} Final Conclusion | Tariff Impact Summary`,
    fallbackDescription: (n) => `Final conclusion of the ${n} tariff report, summarizing key findings, positive and negative impacts, and future outlook.`,
    fallbackKeywords: (n) => [n, 'final conclusion', 'tariff impact summary', 'industry outlook', 'market forecast', 'tariff analysis', 'KoalaGains'],
  },
};

interface SectionMetadataOptions {
  industryId: string;
  canonicalUrl: string;
  section: keyof typeof SECTION_CONFIGS;
  notFoundFallback: Metadata;
  /** When true, append the report's country names to the fallback keywords (used by tariff-updates page). */
  appendCountryKeywords?: boolean;
}

async function buildSectionMetadata({ industryId, canonicalUrl, section, notFoundFallback, appendCountryKeywords }: SectionMetadataOptions): Promise<Metadata> {
  const seo = await fetchIndustrySeo(industryId);
  if (!seo) return notFoundFallback;

  const cfg = SECTION_CONFIGS[section];
  const sectionSeo = seo.seoDetails?.[cfg.seoKey] as PageSeoDetails | undefined;
  const industryName = seo.industryName || 'Industry';

  const title = sectionSeo?.title || cfg.fallbackTitle(industryName);
  const description = sectionSeo?.shortDescription || cfg.fallbackDescription(industryName);
  let keywords = sectionSeo?.keywords?.length ? sectionSeo.keywords : cfg.fallbackKeywords(industryName);
  if (!sectionSeo?.keywords?.length && appendCountryKeywords && seo.countryNames.length) {
    keywords = [...keywords, ...seo.countryNames].slice(0, 10);
  }

  return buildMetadata({ title, description, canonicalUrl, keywords });
}

export function fetchIndustryCoverMetadata(industryId: string, canonicalUrl: string): Promise<Metadata> {
  return buildSectionMetadata({
    industryId,
    canonicalUrl,
    section: 'cover',
    notFoundFallback: { title: 'Industry Tariff Report', description: 'Comprehensive analysis of tariff impacts on industry' },
  });
}

export function fetchIndustryTariffUpdatesMetadata(industryId: string): Promise<Metadata> {
  return buildSectionMetadata({
    industryId,
    canonicalUrl: `https://koalagains.com/industry-tariff-report/${industryId}/tariff-updates`,
    section: 'tariffUpdates',
    notFoundFallback: { title: 'Top 5 Trade Partners | Industry Report', description: 'Latest tariff updates and their impact on the industry' },
    appendCountryKeywords: true,
  });
}

export function fetchIndustryUnderstandIndustryMetadata(industryId: string): Promise<Metadata> {
  return buildSectionMetadata({
    industryId,
    canonicalUrl: `https://koalagains.com/industry-tariff-report/${industryId}/understand-industry`,
    section: 'understandIndustry',
    notFoundFallback: {
      title: 'Understand Industry | Tariff Report',
      description: 'Comprehensive overview and explanation of the industry structure and operations',
    },
  });
}

export function fetchIndustryAreasMetadata(industryId: string): Promise<Metadata> {
  return buildSectionMetadata({
    industryId,
    canonicalUrl: `https://koalagains.com/industry-tariff-report/${industryId}/industry-areas`,
    section: 'industryAreas',
    notFoundFallback: { title: 'Industry Areas | Tariff Report', description: 'Overview of industry areas and their structure' },
  });
}

export function fetchIndustryFinalConclusionMetadata(industryId: string): Promise<Metadata> {
  return buildSectionMetadata({
    industryId,
    canonicalUrl: `https://koalagains.com/industry-tariff-report/${industryId}/final-conclusion`,
    section: 'finalConclusion',
    notFoundFallback: { title: 'Final Conclusion | Tariff Report', description: 'Final conclusion and summary of the industry tariff report' },
  });
}
