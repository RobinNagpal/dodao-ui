import CommodityCategoryPageContent, { buildCommodityCategoryMetadata } from '@/components/commodity-reports/CommodityCategoryPageContent';
import { CommodityAnalysisCategory } from '@/types/commodity/commodity-analysis-types';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const CATEGORY_KEY = CommodityAnalysisCategory.FutureOutlook;
type RouteParams = Promise<Readonly<{ slug: string }>>;

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { slug } = await params;
  return buildCommodityCategoryMetadata(slug, CATEGORY_KEY);
}

export default async function Page({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const { slug } = await params;
  return CommodityCategoryPageContent({ slug, categoryKey: CATEGORY_KEY });
}
