import { getInvestorByKey } from '@/etf-analysis-data/etf-investor-taxonomy';
import { EtfApplicableInvestorGoals as EtfApplicableInvestorGoalsType } from '@/types/etf/etf-analysis-types';
import {
  BanknotesIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  PresentationChartLineIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, ReactNode, SVGProps } from 'react';

interface EtfApplicableInvestorGoalsProps {
  investorGoals?: EtfApplicableInvestorGoalsType[] | null;
}

const INVESTOR_TYPE_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'retail-individual': UserIcon,
  'high-net-worth-individual': BanknotesIcon,
  'pension-endowment-foundation-sovereign': BuildingLibraryIcon,
  'insurance-bank-corporate-treasury': BuildingOffice2Icon,
  'financial-advisor-ria': BriefcaseIcon,
  'hedge-fund-asset-manager-trading-desk': PresentationChartLineIcon,
};

/**
 * Lightweight CSS-only tooltip: no client JS, just markup + `group-hover`, so
 * it renders server-side and styles consistently (unlike the native `title`
 * attribute, which is delayed and unstyleable).
 */
function HoverTooltip({ text, children }: { text: string; children: ReactNode }): JSX.Element {
  return (
    <span className="group relative inline-flex cursor-help">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-30 mt-1.5 w-72 max-w-[min(18rem,80vw)] rounded-md border border-color block-bg-color px-3 py-2 text-xs font-normal leading-snug text-color opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

/**
 * "Who This ETF Suits" — the goals (grouped by investor type) the key-facts
 * report says this ETF can help achieve. Each investor type shows an icon +
 * name (hover for what the type is) and each goal a chip (hover for what the
 * goal is). Renders nothing when no goals were selected (a bad/unsuitable
 * fund) or for reports generated before this feature.
 */
export default function EtfApplicableInvestorGoals({ investorGoals }: EtfApplicableInvestorGoalsProps): JSX.Element | null {
  const groups = (investorGoals ?? [])
    .map((group) => {
      const investor = getInvestorByKey(group.investorTypeKey);
      if (!investor) return null;
      const goals = (group.goalKeys ?? [])
        .map((goalKey) => investor.etfInvestorGoals.find((goal) => goal.key === goalKey))
        .filter((goal): goal is NonNullable<typeof goal> => Boolean(goal));
      if (goals.length === 0) return null;
      return { investor, goals };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  if (groups.length === 0) return null;

  return (
    <section id="applicable-investor-goals" className="mb-8">
      <h3 className="text-lg font-semibold text-color mb-3">Who This ETF Suits</h3>
      <div className="space-y-4">
        {groups.map(({ investor, goals }) => {
          const Icon = INVESTOR_TYPE_ICONS[investor.key] ?? UserGroupIcon;
          return (
            <div key={investor.key}>
              <div className="mb-2">
                <HoverTooltip text={investor.shortDescription}>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-color">
                    <Icon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                    {investor.name}
                  </span>
                </HoverTooltip>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs font-medium uppercase tracking-wide text-gray-400">Goals</span>
                {goals.map((goal) => (
                  <HoverTooltip key={goal.key} text={goal.shortDescription}>
                    <span className="inline-flex rounded-full border border-color block-bg-color px-2.5 py-1 text-xs font-medium text-color transition-colors hover:border-primary-color">
                      {goal.name}
                    </span>
                  </HoverTooltip>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
