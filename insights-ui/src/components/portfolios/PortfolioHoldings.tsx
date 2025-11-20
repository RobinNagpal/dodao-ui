'use client';

import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import { PortfolioTicker } from '@/types/portfolio';
import { UserTickerList } from '@prisma/client';
import { getScoreColorClasses } from '@/utils/score-utils';
import FavouriteTags from '@/components/favourites/FavouriteTags';
import CompetitorsAlternatives from '@/components/favourites/CompetitorsAlternatives';

interface PortfolioHoldingsProps {
  portfolioTickers: PortfolioTicker[];
  listsWithTickers: { list: UserTickerList; tickers: PortfolioTicker[] }[];
  unlistedTickers: PortfolioTicker[];
  openListIds: Set<string>;
  handleAccordionClick: (e: React.MouseEvent<HTMLElement>, listId: string) => void;
  setEditingTicker: (ticker: PortfolioTicker) => void;
  setDeletingTicker: (ticker: PortfolioTicker) => void;
  setShowAddTickerModal: (show: boolean) => void;
}

export default function PortfolioHoldings({
  portfolioTickers,
  listsWithTickers,
  unlistedTickers,
  openListIds,
  handleAccordionClick,
  setEditingTicker,
  setDeletingTicker,
  setShowAddTickerModal,
}: PortfolioHoldingsProps) {
  const renderTickerCard = (ticker: PortfolioTicker) => (
    <div key={ticker.id} className="bg-gray-900 rounded-lg p-3 border border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Link href={`/stocks/${ticker.ticker?.exchange}/${ticker.ticker?.symbol}`} className="hover:text-blue-400">
              <h4 className="text-base font-bold">
                {ticker.ticker?.name} ({ticker.ticker?.symbol})
              </h4>
            </Link>
            {ticker.ticker?.cachedScoreEntry && (
              <>
                {(() => {
                  const { textColorClass, bgColorClass } = getScoreColorClasses(ticker.ticker.cachedScoreEntry.finalScore);
                  return (
                    <span className={`${textColorClass} px-1.5 py-0.5 rounded-md ${bgColorClass} bg-opacity-15 font-semibold text-xs`}>
                      {ticker.ticker.cachedScoreEntry.finalScore}/25
                    </span>
                  );
                })()}
              </>
            )}
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Allocation:</span>
              <span className="text-white font-medium">{ticker.allocation}%</span>
            </div>
          </div>

          {ticker.detailedDescription && (
            <div className="mb-3">
              <p className="text-sm text-gray-300">{ticker.detailedDescription}</p>
            </div>
          )}

          {/* Competitors and Alternatives */}
          {ticker.competitorsConsidered && ticker.betterAlternatives && (
            <CompetitorsAlternatives competitorsConsidered={ticker.competitorsConsidered} betterAlternatives={ticker.betterAlternatives} />
          )}

          {/* Tags */}
          <FavouriteTags tags={ticker.tags || []} />
        </div>

        <div className="flex gap-1">
          <button onClick={() => setEditingTicker(ticker)} className="text-blue-400 hover:text-blue-300 p-1" title="Edit">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button onClick={() => setDeletingTicker(ticker)} className="text-red-400 hover:text-red-300 p-1" title="Delete">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Portfolio Holdings</h2>
      </div>

      {portfolioTickers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 text-gray-600 mx-auto mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No holdings yet</h3>
          <p className="text-gray-400 mb-4">Start building your portfolio by adding your first holding.</p>
          <Button onClick={() => setShowAddTickerModal(true)} variant="contained" primary className="inline-flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Add First Holding
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Holdings grouped by lists */}
          {listsWithTickers.map(({ list, tickers }) => {
            const isOpen = openListIds.has(list.id);
            const tickerSymbols = tickers.map((t) => t.ticker?.symbol).join(', ');
            const label = isOpen ? list.name : `${list.name} (${tickerSymbols})`;

            return (
              <Accordion key={list.id} isOpen={isOpen} label={label} onClick={(e) => handleAccordionClick(e, list.id)}>
                <div className="space-y-3">{tickers.map(renderTickerCard)}</div>
              </Accordion>
            );
          })}

          {/* Unlisted Holdings */}
          {unlistedTickers.length > 0 && (
            <Accordion
              isOpen={openListIds.has('unlisted')}
              label={openListIds.has('unlisted') ? 'Unlisted Holdings' : `Unlisted Holdings (${unlistedTickers.map((t) => t.ticker?.symbol).join(', ')})`}
              onClick={(e) => handleAccordionClick(e, 'unlisted')}
            >
              <div className="space-y-3">{unlistedTickers.map(renderTickerCard)}</div>
            </Accordion>
          )}
        </div>
      )}
    </div>
  );
}
