'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { PortfolioTicker } from '@/types/portfolio';
import { UserTickerList } from '@prisma/client';
import { getScoreColorClasses } from '@/utils/score-utils';
import FavouriteTags from '@/components/favourites/FavouriteTags';
import CompetitorsAlternatives from '@/components/favourites/CompetitorsAlternatives';
import { parseMarkdown } from '@/util/parse-markdown';

interface PortfolioHoldingsProps {
  portfolioTickers: PortfolioTicker[];
  listsWithTickers: { list: UserTickerList; tickers: PortfolioTicker[] }[];
  unlistedTickers: PortfolioTicker[];
  openListIds: Set<string>;
  handleAccordionClick: (e: React.MouseEvent<HTMLElement>, listId: string) => void;
  renderTickerActions?: (ticker: PortfolioTicker) => ReactNode;
}

export default function PortfolioHoldings({ portfolioTickers, listsWithTickers, unlistedTickers, renderTickerActions }: PortfolioHoldingsProps) {
  const renderTickerCard = (ticker: PortfolioTicker, showListName?: string) => (
    <div key={ticker.id} className="bg-gray-800 rounded-xl p-5 border border-gray-800">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Header with Name, Symbol, and Score */}
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <Link href={`/stocks/${ticker.ticker?.exchange}/${ticker.ticker?.symbol}`} className="hover:text-blue-400 transition-colors">
              <h4 className="text-lg font-bold text-white hover:text-blue-400">
                {ticker.ticker?.name} <span>({ticker.ticker?.symbol})</span>
              </h4>
            </Link>
            {ticker.ticker?.cachedScoreEntry && (
              <>
                {(() => {
                  const { textColorClass, bgColorClass } = getScoreColorClasses(ticker.ticker.cachedScoreEntry.finalScore);
                  return (
                    <span className={`${textColorClass} px-2 py-1 rounded-lg ${bgColorClass} bg-opacity-15 text-sm`}>
                      {ticker.ticker.cachedScoreEntry.finalScore}/25
                    </span>
                  );
                })()}
              </>
            )}
          </div>

          {/* Allocation and List Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
              <span className="text-sm text-gray-400">Allocation:</span>
              <span className="text-white font-bold text-base">{ticker.allocation}%</span>
            </div>
          </div>

          {/* Detailed Description */}
          {ticker.detailedDescription && (
            <div className="mb-4">
              <div
                className="text-sm text-gray-300 leading-relaxed markdown markdown-body"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(ticker.detailedDescription) }}
              />
            </div>
          )}

          {/* Competitors and Alternatives */}
          {ticker.competitorsConsidered && ticker.betterAlternatives && (
            <div className="mb-3">
              <CompetitorsAlternatives competitorsConsidered={ticker.competitorsConsidered} betterAlternatives={ticker.betterAlternatives} />
            </div>
          )}

          {/* Tags */}
          {ticker.tags && ticker.tags.length > 0 && <FavouriteTags tags={ticker.tags} />}
        </div>

        {/* Render ticker actions if provided */}
        {renderTickerActions && <div className="ml-4">{renderTickerActions(ticker)}</div>}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Portfolio Holdings</h2>
      </div>

      {portfolioTickers.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 text-gray-600 mx-auto mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">No holdings yet</h3>
          <p className="text-gray-400 text-base">Start building your portfolio by adding your first holding.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Holdings grouped by lists */}
          {listsWithTickers.map(({ list, tickers }) => (
            <div key={list.id}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded"></span>
                {list.name}
              </h3>
              <div className="space-y-4">{tickers.map((ticker) => renderTickerCard(ticker, list.name))}</div>
            </div>
          ))}

          {/* Unlisted Holdings */}
          {unlistedTickers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gray-500 rounded"></span>
                Other Holdings
              </h3>
              <div className="space-y-4">{unlistedTickers.map((ticker) => renderTickerCard(ticker))}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
