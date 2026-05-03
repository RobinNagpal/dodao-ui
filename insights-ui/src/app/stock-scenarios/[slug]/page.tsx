import { Metadata } from 'next';
import type { StockScenarioDetail } from '@/app/api/[spaceId]/stock-scenarios/[slug]/route';
import StockScenarioDetailActions from '@/app/stock-scenarios/[slug]/StockScenarioDetailActions';
import StockScenarioDetailView from '@/components/stock-scenarios/StockScenarioDetailView';
import StockScenarioPageLayout from '@/components/stock-scenarios/StockScenarioPageLayout';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { humanizeScenarioSlug } from '@/utils/scenario-slug';
import { stockScenarioBySlugTag } from '@/utils/stock-scenario-cache-utils';
import {
  generateStockScenarioDetailArticleJsonLd,
  generateStockScenarioDetailBreadcrumbJsonLd,
  generateStockScenarioDetailMetadata,
} from '@/utils/stock-scenario-metadata-generators';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

type RouteParams = Promise<Readonly<{ slug: string }>>;

const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

async function fetchScenarioBySlug(slug: string): Promise<StockScenarioDetail | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/stock-scenarios/${slug}?allowNull=true`;
  try {
    const res = await fetch(url, {
      next: { revalidate: WEEK_IN_SECONDS, tags: [stockScenarioBySlugTag(slug)] },
    });
    if (!res.ok) return null;
    return (await res.json()) as StockScenarioDetail | null;
  } catch (e) {
    console.error(`Failed to fetch scenario ${slug}:`, e);
    return null;
  }
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { slug } = await params;
  const scenario = await fetchScenarioBySlug(slug);
  if (!scenario) {
    return { title: 'Stock Scenario Not Found | KoalaGains' };
  }
  return generateStockScenarioDetailMetadata({
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

export default async function StockScenarioDetailPage({ params }: { params: RouteParams }) {
  const { slug } = await params;
  const scenario = await fetchScenarioBySlug(slug);

  // Render the layout chrome (breadcrumbs + 3-dot admin menu + title)
  // unconditionally so that when the upstream fetch fails or the cache is
  // stuck on a "not found" response, an admin can still reach the
  // "Revalidate This Scenario's Cache" action and recover the page.
  if (!scenario) {
    const fallbackTitle = humanizeScenarioSlug(slug);
    const breadcrumbs = [
      { name: 'Stocks', href: '/stocks', current: false },
      { name: 'Scenarios', href: '/stock-scenarios', current: false },
      { name: fallbackTitle, href: `/stock-scenarios/${slug}`, current: true },
    ];
    return (
      <StockScenarioPageLayout breadcrumbs={breadcrumbs} title={fallbackTitle} rightButton={<StockScenarioDetailActions slug={slug} />}>
        <div className="block-bg-color text-color rounded-md p-6">
          <p className="mb-2 font-semibold">This scenario page is currently unavailable.</p>
          <p className="text-sm opacity-80">
            The most common cause is a stale cache entry. Admins can use the menu in the top right to revalidate this scenario&apos;s cache and reload the page.
          </p>
        </div>
      </StockScenarioPageLayout>
    );
  }

  const breadcrumbs = [
    { name: 'Stocks', href: '/stocks', current: false },
    { name: 'Scenarios', href: '/stock-scenarios', current: false },
    { name: scenario.title, href: `/stock-scenarios/${scenario.slug}`, current: true },
  ];

  return (
    <StockScenarioPageLayout breadcrumbs={breadcrumbs} rightButton={<StockScenarioDetailActions slug={scenario.slug} />}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateStockScenarioDetailArticleJsonLd({
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
          __html: JSON.stringify(generateStockScenarioDetailBreadcrumbJsonLd({ title: scenario.title, slug: scenario.slug })),
        }}
      />

      <StockScenarioDetailView scenario={scenario} />
    </StockScenarioPageLayout>
  );
}
