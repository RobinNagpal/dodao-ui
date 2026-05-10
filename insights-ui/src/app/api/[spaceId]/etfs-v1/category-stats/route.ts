import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const UNKNOWN_LABEL = 'Unknown';

export interface EtfCategoryCount {
  category: string;
  count: number;
}

export interface EtfCountryCategoryStats {
  country: string;
  totalEtfs: number;
  categoryCount: number;
  categories: EtfCategoryCount[];
}

export interface EtfCategoryStatsAllResponse {
  scope: 'all';
  totalEtfs: number;
  countryCount: number;
  countries: EtfCountryCategoryStats[];
}

export interface EtfCategoryStatsByCountryResponse {
  scope: 'country';
  country: string;
  totalEtfs: number;
  categoryCount: number;
  categories: EtfCategoryCount[];
}

export type EtfCategoryStatsResponse = EtfCategoryStatsAllResponse | EtfCategoryStatsByCountryResponse;

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<EtfCategoryStatsResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);
  const countryParam = searchParams.get('country')?.trim();

  const grouped = await prisma.etfStockAnalyzerInfo.groupBy({
    by: ['country', 'category'],
    where: { etf: { spaceId } },
    _count: { _all: true },
  });

  const byCountry = new Map<string, Map<string, number>>();
  for (const row of grouped) {
    const country = row.country?.trim() || UNKNOWN_LABEL;
    const category = row.category?.trim() || UNKNOWN_LABEL;
    const count = row._count._all;
    let inner = byCountry.get(country);
    if (!inner) {
      inner = new Map();
      byCountry.set(country, inner);
    }
    inner.set(category, (inner.get(category) ?? 0) + count);
  }

  const buildCategories = (inner: Map<string, number>): EtfCategoryCount[] =>
    Array.from(inner.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));

  if (countryParam) {
    const inner = byCountry.get(countryParam);
    const categories = inner ? buildCategories(inner) : [];
    const totalEtfs = categories.reduce((acc, c) => acc + c.count, 0);
    return {
      scope: 'country',
      country: countryParam,
      totalEtfs,
      categoryCount: categories.length,
      categories,
    };
  }

  const countries: EtfCountryCategoryStats[] = Array.from(byCountry.entries())
    .map(([country, inner]) => {
      const categories = buildCategories(inner);
      const totalEtfs = categories.reduce((acc, c) => acc + c.count, 0);
      return { country, totalEtfs, categoryCount: categories.length, categories };
    })
    .sort((a, b) => b.totalEtfs - a.totalEtfs || a.country.localeCompare(b.country));

  const totalEtfs = countries.reduce((acc, c) => acc + c.totalEtfs, 0);

  return {
    scope: 'all',
    totalEtfs,
    countryCount: countries.length,
    countries,
  };
}

export const GET = withErrorHandlingV2<EtfCategoryStatsResponse>(getHandler);
