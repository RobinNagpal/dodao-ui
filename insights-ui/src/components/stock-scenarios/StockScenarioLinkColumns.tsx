'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { StockScenarioLinkDto } from '@/app/api/[spaceId]/stock-scenarios/[slug]/route';
import { ScenarioPricedInBucket } from '@/types/scenarioEnums';
import { parseMarkdown } from '@/util/parse-markdown';
import { AllExchanges, ALL_SUPPORTED_COUNTRIES, EXCHANGE_TO_COUNTRY, isExchange, SupportedCountries } from '@/utils/countryExchangeUtils';
import { getScoreColorClasses } from '@/utils/score-utils';

const PRICED_IN_LABEL: Record<ScenarioPricedInBucket, string> = {
  NOT_PRICED_IN: 'Not priced in',
  PARTIALLY_PRICED_IN: 'Partially priced in',
  MOSTLY_PRICED_IN: 'Mostly priced in',
  FULLY_PRICED_IN: 'Fully priced in',
  OVER_PRICED_IN: 'Over-priced',
};

const PRICED_IN_CLASS: Record<ScenarioPricedInBucket, string> = {
  NOT_PRICED_IN: 'bg-emerald-900/40 text-emerald-200 border-emerald-700/60',
  PARTIALLY_PRICED_IN: 'bg-sky-900/40 text-sky-200 border-sky-700/60',
  MOSTLY_PRICED_IN: 'bg-amber-900/40 text-amber-200 border-amber-700/60',
  FULLY_PRICED_IN: 'bg-gray-800 text-gray-300 border-gray-600',
  OVER_PRICED_IN: 'bg-rose-900/40 text-rose-200 border-rose-700/60',
};

function renderMarkdown(md: string) {
  return { __html: parseMarkdown(md) as string };
}

function LinkPill({ link }: { link: StockScenarioLinkDto }): JSX.Element {
  const inner = (
    <span className="inline-flex items-center gap-1 bg-[#111827] border border-[#374151] text-xs text-white rounded px-2 py-0.5">
      <span className="font-semibold">{link.symbol}</span>
      <span className="text-gray-400">· {link.exchange}</span>
    </span>
  );

  // tickerId === null means the (symbol, exchange) pair isn't in TickerV1 yet —
  // the public stock detail page would 404 on it. Render as plain text instead
  // so authors can still tag the ticker and admins can later add it to TickerV1.
  if (!link.tickerId) {
    return inner;
  }

  return (
    <Link href={`/stocks/${link.exchange}/${link.symbol}`} className="hover:opacity-80">
      {inner}
    </Link>
  );
}

function formatExpectedPriceChange(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

// Market cap arrives as a raw USD number from TickerV1FinancialInfo. Render
// `$X.XB` / `$X.XM` / `$X.XK` so the card stays compact regardless of size.
function formatMarketCapShort(value: number | null | undefined): string {
  if (value === null || value === undefined || !isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

// PE is shown as a hyphen for negative values too: a negative PE ratio means
// the company is unprofitable, and the number itself isn't meaningful — best
// to flag it as "not applicable" rather than print misleading data.
function formatPe(value: number | null | undefined): string {
  if (value === null || value === undefined || !isFinite(value) || value < 0) return '—';
  return value.toFixed(1);
}

function LinkCard({ link }: { link: StockScenarioLinkDto }): JSX.Element {
  const hasDetails = link.roleExplanation || link.expectedPriceChange !== null || link.expectedPriceChangeExplanation;
  const changeColor = link.expectedPriceChange === null ? '' : link.expectedPriceChange >= 0 ? 'text-emerald-300' : 'text-red-300';
  const pricedInLabel = PRICED_IN_LABEL[link.pricedInBucket];
  const pricedInClass = PRICED_IN_CLASS[link.pricedInBucket];
  const score = link.finalScore;
  const scoreClasses = score !== null ? getScoreColorClasses(score) : null;

  return (
    <div className="bg-[#111827] border border-[#374151] rounded-md p-2.5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <LinkPill link={link} />
        {link.expectedPriceChange !== null && (
          <span className={`text-xs font-semibold ${changeColor}`}>{formatExpectedPriceChange(link.expectedPriceChange)}</span>
        )}
      </div>
      <div className="mb-1">
        <span
          className={`inline-block text-[10px] uppercase tracking-wide border rounded px-1.5 py-0.5 ${pricedInClass}`}
          title="How much of this scenario is already reflected in this stock's price"
        >
          {pricedInLabel}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400 mb-1">
        <span title="Market cap">
          <span className="text-gray-500">Mkt cap </span>
          <span className="font-mono tabular-nums text-gray-200">{formatMarketCapShort(link.marketCap)}</span>
        </span>
        <span title="Price-to-earnings ratio (— for negative or unavailable)">
          <span className="text-gray-500">PE </span>
          <span className="font-mono tabular-nums text-gray-200">{formatPe(link.pe)}</span>
        </span>
        {score !== null && scoreClasses ? (
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${scoreClasses.bgColorClass} bg-opacity-15 ${scoreClasses.textColorClass}`}
            title={`KoalaGains score (${scoreClasses.scoreLabel})`}
          >
            <span className="text-[10px] uppercase tracking-wide">Score</span>
            <span className="font-mono tabular-nums font-semibold">{score}/25</span>
          </span>
        ) : (
          <span title="KoalaGains score not available yet">
            <span className="text-gray-500">Score </span>
            <span className="font-mono tabular-nums text-gray-200">—</span>
          </span>
        )}
      </div>
      {hasDetails && (
        <div className="space-y-1 mt-1">
          {link.roleExplanation && (
            <div
              className="markdown-body prose prose-invert prose-xs max-w-none text-xs text-gray-300"
              dangerouslySetInnerHTML={renderMarkdown(link.roleExplanation)}
            />
          )}
          {link.expectedPriceChangeExplanation && (
            <div
              className="markdown-body prose prose-invert prose-xs max-w-none text-xs text-gray-400"
              dangerouslySetInnerHTML={renderMarkdown(link.expectedPriceChangeExplanation)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function LinkList({
  title,
  links,
  filteredCount,
  countryFilter,
  emptyLabel,
}: {
  title: string;
  links: StockScenarioLinkDto[];
  filteredCount: number;
  countryFilter: SupportedCountries | 'ALL';
  emptyLabel: string;
}): JSX.Element {
  // Every stock link carries a priced-in bucket, so always use the card
  // layout here — the pill variant would hide the bucket badge.
  const anyDetailed = links.length > 0;
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300 mb-2">
        {title}{' '}
        <span className="text-xs font-normal text-gray-500">
          ({filteredCount}
          {countryFilter !== 'ALL' ? ` in ${countryFilter}` : ''})
        </span>
      </h3>
      {links.length === 0 ? (
        <p className="text-xs text-gray-500">{emptyLabel}</p>
      ) : anyDetailed ? (
        <div className="flex flex-col gap-2">
          {links.map((l) => (
            <LinkCard key={`${l.symbol}-${l.exchange}-${l.role}`} link={l} />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {links.map((l) => (
            <LinkPill key={`${l.symbol}-${l.exchange}-${l.role}`} link={l} />
          ))}
        </div>
      )}
    </div>
  );
}

function countryOfExchange(exchange: string): SupportedCountries | null {
  if (!isExchange(exchange)) return null;
  return EXCHANGE_TO_COUNTRY[exchange as AllExchanges];
}

interface StockScenarioLinkColumnsProps {
  winners: StockScenarioLinkDto[];
  losers: StockScenarioLinkDto[];
  mostExposed: StockScenarioLinkDto[];
  scenarioCountries: SupportedCountries[];
}

export default function StockScenarioLinkColumns({ winners, losers, mostExposed, scenarioCountries }: StockScenarioLinkColumnsProps): JSX.Element {
  const [countryFilter, setCountryFilter] = useState<SupportedCountries | 'ALL'>('ALL');

  // Disable country options that the scenario doesn't cover; the user still
  // sees the full list so they understand the scope, but can't pick a country
  // that would hide every link.
  const scenarioCountrySet = useMemo(() => new Set(scenarioCountries), [scenarioCountries]);

  const filterByCountry = (links: StockScenarioLinkDto[]): StockScenarioLinkDto[] => {
    if (countryFilter === 'ALL') return links;
    return links.filter((l) => countryOfExchange(l.exchange) === countryFilter);
  };

  const filteredWinners = filterByCountry(winners);
  const filteredLosers = filterByCountry(losers);
  const filteredMostExposed = filterByCountry(mostExposed);

  return (
    <section className="bg-[#1F2937] border border-[#374151] rounded-lg p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-white">Tagged stocks</h2>
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <span className="uppercase tracking-wide text-[11px] text-gray-400">Filter by country</span>
          <select
            className="bg-[#111827] border border-[#374151] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value as SupportedCountries | 'ALL')}
          >
            <option value="ALL">All countries</option>
            {ALL_SUPPORTED_COUNTRIES.map((c) => (
              <option key={c} value={c} disabled={!scenarioCountrySet.has(c)}>
                {c}
                {!scenarioCountrySet.has(c) ? ' — not in this scenario' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LinkList
          title="Winners"
          links={filteredWinners}
          filteredCount={filteredWinners.length}
          countryFilter={countryFilter}
          emptyLabel={countryFilter === 'ALL' ? 'No stocks tagged as winners.' : `No winners listed on ${countryFilter} exchanges.`}
        />
        <LinkList
          title="Losers"
          links={filteredLosers}
          filteredCount={filteredLosers.length}
          countryFilter={countryFilter}
          emptyLabel={countryFilter === 'ALL' ? 'No stocks tagged as losers.' : `No losers listed on ${countryFilter} exchanges.`}
        />
        <LinkList
          title="Most exposed right now"
          links={filteredMostExposed}
          filteredCount={filteredMostExposed.length}
          countryFilter={countryFilter}
          emptyLabel={countryFilter === 'ALL' ? 'No stocks tagged as currently most exposed.' : `No most-exposed stocks on ${countryFilter} exchanges.`}
        />
      </div>
    </section>
  );
}
