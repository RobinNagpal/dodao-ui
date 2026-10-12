import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { TariffTradeSnapshot, TariffUnderstandIndustryContent } from '@/types/tariff-chapter-prototype';
import { COUNTRY_OPTIONS } from '@/utils/tariff-calculator/countries';

// Trade figures for the generator. Two inputs are accepted:
//  1. --trade-file with { year?, countries: [{ iso2, name, importsUsd, byHeading: { "0102": n } }] }
//  2. the UN Comtrade summary written by the trade-statistics module (trade-stats.ts / fetch-trade.ts,
//     src/tariff-data/trade/chapter-NN.json), passed with --trade-file or found automatically.
// The trade-statistics module is owned by another workflow, so it is loaded at run time when present
// rather than imported statically.

export interface TradeCountry {
  iso: string;
  name: string;
  importsUsd: number;
  byHeading: Record<string, number>;
}

export interface TradeInput {
  year: number | null;
  totalUsd: number | null;
  countries: TradeCountry[];
  /** Comtrade summary, when the input was one (feeds understandIndustry / tradeSnapshot). */
  summary: ComtradeSummaryLike | null;
}

/** The parts of trade-stats.ts' TradeSummary this module reads. */
export interface ComtradeSummaryLike {
  chapter: number;
  latestYear: number;
  priorYear: number;
  retrievedAt: string;
  sourceLabel?: string;
  totalsByYear: { year: number; totalUsd: number }[];
  byCountry: { countryCode: number; country: string; importsUsd: number }[];
  byHs6: { hs6: string; heading: string; description: string; importsUsd: number }[];
  byHeadingCountry: { heading: string; countryCode: number; country: string; importsUsd: number }[];
}

interface TradeStatsModule {
  tradeSummaryPath: (chapter: number) => string;
  buildUnderstandIndustry: (
    summary: ComtradeSummaryLike,
    info: { number: number; title: string; headingLabels?: Record<string, string> }
  ) => TariffUnderstandIndustryContent;
}

const TRADE_STATS_MODULE = path.join(__dirname, 'trade-stats.ts');

/** The trade-statistics module, when it exists in this checkout. */
export async function loadTradeStatsModule(): Promise<TradeStatsModule | null> {
  if (!existsSync(TRADE_STATS_MODULE)) return null;
  try {
    const mod = (await import(TRADE_STATS_MODULE)) as Partial<TradeStatsModule>;
    return typeof mod.buildUnderstandIndustry === 'function' && typeof mod.tradeSummaryPath === 'function' ? (mod as TradeStatsModule) : null;
  } catch (err) {
    console.warn(`trade-stats.ts could not be loaded: ${(err as Error).message}`);
    return null;
  }
}

function squash(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/isds/g, 'islands');
}

/** UN Comtrade partner names that differ from the ISO short names. */
const COMTRADE_ALIASES: Record<string, string> = {
  vietnam: 'VN',
  viet: 'VN',
  repofkorea: 'KR',
  korearep: 'KR',
  otherasianes: 'TW',
  chinahongkongsar: 'HK',
  chinamacaosar: 'MO',
  turkiye: 'TR',
  russianfederation: 'RU',
  bolivia: 'BO',
  bolivaplurinationalstateof: 'BO',
  boliviaplurinationalstateof: 'BO',
  venezuela: 'VE',
  iran: 'IR',
  dempeoplesrepofkorea: 'KP',
  repofmoldova: 'MD',
  unitedrepoftanzania: 'TZ',
  dominicanrep: 'DO',
  czechia: 'CZ',
  laopeoplesdemrep: 'LA',
  syria: 'SY',
  bosniaherzegovina: 'BA',
  cotedivoire: 'CI',
  demrepofthecongo: 'CD',
  congo: 'CG',
  centralafricanrep: 'CF',
  stateofpalestine: 'PS',
  northmacedonia: 'MK',
  bruneidarussalam: 'BN',
  caboverde: 'CV',
  eswatini: 'SZ',
  fsmicronesia: 'FM',
  unitedkingdom: 'GB',
  usa: 'US',
  switzerland: 'CH',
  netherlands: 'NL',
  saintkittsandnevis: 'KN',
  saintvincentandthegrenadines: 'VC',
  falklandsislandsmalvinas: 'FK',
  falklandislandsmalvinas: 'FK',
  sintmaarten: 'SX',
  holysee: 'VA',
};

export function isoForCountryName(name: string): string | null {
  const s = squash(name);
  if (COMTRADE_ALIASES[s]) return COMTRADE_ALIASES[s];
  const hit = COUNTRY_OPTIONS.find((c) => squash(c.name) === s);
  return hit ? hit.code : null;
}

export function displayName(iso: string, fallback: string): string {
  return COUNTRY_OPTIONS.find((c) => c.code === iso)?.name ?? fallback;
}

function fromSummary(summary: ComtradeSummaryLike): TradeInput {
  const total = summary.totalsByYear.find((t) => t.year === summary.latestYear)?.totalUsd ?? null;
  const countries: TradeCountry[] = [];
  const unresolved: string[] = [];
  for (const c of summary.byCountry) {
    if (c.importsUsd <= 0) continue;
    const iso = isoForCountryName(c.country);
    if (!iso || iso === 'US') {
      unresolved.push(c.country);
      continue;
    }
    const byHeading: Record<string, number> = {};
    for (const h of summary.byHeadingCountry) if (h.countryCode === c.countryCode) byHeading[h.heading] = (byHeading[h.heading] ?? 0) + h.importsUsd;
    countries.push({ iso, name: displayName(iso, c.country), importsUsd: c.importsUsd, byHeading });
  }
  if (unresolved.length > 0) console.warn(`Trade partners with no ISO code (left in "Any other country"): ${unresolved.slice(0, 10).join(', ')}`);
  return { year: summary.latestYear, totalUsd: total, countries, summary };
}

export function readTradeFile(file: string): TradeInput {
  const raw = JSON.parse(readFileSync(path.resolve(file), 'utf8')) as Record<string, unknown>;
  if (Array.isArray(raw.byHeadingCountry) && Array.isArray(raw.byCountry)) return fromSummary(raw as unknown as ComtradeSummaryLike);
  const list = Array.isArray(raw.countries) ? (raw.countries as Record<string, unknown>[]) : null;
  if (!list) throw new Error(`${file}: expected { countries: [{ iso2, name, importsUsd, byHeading }] } or a Comtrade trade summary`);
  const countries: TradeCountry[] = list.map((c) => {
    const iso = String(c.iso2 ?? '').toUpperCase() || isoForCountryName(String(c.name ?? '')) || '';
    if (!iso) throw new Error(`${file}: country without iso2: ${JSON.stringify(c).slice(0, 80)}`);
    return {
      iso,
      name: displayName(iso, String(c.name ?? iso)),
      importsUsd: Number(c.importsUsd ?? 0),
      byHeading: (c.byHeading ?? {}) as Record<string, number>,
    };
  });
  return {
    year: typeof raw.year === 'number' ? raw.year : null,
    totalUsd: typeof raw.totalImportsUsd === 'number' ? raw.totalImportsUsd : null,
    countries: countries.sort((a, b) => b.importsUsd - a.importsUsd),
    summary: null,
  };
}

/** Trade input for a chapter: --trade-file, else the trade module's summary file when it exists. */
export async function loadTradeInput(chapter: number, file: string | undefined, mod: TradeStatsModule | null): Promise<TradeInput | null> {
  if (file) return readTradeFile(file);
  if (!mod) return null;
  const summaryPath = mod.tradeSummaryPath(chapter);
  if (!existsSync(summaryPath)) return null;
  console.log(`Using trade summary ${path.relative(process.cwd(), summaryPath)}`);
  return fromSummary(JSON.parse(readFileSync(summaryPath, 'utf8')) as ComtradeSummaryLike);
}

/** overview.tradeSnapshot from a Comtrade summary. */
export function tradeSnapshot(summary: ComtradeSummaryLike, chapterPadded: string): TariffTradeSnapshot {
  const total = summary.totalsByYear.find((t) => t.year === summary.latestYear)?.totalUsd ?? 0;
  return {
    year: summary.latestYear,
    totalImportsUsd: total,
    totalDutyCollectedUsd: 0,
    effectiveDutyRateNote: 'TODO: duty collected (USITC DataWeb calculated duties) — or say it is not available',
    topCountries: summary.byCountry.slice(0, 2).map((c) => ({ name: c.country, importsUsd: c.importsUsd })),
    biggestLines: summary.byHs6.slice(0, 2).map((h) => ({ hts: `${h.hs6.slice(0, 4)}.${h.hs6.slice(4)}`, label: h.description })),
    source: `UN Comtrade, United States imports, HS chapter ${chapterPadded} (${summary.latestYear})`,
    coverageNote: '',
  };
}
