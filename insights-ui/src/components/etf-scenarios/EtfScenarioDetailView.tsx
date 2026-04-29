import { EtfScenarioDetail } from '@/app/api/[spaceId]/etf-scenarios/[slug]/route';
import { parseMarkdown } from '@/util/parse-markdown';
import { directionLabel, pricedInBucketLabel, probabilityBucketLabel, timeframeLabel } from '@/utils/etf-scenario-metadata-generators';
import EtfScenarioLinkColumns from './EtfScenarioLinkColumns';
import { EtfScenarioDirectionBadge, EtfScenarioProbabilityBadge, EtfScenarioTimeframeBadge } from './EtfScenarioOutlookBadge';

function renderMarkdown(md: string) {
  return { __html: parseMarkdown(md) as string };
}

function formatExpectedPriceChange(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

export default function EtfScenarioDetailView({ scenario }: { scenario: EtfScenarioDetail }): JSX.Element {
  const asOf = scenario.outlookAsOfDate.slice(0, 10);
  const hasPricingContext =
    scenario.pricedInBucket || scenario.expectedPriceChange !== null || scenario.expectedPriceChangeExplanation || scenario.priceChangeTimeframeExplanation;

  return (
    <article className="text-[#E5E7EB]" itemScope itemType="https://schema.org/Article">
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-black text-sm font-bold px-2.5 py-0.5 rounded">
            Scenario #{scenario.scenarioNumber}
          </span>
          <EtfScenarioDirectionBadge direction={scenario.direction} />
          <EtfScenarioProbabilityBadge bucket={scenario.probabilityBucket} percentage={scenario.probabilityPercentage} asOfDate={scenario.outlookAsOfDate} />
          <EtfScenarioTimeframeBadge timeframe={scenario.timeframe} />
          {scenario.archived && <span className="text-xs text-gray-300 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded">Archived</span>}
        </div>

        <h1 className="text-3xl font-bold text-white mb-3" itemProp="headline">
          {scenario.title}
        </h1>

        <p className="text-xs text-gray-400 mb-2">
          <span className="sr-only">Scenario summary: </span>
          {directionLabel(scenario.direction)} · {probabilityBucketLabel(scenario.probabilityBucket)} · {timeframeLabel(scenario.timeframe)} ·{' '}
          <span>
            outlook reviewed <time dateTime={asOf}>{asOf}</time>
          </span>
        </p>

        {scenario.countries.length > 0 && (
          <p className="text-xs text-gray-400 mb-0">
            <span className="uppercase tracking-wide text-[11px] text-gray-500 mr-2">Countries in scope</span>
            {scenario.countries.map((c) => (
              <span
                key={c}
                className="inline-block text-[10px] uppercase tracking-wide text-gray-300 bg-[#111827] border border-[#374151] rounded px-1.5 py-0.5 mr-1"
              >
                {c}
              </span>
            ))}
          </p>
        )}
      </header>

      <section className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mb-6" aria-labelledby="underlying-cause-heading">
        <h2 id="underlying-cause-heading" className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
          Underlying cause
        </h2>
        <div
          className="markdown-body prose prose-invert max-w-none"
          itemProp="articleBody"
          dangerouslySetInnerHTML={renderMarkdown(scenario.underlyingCause)}
        />
      </section>

      <section className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mb-6" aria-labelledby="historical-analog-heading">
        <h2 id="historical-analog-heading" className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
          Historical analog
        </h2>
        <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.historicalAnalog)} />
      </section>

      {hasPricingContext && (
        <section className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mb-6" aria-labelledby="priced-in-heading">
          <h2 id="priced-in-heading" className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
            Priced-in status &amp; expected move
          </h2>
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
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Range &amp; reasoning</p>
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

      <section className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mb-6" aria-labelledby="winners-losers-heading">
        <h2 id="winners-losers-heading" className="sr-only">
          Winners and losers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-emerald-300 mb-2">Winners</h3>
            <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.winnersMarkdown)} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-300 mb-2">Losers</h3>
            <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.losersMarkdown)} />
          </div>
        </div>
      </section>

      <section className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mb-6" aria-labelledby="outlook-heading">
        <h2 id="outlook-heading" className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
          Outlook <span className="text-sm font-normal text-gray-400">(as of {asOf})</span>
        </h2>
        <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.outlookMarkdown)} />
      </section>

      <section aria-labelledby="impacted-etfs-heading">
        <h2 id="impacted-etfs-heading" className="sr-only">
          Impacted ETFs
        </h2>
        <EtfScenarioLinkColumns winners={scenario.winners} losers={scenario.losers} mostExposed={scenario.mostExposed} scenarioCountries={scenario.countries} />
      </section>
    </article>
  );
}
