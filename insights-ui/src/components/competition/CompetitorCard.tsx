import { parseMarkdown } from '@/util/parse-markdown';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { ReactNode } from 'react';

/**
 * Minimal shape shared by ticker (`CompetitorTicker`) and ETF (`EtfCompetitor`)
 * competitor records — the fields the card needs to render itself.
 *
 * Ticker competition uses the new field names (competitorName, tickerSymbol,
 * financialDataSummary). ETF competition still uses the legacy names
 * (companyName, companySymbol, detailedComparison). Both are accepted here
 * so the card can be reused by both pages without duplication.
 */
export interface CompetitorCardData {
  /** New ticker competition field — preferred display name. */
  competitorName?: string;
  /** Legacy ETF competition field — used as fallback when competitorName is absent. */
  companyName?: string;
  /** New ticker competition field — ticker symbol. */
  tickerSymbol?: string;
  /** Legacy ETF competition field — fallback when tickerSymbol is absent. */
  companySymbol?: string;
  exchangeSymbol?: string;
  /** New ticker competition field — one-paragraph financial summary. */
  financialDataSummary?: string;
  /** Legacy ETF competition field — fallback when financialDataSummary is absent. */
  detailedComparison?: string;
  shortDescription?: string;
  currency?: string;
  marketCap?: string;
}

export interface CompetitorCardProps {
  competitor: CompetitorCardData;
  /** Optional detail-page link for the competitor (null/undefined renders as plain text). */
  href?: string | null;
  /** Optional right-aligned action slot (e.g. admin "Add ticker" button on the ticker page). */
  actionSlot?: ReactNode;
}

/**
 * Presentation card for a single peer used by both the ticker and ETF competition
 * sections. Renders the competitor's name (optionally linked), symbol + exchange pill,
 * any right-side action slot, and the markdown body (financialDataSummary or
 * detailedComparison).
 */
export default function CompetitorCard({ competitor, href, actionSlot }: CompetitorCardProps): JSX.Element {
  const displayName = competitor.competitorName ?? competitor.companyName ?? '';
  const displaySymbol = competitor.tickerSymbol ?? competitor.companySymbol;
  const displayBody = competitor.financialDataSummary ?? competitor.detailedComparison;

  const nameNode = href ? (
    <Link href={href} title="View detailed report" className="flex gap-x-2 items-center text-[#F59E0B] hover:text-[#F97316] transition-colors">
      <h3 className="font-semibold">{displayName}</h3>
      <ArrowTopRightOnSquareIcon className="size-4 text-primary-text" />
    </Link>
  ) : (
    <h3 className="font-semibold">{displayName}</h3>
  );

  return (
    <li className="bg-gray-800 p-4 rounded-md">
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          {nameNode}
          <div className="flex">
            <div className="flex items-center gap-x-2">
              {displaySymbol && displaySymbol !== 'PRIVATE' && (
                <span className="text-sm text-gray-400">
                  {displaySymbol}
                  {competitor.exchangeSymbol && competitor.exchangeSymbol !== 'PRIVATE' ? ` • ${competitor.exchangeSymbol.toUpperCase()}` : ''}
                </span>
              )}
              {competitor.marketCap && competitor.marketCap !== 'PRIVATE' && <span className="text-sm text-gray-500">Market Cap: {competitor.marketCap}</span>}
            </div>
            {actionSlot}
          </div>
        </div>
        {competitor.shortDescription && <p className="text-sm text-gray-400 italic">{competitor.shortDescription}</p>}
        {displayBody && <div id={slugify(displayName)} className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(displayBody) }} />}
      </div>
    </li>
  );
}
