'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EtfScenarioLinkDto } from '@/app/api/[spaceId]/etf-scenarios/[slug]/route';
import { parseMarkdown } from '@/util/parse-markdown';
import { AllEtfExchanges, ETF_EXCHANGE_TO_COUNTRY, ETF_SUPPORTED_COUNTRIES, EtfSupportedCountry, isEtfExchange } from '@/utils/etfCountryExchangeUtils';

function renderMarkdown(md: string) {
  return { __html: parseMarkdown(md) as string };
}

function PillVisual({ link }: { link: EtfScenarioLinkDto }): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 bg-[#111827] border border-[#374151] text-xs text-white rounded px-2 py-0.5">
      <span className="font-semibold">{link.symbol}</span>
      {link.exchange && <span className="text-gray-400">· {link.exchange}</span>}
    </span>
  );
}

function formatExpectedPriceChange(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

function LinkCard({ link }: { link: EtfScenarioLinkDto }): JSX.Element {
  const hasDetails = link.roleExplanation || link.expectedPriceChange !== null || link.expectedPriceChangeExplanation;
  const changeColor = link.expectedPriceChange === null ? '' : link.expectedPriceChange >= 0 ? 'text-emerald-300' : 'text-red-300';

  const body = (
    <>
      <div className="flex items-center justify-between gap-2 mb-1">
        <PillVisual link={link} />
        {link.expectedPriceChange !== null && (
          <span className={`text-xs font-semibold ${changeColor}`}>{formatExpectedPriceChange(link.expectedPriceChange)}</span>
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
    </>
  );

  // The ETF detail page only routes to /etfs/{exchange}/{symbol} when both are
  // known. If exchange is null we keep the same visual but drop the click
  // affordance — admins can still tag the symbol for editorial context.
  if (link.exchange) {
    return (
      <Link
        href={`/etfs/${link.exchange}/${link.symbol}`}
        className="block bg-[#111827] border border-[#374151] rounded-md p-2.5 hover:border-blue-500 hover:bg-[#0f1623] transition-colors"
      >
        {body}
      </Link>
    );
  }

  return <div className="bg-[#111827] border border-[#374151] rounded-md p-2.5">{body}</div>;
}

function LinkList({
  title,
  links,
  filteredCount,
  countryFilter,
  emptyLabel,
}: {
  title: string;
  links: EtfScenarioLinkDto[];
  filteredCount: number;
  countryFilter: EtfSupportedCountry | 'ALL';
  emptyLabel: string;
}): JSX.Element {
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
      ) : (
        <div className="flex flex-col gap-2">
          {links.map((l) => (
            <LinkCard key={`${l.symbol}-${l.exchange ?? 'noex'}-${l.role}`} link={l} />
          ))}
        </div>
      )}
    </div>
  );
}

function countryOfExchange(exchange: string | null): EtfSupportedCountry | null {
  if (!exchange || !isEtfExchange(exchange)) return null;
  return ETF_EXCHANGE_TO_COUNTRY[exchange as AllEtfExchanges];
}

interface EtfScenarioLinkColumnsProps {
  winners: EtfScenarioLinkDto[];
  losers: EtfScenarioLinkDto[];
  mostExposed: EtfScenarioLinkDto[];
  scenarioCountries: EtfSupportedCountry[];
}

export default function EtfScenarioLinkColumns({ winners, losers, mostExposed, scenarioCountries }: EtfScenarioLinkColumnsProps): JSX.Element {
  const [countryFilter, setCountryFilter] = useState<EtfSupportedCountry | 'ALL'>('ALL');

  const scenarioCountrySet = useMemo(() => new Set(scenarioCountries), [scenarioCountries]);

  const filterByCountry = (links: EtfScenarioLinkDto[]): EtfScenarioLinkDto[] => {
    if (countryFilter === 'ALL') return links;
    return links.filter((l) => countryOfExchange(l.exchange) === countryFilter);
  };

  const filteredWinners = filterByCountry(winners);
  const filteredLosers = filterByCountry(losers);
  const filteredMostExposed = filterByCountry(mostExposed);

  return (
    <section className="bg-[#1F2937] border border-[#374151] rounded-lg p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-white">Tagged ETFs</h2>
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <span className="uppercase tracking-wide text-[11px] text-gray-400">Filter by country</span>
          <select
            className="bg-[#111827] border border-[#374151] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value as EtfSupportedCountry | 'ALL')}
          >
            <option value="ALL">All countries</option>
            {ETF_SUPPORTED_COUNTRIES.map((c) => (
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
          emptyLabel={countryFilter === 'ALL' ? 'No ETFs tagged as winners.' : `No winners listed on ${countryFilter} exchanges.`}
        />
        <LinkList
          title="Losers"
          links={filteredLosers}
          filteredCount={filteredLosers.length}
          countryFilter={countryFilter}
          emptyLabel={countryFilter === 'ALL' ? 'No ETFs tagged as losers.' : `No losers listed on ${countryFilter} exchanges.`}
        />
        <LinkList
          title="Most exposed right now"
          links={filteredMostExposed}
          filteredCount={filteredMostExposed.length}
          countryFilter={countryFilter}
          emptyLabel={countryFilter === 'ALL' ? 'No ETFs tagged as currently most exposed.' : `No most-exposed ETFs on ${countryFilter} exchanges.`}
        />
      </div>
    </section>
  );
}
