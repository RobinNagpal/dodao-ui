import { parseMarkdown } from '@/util/parse-markdown';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { ReactNode } from 'react';

/**
 * Minimal shape shared by ticker (`CompetitorTicker`) and ETF (`EtfCompetitor`)
 * competitor records — the fields the card needs to render itself.
 */
export interface CompetitorCardData {
  companyName: string;
  companySymbol?: string;
  exchangeSymbol?: string;
  exchangeName?: string;
  detailedComparison?: string;
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
 * any right-side action slot, and the markdown `detailedComparison` body.
 */
export default function CompetitorCard({ competitor, href, actionSlot }: CompetitorCardProps): JSX.Element {
  const nameNode = href ? (
    <Link href={href} title="View detailed report" className="flex gap-x-2 items-center text-[#F59E0B] hover:text-[#F97316] transition-colors">
      <h3 className="font-semibold">{competitor.companyName}</h3>
      <ArrowTopRightOnSquareIcon className="size-4 text-primary-text" />
    </Link>
  ) : (
    <h3 className="font-semibold">{competitor.companyName}</h3>
  );

  return (
    <li className="bg-gray-800 p-4 rounded-md">
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          {nameNode}
          <div className="flex">
            <div className="flex items-center gap-x-2">
              {competitor.companySymbol && (
                <span className="text-sm text-gray-400">
                  {competitor.companySymbol}
                  {competitor.exchangeName ? ` • ${competitor.exchangeName.toUpperCase()}` : ''}
                </span>
              )}
            </div>
            {actionSlot}
          </div>
        </div>
        {competitor.detailedComparison && (
          <div
            id={slugify(competitor.companyName)}
            className="markdown markdown-body"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(competitor.detailedComparison) }}
          />
        )}
      </div>
    </li>
  );
}
