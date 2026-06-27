import { prisma } from '@/prisma';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getCanonicalUrl } from '@/utils/getBaseUrlForServerSidePages';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

export interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
  lastmod?: string;
}

/** Stream a list of URLs into an XML sitemap response — shared by every ETF sitemap route. */
export async function buildEtfSitemapResponse(urls: SiteMapUrl[]): Promise<NextResponse<Buffer>> {
  const smStream = new SitemapStream({ hostname: getCanonicalUrl() });

  for (const url of urls) {
    smStream.write(url);
  }

  smStream.end();
  const response: Buffer = await streamToPromise(smStream);

  return new NextResponse(response as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

// Per-ETF analysis sub-page URL slug for each category. Must match CATEGORY_DISPLAY in
// EtfAnalysisSections.tsx — these are the same routes the on-page report nav links to.
const CATEGORY_PATH_SLUG: Record<EtfAnalysisCategory, string> = {
  [EtfAnalysisCategory.PerformanceAndReturns]: 'performance-returns',
  [EtfAnalysisCategory.CostEfficiencyAndTeam]: 'cost-efficiency-team',
  [EtfAnalysisCategory.RiskAnalysis]: 'risk-analysis',
  [EtfAnalysisCategory.FuturePerformanceOutlook]: 'future-performance-outlook',
};

/**
 * Sitemap for one ETF analysis category's sub-pages (e.g. /etfs/{exchange}/{symbol}/risk-analysis).
 * Mirrors the per-category stock sitemaps: only ETFs that actually have a written report for the
 * category are emitted. The sub-page calls notFound() when the category result is missing, so an
 * ETF without a report would otherwise seed the sitemap with a 404.
 */
export async function buildEtfCategoryReportSitemap(categoryKey: EtfAnalysisCategory): Promise<NextResponse<Buffer>> {
  const results = await prisma.etfCategoryAnalysisResult.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      categoryKey,
      // The sub-page renders overallAnalysisDetails; an empty body is a thin page.
      overallAnalysisDetails: { not: '' },
    },
    select: {
      updatedAt: true,
      etf: { select: { symbol: true, exchange: true } },
    },
  });

  const slug = CATEGORY_PATH_SLUG[categoryKey];
  const urls: SiteMapUrl[] = results.map((result) => ({
    url: `/etfs/${result.etf.exchange}/${result.etf.symbol}/${slug}`,
    changefreq: 'weekly',
    priority: 0.6,
    lastmod: result.updatedAt ? new Date(result.updatedAt).toISOString().split('T')[0] : undefined,
  }));

  return buildEtfSitemapResponse(urls);
}

/**
 * Sitemap for the ETF competition sub-pages (/etfs/{exchange}/{symbol}/competition). Only ETFs with
 * a competition report are included — the page calls notFound() when EtfVsCompetition is missing.
 */
export async function buildEtfCompetitionSitemap(): Promise<NextResponse<Buffer>> {
  const records = await prisma.etfVsCompetition.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      overallAnalysisDetails: { not: '' },
    },
    select: {
      updatedAt: true,
      etf: { select: { symbol: true, exchange: true } },
    },
  });

  const urls: SiteMapUrl[] = records.map((record) => ({
    url: `/etfs/${record.etf.exchange}/${record.etf.symbol}/competition`,
    changefreq: 'weekly',
    priority: 0.6,
    lastmod: record.updatedAt ? new Date(record.updatedAt).toISOString().split('T')[0] : undefined,
  }));

  return buildEtfSitemapResponse(urls);
}

/**
 * Sitemap for the ETF holdings sub-pages (/etfs/{exchange}/{symbol}/holdings). Unlike the analysis
 * sub-pages, the holdings page does not call notFound() when data is missing — it renders an empty
 * table — so gate on the backing EtfMorPortfolioInfo.holdings JSON being present to avoid thin pages.
 */
export async function buildEtfHoldingsSitemap(): Promise<NextResponse<Buffer>> {
  const etfs = await prisma.etf.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      morPortfolioInfo: { is: { holdings: { not: Prisma.DbNull } } },
    },
    select: {
      symbol: true,
      exchange: true,
      updatedAt: true,
      // Prefer the portfolio refresh time for lastmod, fall back to the ETF row's updatedAt.
      morPortfolioInfo: { select: { updatedAt: true } },
    },
  });

  const urls: SiteMapUrl[] = etfs.map((etf) => {
    const lastmodDate = etf.morPortfolioInfo?.updatedAt ?? etf.updatedAt;
    return {
      url: `/etfs/${etf.exchange}/${etf.symbol}/holdings`,
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: lastmodDate ? lastmodDate.toISOString().split('T')[0] : undefined,
    };
  });

  return buildEtfSitemapResponse(urls);
}
