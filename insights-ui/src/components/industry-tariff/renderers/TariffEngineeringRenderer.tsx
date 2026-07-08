import React from 'react';
import { TariffEngineering } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseChapterBodyMarkdown, parseMarkdown } from '@/util/parse-markdown';

interface TariffEngineeringRendererProps {
  tariffEngineering: TariffEngineering;
  // When true, render without nested gray-900 cards — sections become H2 headings + content
  // and per-strategy items become bg-gray-800 inner cards (factor-analysis style), designed to
  // sit inside a single outer article card on chapter pages.
  flat?: boolean;
}

function MarkdownBlock({ markdown, flat = false }: { markdown: string; flat?: boolean }): JSX.Element {
  const parse = flat ? parseChapterBodyMarkdown : parseMarkdown;
  return <div className="prose max-w-none markdown markdown-body" dangerouslySetInnerHTML={{ __html: parse(markdown) }} />;
}

function SectionCard({ heading, children }: { heading: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="bg-bg rounded-lg shadow-sm overflow-hidden">
      <div className="bg-surface p-4 border-b border-border">
        <h2 className="text-xl font-semibold heading-color">{heading}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function FlatSection({ heading, children }: { heading: string; children: React.ReactNode }): JSX.Element {
  return (
    <section>
      <h2 className="text-xl font-semibold heading-color mb-3">{heading}</h2>
      {children}
    </section>
  );
}

interface ClassificationLever {
  leverTitle?: string;
  currentClassification?: string;
  engineeredClassification?: string;
  basisForReclassification?: string;
  dutyDelta?: string;
}

function ClassificationLeversTable({ levers, flat }: { levers: ClassificationLever[]; flat: boolean }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface/60">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Lever</th>
            <th className="px-3 py-2 text-left font-semibold">Current Classification</th>
            <th className="px-3 py-2 text-left font-semibold">Engineered Classification</th>
            <th className="px-3 py-2 text-left font-semibold">Basis</th>
            <th className="px-3 py-2 text-left font-semibold">Duty Delta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {levers.map((lever, idx) => {
            const leverTitle = typeof lever?.leverTitle === 'string' ? lever.leverTitle : '';
            const currentClassification = typeof lever?.currentClassification === 'string' ? lever.currentClassification : '';
            const engineeredClassification = typeof lever?.engineeredClassification === 'string' ? lever.engineeredClassification : '';
            const basisForReclassification = typeof lever?.basisForReclassification === 'string' ? lever.basisForReclassification : '';
            const dutyDelta = typeof lever?.dutyDelta === 'string' ? lever.dutyDelta : '';
            return (
              <tr key={idx} className="align-top">
                <td className="px-3 py-3 font-medium">{leverTitle}</td>
                <td className="px-3 py-3">
                  <MarkdownBlock markdown={currentClassification} flat={flat} />
                </td>
                <td className="px-3 py-3">
                  <MarkdownBlock markdown={engineeredClassification} flat={flat} />
                </td>
                <td className="px-3 py-3">
                  <MarkdownBlock markdown={basisForReclassification} flat={flat} />
                </td>
                <td className="px-3 py-3">
                  <MarkdownBlock markdown={dutyDelta} flat={flat} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface Strategy {
  title?: string;
  technique?: string;
  applicabilityToChapter?: string;
  potentialDutyImpact?: string;
  implementationSteps?: string[];
  risksAndCaveats?: string;
  precedent?: string;
}

function StrategyCard({ strategy, flat }: { strategy: Strategy; flat: boolean }): JSX.Element {
  const stTitle = typeof strategy?.title === 'string' ? strategy.title : '';
  const technique = typeof strategy?.technique === 'string' ? strategy.technique : '';
  const applicability = typeof strategy?.applicabilityToChapter === 'string' ? strategy.applicabilityToChapter : '';
  const dutyImpact = typeof strategy?.potentialDutyImpact === 'string' ? strategy.potentialDutyImpact : '';
  const steps = Array.isArray(strategy?.implementationSteps) ? strategy.implementationSteps : [];
  const risks = typeof strategy?.risksAndCaveats === 'string' ? strategy.risksAndCaveats : '';
  const precedent = typeof strategy?.precedent === 'string' ? strategy.precedent : '';

  // Flat variant uses bg-gray-800 inner card (factor-analysis style); legacy uses border + bg-gray-900/40.
  const cardClass = flat ? 'rounded-md bg-surface p-4' : 'rounded-lg border border-border bg-bg/40 p-4';

  return (
    <div className={cardClass}>
      {stTitle && <h3 className="text-lg font-semibold heading-color mb-2">{stTitle}</h3>}
      {technique && (
        <div className="mb-3">
          <MarkdownBlock markdown={technique} flat={flat} />
        </div>
      )}
      {applicability && (
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wider text-muted mb-1">Applicability to chapter</div>
          <MarkdownBlock markdown={applicability} flat={flat} />
        </div>
      )}
      {dutyImpact && (
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wider text-muted mb-1">Potential duty impact</div>
          <MarkdownBlock markdown={dutyImpact} flat={flat} />
        </div>
      )}
      {steps.length > 0 && (
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wider text-muted mb-1">Implementation steps</div>
          <ol className="list-decimal list-inside space-y-1">
            {steps.map((step, sIdx) => {
              const parse = flat ? parseChapterBodyMarkdown : parseMarkdown;
              return (
                <li key={sIdx}>
                  <span className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parse(step) }} />
                </li>
              );
            })}
          </ol>
        </div>
      )}
      {risks && (
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wider text-muted mb-1">Risks &amp; caveats</div>
          <MarkdownBlock markdown={risks} flat={flat} />
        </div>
      )}
      {precedent && (
        <div>
          <div className="text-xs uppercase tracking-wider text-muted mb-1">Precedent</div>
          <MarkdownBlock markdown={precedent} flat={flat} />
        </div>
      )}
    </div>
  );
}

export const TariffEngineeringRenderer: React.FC<TariffEngineeringRendererProps> = ({ tariffEngineering, flat = false }) => {
  const title = typeof tariffEngineering?.title === 'string' ? tariffEngineering.title : '';
  const overview = typeof tariffEngineering?.overview === 'string' ? tariffEngineering.overview : '';
  const classificationLevers = Array.isArray(tariffEngineering?.classificationLevers) ? tariffEngineering.classificationLevers : [];
  const strategies = Array.isArray(tariffEngineering?.strategies) ? tariffEngineering.strategies : [];
  const countryOfOriginPlaybook = typeof tariffEngineering?.countryOfOriginPlaybook === 'string' ? tariffEngineering.countryOfOriginPlaybook : '';
  const valuationOpportunities = typeof tariffEngineering?.valuationOpportunities === 'string' ? tariffEngineering.valuationOpportunities : '';
  const ftzAndDrawback = typeof tariffEngineering?.ftzAndDrawback === 'string' ? tariffEngineering.ftzAndDrawback : '';
  const complianceGuardrails = typeof tariffEngineering?.complianceGuardrails === 'string' ? tariffEngineering.complianceGuardrails : '';
  const bottomLine = typeof tariffEngineering?.bottomLine === 'string' ? tariffEngineering.bottomLine : '';

  const hasAnyContent =
    title ||
    overview ||
    classificationLevers.length > 0 ||
    strategies.length > 0 ||
    countryOfOriginPlaybook ||
    valuationOpportunities ||
    ftzAndDrawback ||
    complianceGuardrails ||
    bottomLine;

  if (!hasAnyContent) {
    if (flat) {
      return <p className="text-muted italic">No content available</p>;
    }
    return (
      <div className="bg-bg rounded-lg p-6 shadow-sm">
        <p className="text-muted italic">No content available</p>
      </div>
    );
  }

  if (flat) {
    // The page-level H1 already shows `title` (see `getEffectivePageTitle` in chapter-section-page.tsx).
    // Render just the overview here so we keep one H1 per page.
    return (
      <div className="space-y-8">
        {overview && (
          <section>
            <MarkdownBlock markdown={overview} flat />
          </section>
        )}
        {classificationLevers.length > 0 && (
          <FlatSection heading="Classification Levers">
            <ClassificationLeversTable levers={classificationLevers} flat />
          </FlatSection>
        )}
        {strategies.length > 0 && (
          <FlatSection heading="Tariff Engineering Strategies">
            <div className="space-y-4">
              {strategies.map((strategy, idx) => (
                <StrategyCard key={idx} strategy={strategy} flat />
              ))}
            </div>
          </FlatSection>
        )}
        {countryOfOriginPlaybook && (
          <FlatSection heading="Country-of-Origin Playbook">
            <MarkdownBlock markdown={countryOfOriginPlaybook} flat />
          </FlatSection>
        )}
        {valuationOpportunities && (
          <FlatSection heading="Valuation Opportunities">
            <MarkdownBlock markdown={valuationOpportunities} flat />
          </FlatSection>
        )}
        {ftzAndDrawback && (
          <FlatSection heading="Foreign Trade Zones & Duty Drawback">
            <MarkdownBlock markdown={ftzAndDrawback} flat />
          </FlatSection>
        )}
        {complianceGuardrails && (
          <FlatSection heading="Compliance Guardrails">
            <MarkdownBlock markdown={complianceGuardrails} flat />
          </FlatSection>
        )}
        {bottomLine && (
          <FlatSection heading="Bottom Line">
            <MarkdownBlock markdown={bottomLine} flat />
          </FlatSection>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {(title || overview) && (
        <div className="bg-bg rounded-lg shadow-sm overflow-hidden">
          {title && (
            <div className="bg-surface p-4 border-b border-border">
              <h2 className="text-2xl font-bold heading-color">{title}</h2>
            </div>
          )}
          {overview && (
            <div className="p-4">
              <MarkdownBlock markdown={overview} />
            </div>
          )}
        </div>
      )}

      {classificationLevers.length > 0 && (
        <SectionCard heading="Classification Levers">
          <ClassificationLeversTable levers={classificationLevers} flat={false} />
        </SectionCard>
      )}

      {strategies.length > 0 && (
        <SectionCard heading="Tariff Engineering Strategies">
          <div className="space-y-6">
            {strategies.map((strategy, idx) => (
              <StrategyCard key={idx} strategy={strategy} flat={false} />
            ))}
          </div>
        </SectionCard>
      )}

      {countryOfOriginPlaybook && (
        <SectionCard heading="Country-of-Origin Playbook">
          <MarkdownBlock markdown={countryOfOriginPlaybook} />
        </SectionCard>
      )}

      {valuationOpportunities && (
        <SectionCard heading="Valuation Opportunities">
          <MarkdownBlock markdown={valuationOpportunities} />
        </SectionCard>
      )}

      {ftzAndDrawback && (
        <SectionCard heading="Foreign Trade Zones &amp; Duty Drawback">
          <MarkdownBlock markdown={ftzAndDrawback} />
        </SectionCard>
      )}

      {complianceGuardrails && (
        <SectionCard heading="Compliance Guardrails">
          <MarkdownBlock markdown={complianceGuardrails} />
        </SectionCard>
      )}

      {bottomLine && (
        <SectionCard heading="Bottom Line">
          <MarkdownBlock markdown={bottomLine} />
        </SectionCard>
      )}
    </div>
  );
};
