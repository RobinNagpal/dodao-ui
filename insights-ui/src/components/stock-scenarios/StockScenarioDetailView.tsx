import { StockScenarioDetail } from '@/app/api/[spaceId]/stock-scenarios/[slug]/route';
import { parseMarkdown } from '@/util/parse-markdown';
import { directionLabel, pricedInBucketLabel, probabilityBucketLabel, timeframeLabel } from '@/utils/stock-scenario-metadata-generators';
import StockScenarioLinkColumns from './StockScenarioLinkColumns';
import { StockScenarioDirectionBadge, StockScenarioProbabilityBadge, StockScenarioTimeframeBadge } from './StockScenarioOutlookBadge';

function renderMarkdown(md: string) {
  return { __html: parseMarkdown(md) as string };
}

function formatExpectedPriceChange(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

export default function StockScenarioDetailView({ scenario }: { scenario: StockScenarioDetail }): JSX.Element {
  const asOf = scenario.outlookAsOfDate.slice(0, 10);
  const hasPricingContext =
    scenario.pricedInBucket || scenario.expectedPriceChange !== null || scenario.expectedPriceChangeExplanation || scenario.priceChangeTimeframeExplanation;

  return (
    <article className="text-[#E5E7EB]">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-black text-sm font-bold px-2.5 py-0.5 rounded">
          Scenario #{scenario.scenarioNumber}
        </span>
        <StockScenarioDirectionBadge direction={scenario.direction} />
        <StockScenarioProbabilityBadge bucket={scenario.probabilityBucket} percentage={scenario.probabilityPercentage} asOfDate={scenario.outlookAsOfDate} />
        <StockScenarioTimeframeBadge timeframe={scenario.timeframe} />
      </div>
      <p className="text-xs text-gray-400 mb-2">
        {directionLabel(scenario.direction)} · {probabilityBucketLabel(scenario.probabilityBucket)} · {timeframeLabel(scenario.timeframe)} · outlook reviewed{' '}
        {asOf}
      </p>
      {scenario.countries.length > 0 && (
        <p className="text-xs text-gray-400 mb-4">
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

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">Outlook (as of {asOf})</h2>
        <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.outlookMarkdown)} />
      </section>

      <StockScenarioLinkColumns winners={scenario.winners} losers={scenario.losers} mostExposed={scenario.mostExposed} scenarioCountries={scenario.countries} />
    </article>
  );
}
