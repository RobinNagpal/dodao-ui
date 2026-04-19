import Link from 'next/link';
import { EtfScenarioDetail, EtfScenarioLinkDto } from '@/app/api/[spaceId]/etf-scenarios/[slug]/route';
import { parseMarkdown } from '@/util/parse-markdown';
import EtfScenarioOutlookBadge from './EtfScenarioOutlookBadge';
import { outlookBucketLabel } from '@/utils/etf-scenario-metadata-generators';

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

function LinkList({ title, links, emptyLabel }: { title: string; links: EtfScenarioLinkDto[]; emptyLabel?: string }): JSX.Element {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300 mb-2">{title}</h3>
      {links.length === 0 ? (
        <p className="text-xs text-gray-500">{emptyLabel ?? '—'}</p>
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

  return (
    <article className="text-[#E5E7EB]">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-black text-sm font-bold px-2.5 py-0.5 rounded">
          Scenario #{scenario.scenarioNumber}
        </span>
        <EtfScenarioOutlookBadge bucket={scenario.outlookBucket} asOfDate={scenario.outlookAsOfDate} />
        <span className="text-xs text-gray-400">
          Outlook reviewed {asOf} · bucket: {outlookBucketLabel(scenario.outlookBucket)}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-4">{scenario.title}</h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">Underlying cause</h2>
        <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.underlyingCause)} />
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">Historical analog</h2>
        <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(scenario.historicalAnalog)} />
      </section>

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
