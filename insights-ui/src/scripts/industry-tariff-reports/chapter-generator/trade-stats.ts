import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type {
  TariffImportsByCountry,
  TariffImportsByHeadingCountry,
  TariffImportsByLine,
  TariffImportsByYear,
  TariffStat,
  TariffUnderstandIndustryContent,
} from '@/types/tariff-chapter-prototype';

/**
 * Trade statistics for the Approach-2 chapter generator.
 *
 * `fetch-trade.ts` downloads U.S. imports for one HS chapter from the UN
 * Comtrade public API and writes a compact summary to
 * `src/tariff-data/trade/chapter-NN.json` (shape: {@link TradeSummary}).
 * {@link buildUnderstandIndustry} turns that summary into the
 * `understandIndustry` block of a chapter content file. Narrative fields
 * (`h1`, `seo`, `why`) are left as "TODO" for the writer agents.
 */

export const TRADE_DATA_DIR = path.join(process.cwd(), 'src', 'tariff-data', 'trade');

export const COMTRADE_VALUE_BASIS = 'CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade.';
export const COMTRADE_COVERAGE_NOTE = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade.';

/** Placeholder for narrative fields that a writer agent fills in. */
export const TODO = 'TODO';

export interface TradeSummaryCountry {
  /** UN M49 partner code as used by Comtrade (e.g. 124 = Canada, 490 = "Other Asia, nes"). */
  countryCode: number;
  /** Partner name exactly as Comtrade reports it. */
  country: string;
  importsUsd: number;
  priorImportsUsd: number;
  /** Imports per year, keyed by year ("2021"). Missing years mean no reported trade. */
  byYear: Record<string, number>;
}

export interface TradeSummaryHeading {
  /** Four-digit HS heading ("0102"). */
  heading: string;
  /** Comtrade (HS 2022) description. */
  description: string;
  byYear: Record<string, number>;
}

export interface TradeSummaryHs6 {
  /** Six-digit HS code, undotted ("010229"). */
  hs6: string;
  heading: string;
  /** Comtrade (HS 2022) description. */
  description: string;
  importsUsd: number;
  priorImportsUsd: number;
}

export interface TradeSummary {
  chapter: number;
  /** "01" */
  chapterPadded: string;
  /** Comtrade (HS 2022) chapter description. */
  chapterDescription: string;
  /** Which API the numbers came from. */
  source: 'un-comtrade-public-preview';
  sourceLabel: string;
  /** Public portal + the API endpoint pattern used. */
  sourceUrls: string[];
  /** ISO date (YYYY-MM-DD) the data was downloaded. */
  retrievedAt: string;
  reporter: { code: number; name: string };
  flow: 'M';
  valueBasis: string;
  years: number[];
  latestYear: number;
  priorYear: number;
  totalsByYear: { year: number; totalUsd: number; partnerCount: number }[];
  /** Every partner with imports in the latest or prior year, largest latest-year value first. */
  byCountry: TradeSummaryCountry[];
  byHeading: TradeSummaryHeading[];
  /** Every HS6 line with imports in the latest or prior year, largest latest-year value first. */
  byHs6: TradeSummaryHs6[];
  /** Latest-year imports for each heading x partner (non-zero only). */
  byHeadingCountry: TariffImportsByHeadingCountry[];
  /** Sum checks: heading and HS6 totals vs the chapter total for the latest year. */
  checks: { label: string; expectedUsd: number; actualUsd: number; diffUsd: number }[];
}

export interface TradeChapterInfo {
  number: number;
  title: string;
  /** Short heading labels ("0102" -> "Cattle & buffalo"), e.g. from overview.productGroups. Falls back to the Comtrade description. */
  headingLabels?: Record<string, string>;
  /** Override the two partners broken out in `byYear` (default: the two largest latest-year partners). */
  byYearPartners?: [string, string];
  /** How many partners to list in `byCountry` before "others" (default 10). */
  topCountries?: number;
  /** Duty actually paid, when an official figure is available. Without it `effectiveDuty` is a TODO placeholder. */
  effectiveDuty?: { year: number; dutyPaidUsd: number; note: string };
}

const USMCA_PARTNERS = new Set(['Canada', 'Mexico']);

export function tradeSummaryPath(chapter: number): string {
  return path.join(TRADE_DATA_DIR, `chapter-${String(chapter).padStart(2, '0')}.json`);
}

export function loadTradeSummary(chapter: number): TradeSummary {
  const file = tradeSummaryPath(chapter);
  if (!existsSync(file)) {
    throw new Error(`No trade summary at ${file}. Run: pnpm tariff:fetch-trade --chapter ${chapter}`);
  }
  return JSON.parse(readFileSync(file, 'utf8')) as TradeSummary;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function changePct(latest: number, prior: number): number | null {
  if (!prior) return null;
  return round1(((latest - prior) / prior) * 100);
}

function sharePct(part: number, total: number): number {
  return total ? round1((part / total) * 100) : 0;
}

/** "$3.71B", "$412.6M", "$85.2K". */
export function formatUsdShort(usd: number): string {
  const abs = Math.abs(usd);
  const sign = usd < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${Math.round(abs)}`;
}

function formatSignedPct(pct: number | null): string {
  if (pct === null) return 'n/a';
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

/** "010229" -> "0102.29" */
export function dotHs6(hs6: string): string {
  return `${hs6.slice(0, 4)}.${hs6.slice(4)}`;
}

function headingLabel(summary: TradeSummary, info: TradeChapterInfo, heading: string): string {
  return info.headingLabels?.[heading] ?? summary.byHeading.find((h) => h.heading === heading)?.description ?? heading;
}

function pickByYearPartners(summary: TradeSummary, info: TradeChapterInfo): [string, string] {
  if (info.byYearPartners) return info.byYearPartners;
  const top = summary.byCountry.filter((c) => c.importsUsd > 0).slice(0, 2);
  if (top.length < 2) throw new Error(`Chapter ${summary.chapter}: fewer than two partners with ${summary.latestYear} imports`);
  return [top[0].country, top[1].country];
}

function isUsmcaPair(pair: [string, string]): boolean {
  return USMCA_PARTNERS.has(pair[0]) && USMCA_PARTNERS.has(pair[1]);
}

function buildByYear(summary: TradeSummary, partners: [string, string]): TariffImportsByYear[] {
  const [a, b] = partners.map((name) => {
    const c = summary.byCountry.find((x) => x.country === name);
    if (!c) throw new Error(`Chapter ${summary.chapter}: partner "${name}" not in the trade summary`);
    return c;
  });
  return summary.totalsByYear.map(({ year, totalUsd }) => {
    const partnerAUsd = a.byYear[String(year)] ?? 0;
    const partnerBUsd = b.byYear[String(year)] ?? 0;
    return { year, totalUsd, partnerAUsd, partnerBUsd, restUsd: totalUsd - partnerAUsd - partnerBUsd };
  });
}

function mainHeadingFor(summary: TradeSummary, countryCode: number): string | null {
  let best: TariffImportsByHeadingCountry | null = null;
  for (const row of summary.byHeadingCountry) {
    if (row.countryCode !== countryCode) continue;
    if (!best || row.importsUsd > best.importsUsd) best = row;
  }
  return best ? best.heading : null;
}

/**
 * Build the `understandIndustry` block from a trade summary. Every number is
 * computed from the summary; narrative fields are "TODO".
 */
export function buildUnderstandIndustry(summary: TradeSummary, info: TradeChapterInfo): TariffUnderstandIndustryContent {
  const { latestYear, priorYear } = summary;
  const total = summary.totalsByYear.find((t) => t.year === latestYear)?.totalUsd ?? 0;
  const priorTotal = summary.totalsByYear.find((t) => t.year === priorYear)?.totalUsd ?? 0;
  const padded = String(info.number).padStart(2, '0');

  // Imports over time, split into two partners and everyone else.
  const partners = pickByYearPartners(summary, info);
  const usmca = isUsmcaPair(partners);
  const byYear = buildByYear(summary, partners);
  const byYearCaption = usmca
    ? `U.S. imports of Chapter ${padded} goods each year, split into the two USMCA partners and everyone else.`
    : `U.S. imports of Chapter ${padded} goods each year, split into the two largest ${latestYear} suppliers (${partners[0]} and ${partners[1]}) and everyone else.`;

  // By country: top N + others.
  const topN = info.topCountries ?? 10;
  const ranked = summary.byCountry.filter((c) => c.importsUsd > 0);
  const byCountry: TariffImportsByCountry[] = ranked.slice(0, topN).map((c) => {
    const mainHeading = mainHeadingFor(summary, c.countryCode);
    return {
      countryCode: c.countryCode,
      country: c.country,
      importsUsd: c.importsUsd,
      priorImportsUsd: c.priorImportsUsd,
      changePct: changePct(c.importsUsd, c.priorImportsUsd),
      sharePct: sharePct(c.importsUsd, total),
      mainHeading,
      mainHeadingLabel: mainHeading ? headingLabel(summary, info, mainHeading) : null,
      dutyPaidUsd: null,
    };
  });
  const listedImports = byCountry.reduce((s, c) => s + c.importsUsd, 0);
  const listedPrior = byCountry.reduce((s, c) => s + c.priorImportsUsd, 0);

  // By line: every HS6 line with trade in either year.
  const byLine: TariffImportsByLine[] = summary.byHs6.map((l) => {
    const hs6 = dotHs6(l.hs6);
    const label = headingLabel(summary, info, l.heading);
    return {
      hs6,
      heading: l.heading,
      description: l.description,
      importsUsd: l.importsUsd,
      priorImportsUsd: l.priorImportsUsd,
      changePct: changePct(l.importsUsd, l.priorImportsUsd),
      sharePct: sharePct(l.importsUsd, total),
      dutyPaidUsd: null,
      searchText: `${l.hs6} ${hs6} ${l.description} ${label}`.toLowerCase(),
    };
  });

  const byHeadingCountry: TariffImportsByHeadingCountry[] = summary.byHeadingCountry.map((r) => ({ ...r }));

  // Stats cards.
  const partnerShare = sharePct(byYear[byYear.length - 1].partnerAUsd + byYear[byYear.length - 1].partnerBUsd, total);
  const topLine = byLine[0];
  const stats: TariffStat[] = [
    { label: `${latestYear} imports`, value: formatUsdShort(total) },
    { label: `Change vs ${priorYear}`, value: formatSignedPct(changePct(total, priorTotal)) },
    {
      label: usmca ? 'Canada + Mexico share' : `Top 2 share (${partners[0]} + ${partners[1]})`,
      value: `${Math.round(partnerShare)}%`,
    },
    { label: `Source countries (${latestYear})`, value: String(ranked.length) },
  ];
  if (topLine) {
    stats.push({ label: 'Largest product', value: `${Math.round(topLine.sharePct ?? 0)}%`, note: `${topLine.description} (${topLine.hs6})` });
  }

  const effectiveDuty = info.effectiveDuty ?? {
    year: latestYear,
    dutyPaidUsd: 0,
    note: `${TODO}: duty paid is not in UN Comtrade. Fill from an official duty-collected source before publishing.`,
  };

  return {
    h1: TODO,
    seo: { title: TODO, shortDescription: TODO, keywords: [] },
    latestYear,
    priorYear,
    valueBasis: summary.valueBasis,
    lastCheckedAt: summary.retrievedAt,
    stats,
    byYear,
    byYearPartners: [...partners],
    byYearCaption,
    byCountry,
    othersImportsUsd: total - listedImports,
    othersPriorImportsUsd: priorTotal - listedPrior,
    byLine,
    byHeadingCountry,
    effectiveDuty,
    why: TODO,
    sources: [
      {
        label: `UN Comtrade (public API), United States imports, HS chapter ${padded} (retrieved ${summary.retrievedAt})`,
        url: 'https://comtradeplus.un.org/',
      },
    ],
    coverageNote: COMTRADE_COVERAGE_NOTE,
  };
}
