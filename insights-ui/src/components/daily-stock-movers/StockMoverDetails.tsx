import { TopGainerWithTicker, TopLoserWithTicker } from '@/types/daily-stock-movers';
import { getCountryByExchange, toExchange } from '@/utils/countryExchangeUtils';
import { DailyMoverType } from '@/utils/daily-movers-generation-utils';
import { parseMarkdown } from '@/util/parse-markdown';
import Link from 'next/link';

interface StockMoverDetailsProps {
  mover: TopGainerWithTicker | TopLoserWithTicker;
  type: DailyMoverType;
}

export default function StockMoverDetails({ mover, type }: StockMoverDetailsProps) {
  const country = getCountryByExchange(toExchange(mover.ticker.exchange));
  const backLink = type === DailyMoverType.GAINER ? `/daily-top-movers/top-gainers/country/${country}` : `/daily-top-movers/top-losers/country/${country}`;
  const backText = type === DailyMoverType.GAINER ? 'Back to Top Gainers' : 'Back to Top Losers';
  const changeColorClass = type === DailyMoverType.GAINER ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  const articleDate = new Date(mover.createdAt);
  const formattedDate = articleDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Main Article Content */}
      <article className="bg-gray-900 rounded-lg shadow-sm border border-color p-6 md:p-8" itemScope itemType="https://schema.org/NewsArticle">
        {/* Article Header */}
        <header className="mb-6 pb-4 border-b border-color">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-color mb-2" itemProp="headline">
                {mover.ticker.name} <span className="text-muted-foreground">({mover.ticker.symbol})</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                  {mover.ticker.exchange}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className={`font-bold text-base ${changeColorClass}`}>
                  {type === DailyMoverType.GAINER ? '+' : ''}
                  {mover.percentageChange.toFixed(2)}%
                </span>
                <span className="text-muted-foreground">•</span>
                <time dateTime={articleDate.toISOString()} className="text-muted-foreground text-sm" itemProp="datePublished">
                  {formattedDate}
                </time>
              </div>
            </div>

            <Link
              href={`/stocks/${toExchange(mover.ticker.exchange)}/${mover.ticker.symbol}`}
              className="link-color hover:underline text-sm font-medium whitespace-nowrap flex items-center gap-1"
            >
              View Full Report →
            </Link>
          </div>
        </header>

        {/* Article Body */}
        <div className="prose prose-invert max-w-none">
          {mover.title && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-color mb-3">Analysis Title</h2>
              <p className="text-color" itemProp="description">
                {mover.title}
              </p>
            </section>
          )}

          {mover.oneLineExplanation && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-color mb-3">Executive Summary</h2>
              <p className="text-color leading-relaxed" itemProp="abstract">
                {mover.oneLineExplanation}
              </p>
            </section>
          )}

          {mover.detailedExplanation && (
            <section className="mb-6" itemProp="articleBody">
              <h2 className="text-xl font-semibold text-color mb-3">Comprehensive Analysis</h2>
              <div
                className="markdown markdown-body prose-headings:text-color prose-p:text-color prose-strong:text-color prose-code:text-color prose-a:text-primary hover:prose-a:text-primary/80"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(mover.detailedExplanation) }}
              />
            </section>
          )}
        </div>

        {/* Article Footer */}
        <footer className="mt-8 pt-6 border-t border-color">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <span>Published by </span>
              <span itemProp="author" itemScope itemType="https://schema.org/Organization">
                <span itemProp="name">KoalaGains</span>
              </span>
              <span> on </span>
              <time dateTime={articleDate.toISOString()} itemProp="datePublished">
                {formattedDate}
              </time>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                Stock Analysis
              </span>
              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                {type === DailyMoverType.GAINER ? 'Top Gainer' : 'Top Loser'}
              </span>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
