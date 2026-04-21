import Link from 'next/link';
import { EtfScenarioDetail, EtfScenarioLinkDto } from '@/app/api/[spaceId]/etf-scenarios/[slug]/route';
import { parseMarkdown } from '@/util/parse-markdown';
import { EtfScenarioDirectionBadge, EtfScenarioProbabilityBadge, EtfScenarioTimeframeBadge } from './EtfScenarioOutlookBadge';
import { directionLabel, pricedInBucketLabel, probabilityBucketLabel, timeframeLabel } from '@/utils/etf-scenario-metadata-generators';

function renderMarkdown(md: string) {
  return { __html: parseMarkdown(md) as string };
}

function LinkPill({ link }: { link: EtfScenarioLinkDto }): JSX.Element {
  const inner = (
    <span className="inline-flex items-center gap-1 bg-[#111827] border border-[#374151] text-xs text-white rounded px-2 py-0.5">
      <span className="font-semibold">{link.symbol}</span>
      {link.exchange && <span className="text-gray-400">· {link.exchange}</span>}
    </span>
  );

  if (link.exchange && link.etfId) {
    return (
      <Link href={`/etfs/${link.exchange}/${link.symbol}`} className="hover:opacity-80">
        {inner}
      </Link>
    );
  }

  return inner;
}

function formatExpectedPriceChange(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

function LinkCard({ link }: { link: EtfScenarioLinkDto }): JSX.Element {
  const hasDetails = link.roleExplanation || link.expectedPriceChange !== null || link.expectedPriceChangeExplanation;
  const changeColor = link.expectedPriceChange === null ? '' : link.expectedPriceChange >= 0 ? 'text-emerald-300' : 'text-red-300';

  return (
    <div className="bg-[#111827] border border-[#374151] rounded-md p-2.5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <LinkPill link={link} />
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
    </div>
  );
}

function LinkList({ title, links, emptyLabel }: { title: string; links: EtfScenarioLinkDto[]; emptyLabel?: string }): JSX.Element {
  const anyDetailed = links.some((l) => l.roleExplanation || l.expectedPriceChange !== null || l.expectedPriceChangeExplanation);
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300 mb-2">{title}</h3>
      {links.length === 0 ? (
        <p className="text-xs text-gray-500">{emptyLabel ?? '—'}</p>
      ) : anyDetailed ? (
        <div className="flex flex-col gap-2">
          {links.map((l) => (
            <LinkCard key={`${l.symbol}-${l.role}`} link={l} />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {links.map((l) => (
            <LinkPill key={`${l.symbol}-${l.role}`} link={l} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EtfScenarioDetailView({ scenario }: { scenario: EtfScenarioDetail }): JSX.Element {
  const asOf = scenario.outlookAsOfDate.slice(0, 10);
  const hasPricingContext =
    scenario.pricedInBucket || scenario.expectedPriceChange !== null || scenario.expectedPriceChangeExplanation || scenario.priceChangeTimeframeExplanation;

  return (
    <article className="text-[#E5E7EB]">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-black text-sm font-bold px-2.5 py-0.5 rounded">
          Scenario #{scenario.scenarioNumber}
        </span>
        <EtfScenarioDirectionBadge direction={scenario.direction} />
        <EtfScenarioProbabilityBadge bucket={scenario.probabilityBucket} percentage={scenario.probabilityPercentage} asOfDate={scenario.outlookAsOfDate} />
        <EtfScenarioTimeframeBadge timeframe={scenario.timeframe} />
      </div>
      <p className="text-xs text-gray-400 mb-4">
        {directionLabel(scenario.direction)} · {probabilityBucketLabel(scenario.probabilityBucket)} · {timeframeLabel(scenario.timeframe)} · outlook reviewed{' '}
        {asOf}
      </p>

      <h1 className="text-3xl font-bold text-white mb-4">{scenario.title}</h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">Underlying cause</h2>
        <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.underlyingCause)} />
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">Historical analog</h2>
        <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.historicalAnalog)} />
      </section>

      {hasPricingContext && (
        <section className="mb-6 bg-[#1F2937] border border-[#374151] rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-3">Priced-in status & expected move</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">How much is already priced in</p>
              <p className="text-sm text-white font-semibold">{pricedInBucketLabel(scenario.pricedInBucket)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Expected average price change (still to move)</p>
              <p className="text-sm text-white font-semibold">{formatExpectedPriceChange(scenario.expectedPriceChange)}</p>
            </div>
          </div>
          {scenario.expectedPriceChangeExplanation && (
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Range & reasoning</p>
              <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.expectedPriceChangeExplanation)} />
            </div>
          )}
          {scenario.priceChangeTimeframeExplanation && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">When the move plays out</p>
              <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.priceChangeTimeframeExplanation)} />
            </div>
          )}
        </section>
      )}

      <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-emerald-300 mb-2">Winners</h2>
          <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.winnersMarkdown)} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-red-300 mb-2">Losers</h2>
          <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.losersMarkdown)} />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">Outlook (as of {asOf})</h2>
        <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.outlookMarkdown)} />
      </section>

      <section className="bg-[#1F2937] border border-[#374151] rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <LinkList title="Winners (tagged)" links={scenario.winners} emptyLabel="No ETFs tagged as winners." />
        <LinkList title="Losers (tagged)" links={scenario.losers} emptyLabel="No ETFs tagged as losers." />
        <LinkList title="Most exposed right now" links={scenario.mostExposed} emptyLabel="No ETFs tagged as currently most exposed." />
      </section>
    </article>
  );
}
