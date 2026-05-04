import { Metadata } from 'next';
import type { EtfScenarioDetail } from '@/app/api/[spaceId]/etf-scenarios/[slug]/route';
import EtfScenarioDetailActions from '@/app/etf-scenarios/[slug]/EtfScenarioDetailActions';
import EtfScenarioDetailView from '@/components/etf-scenarios/EtfScenarioDetailView';
import EtfScenarioPageLayout from '@/components/etf-scenarios/EtfScenarioPageLayout';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { etfScenarioBySlugTag } from '@/utils/etf-scenario-cache-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { humanizeScenarioSlug } from '@/utils/scenario-slug';
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

  // Render the layout chrome (breadcrumbs + 3-dot admin menu + title)
  // unconditionally so that when the upstream fetch fails or the cache is
  // stuck on a "not found" response, an admin can still reach the
  // "Revalidate This Scenario's Cache" action and recover the page.
  if (!scenario) {
    const fallbackTitle = humanizeScenarioSlug(slug);
    const breadcrumbs = [
      { name: 'US ETFs', href: '/etfs', current: false },
      { name: 'Scenarios', href: '/etf-scenarios', current: false },
      { name: fallbackTitle, href: `/etf-scenarios/${slug}`, current: true },
    ];
    return (
      <EtfScenarioPageLayout breadcrumbs={breadcrumbs} title={fallbackTitle} rightButton={<EtfScenarioDetailActions slug={slug} />}>
        <div className="block-bg-color text-color rounded-md p-6">
          <p className="mb-2 font-semibold">This scenario page is currently unavailable.</p>
          <p className="text-sm opacity-80">
            The most common cause is a stale cache entry. Admins can use the menu in the top right to revalidate this scenario&apos;s cache and reload the page.
          </p>
        </div>
      </EtfScenarioPageLayout>
    );
  }

  const breadcrumbs = [
    { name: 'US ETFs', href: '/etfs', current: false },
    { name: 'Scenarios', href: '/etf-scenarios', current: false },
    { name: scenario.title, href: `/etf-scenarios/${scenario.slug}`, current: true },
  ];

  return (
    <EtfScenarioPageLayout breadcrumbs={breadcrumbs} rightButton={<EtfScenarioDetailActions slug={scenario.slug} />}>
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
