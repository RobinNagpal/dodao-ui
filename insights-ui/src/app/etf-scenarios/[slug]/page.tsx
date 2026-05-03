import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { EtfScenarioDetail } from '@/app/api/[spaceId]/etf-scenarios/[slug]/route';
import EtfScenarioDetailView from '@/components/etf-scenarios/EtfScenarioDetailView';
import EtfScenarioPageLayout from '@/components/etf-scenarios/EtfScenarioPageLayout';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { etfScenarioBySlugTag } from '@/utils/etf-scenario-cache-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import {
  generateEtfScenarioDetailArticleJsonLd,
  generateEtfScenarioDetailBreadcrumbJsonLd,
  generateEtfScenarioDetailMetadata,
} from '@/utils/etf-scenario-metadata-generators';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

type RouteParams = Promise<Readonly<{ slug: string }>>;

const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

async function fetchScenarioBySlug(slug: string): Promise<EtfScenarioDetail | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etf-scenarios/${slug}?allowNull=true`;
  try {
    const res = await fetch(url, {
      next: { revalidate: WEEK_IN_SECONDS, tags: [etfScenarioBySlugTag(slug)] },
    });
    if (!res.ok) return null;
    return (await res.json()) as EtfScenarioDetail | null;
  } catch (e) {
    console.error(`Failed to fetch scenario ${slug}:`, e);
    return null;
  }
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { slug } = await params;
  const scenario = await fetchScenarioBySlug(slug);
  if (!scenario) {
    return { title: 'ETF Scenario Not Found | KoalaGains' };
  }
  return generateEtfScenarioDetailMetadata({
    title: scenario.title,
    slug: scenario.slug,
    probabilityBucket: scenario.probabilityBucket,
    outlookAsOfDate: scenario.outlookAsOfDate.slice(0, 10),
    metaDescription: scenario.metaDescription,
    summary: scenario.summary,
    createdTime: scenario.createdAt,
    updatedTime: scenario.updatedAt,
  });
}

export default async function EtfScenarioDetailPage({ params }: { params: RouteParams }) {
  const { slug } = await params;
  const scenario = await fetchScenarioBySlug(slug);

  if (!scenario) {
    notFound();
  }

  const breadcrumbs = [
    { name: 'US ETFs', href: '/etfs', current: false },
    { name: 'Scenarios', href: '/etf-scenarios', current: false },
    { name: scenario.title, href: `/etf-scenarios/${scenario.slug}`, current: true },
  ];

  return (
    <EtfScenarioPageLayout breadcrumbs={breadcrumbs}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateEtfScenarioDetailArticleJsonLd({
              title: scenario.title,
              slug: scenario.slug,
              summary: scenario.summary,
              publishedDate: scenario.createdAt,
              modifiedDate: scenario.updatedAt,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateEtfScenarioDetailBreadcrumbJsonLd({ title: scenario.title, slug: scenario.slug })),
        }}
      />

      <EtfScenarioDetailView scenario={scenario} />
    </EtfScenarioPageLayout>
  );
}
