import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { StockScenarioDetail } from '@/app/api/[spaceId]/stock-scenarios/[slug]/route';
import StockScenarioPageLayout from '@/components/stock-scenarios/StockScenarioPageLayout';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { stockScenarioBySlugTag } from '@/utils/stock-scenario-cache-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { parseMarkdown } from '@/util/parse-markdown';

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
    return { title: 'Stock Scenario Detailed Analysis Not Found | KoalaGains' };
  }
  return {
    title: `${scenario.title} — Detailed Analysis | KoalaGains`,
    description: scenario.metaDescription ?? undefined,
  };
}

export default async function StockScenarioDetailedAnalysisPage({ params }: { params: RouteParams }) {
  const { slug } = await params;
  const scenario = await fetchScenarioBySlug(slug);

  if (!scenario || !scenario.detailedAnalysis) {
    notFound();
  }

  const breadcrumbs = [
    { name: 'Stocks', href: '/stocks', current: false },
    { name: 'Scenarios', href: '/stock-scenarios', current: false },
    { name: scenario.title, href: `/stock-scenarios/${scenario.slug}`, current: false },
    { name: 'Detailed analysis', href: `/stock-scenarios/${scenario.slug}/detailed-analysis`, current: true },
  ];

  return (
    <StockScenarioPageLayout breadcrumbs={breadcrumbs}>
      <article className="text-[#E5E7EB]">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{scenario.title}</h1>
          <p className="text-sm text-gray-400">Detailed analysis</p>
        </header>

        <section
          className="markdown-body prose prose-invert max-w-none bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(scenario.detailedAnalysis) as string }}
        />

        <div className="mt-6">
          <Link href={`/stock-scenarios/${scenario.slug}`} className="text-sm text-[#FBBF24] hover:underline">
            ← Back to scenario summary
          </Link>
        </div>
      </article>
    </StockScenarioPageLayout>
  );
}
