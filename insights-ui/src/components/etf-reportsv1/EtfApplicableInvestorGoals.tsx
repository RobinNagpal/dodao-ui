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
import type { ComponentType, SVGProps } from 'react';

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
 * "Who This ETF Suits" — the goals (grouped by investor type) the key-facts
 * report says this ETF can help achieve. Each investor type shows an icon +
 * name and each goal a chip; the native `title` attribute supplies a
 * lightweight, server-rendered tooltip with the taxonomy short description (no
 * client JS). Renders nothing when no goals were selected (a bad/unsuitable
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
              <span title={investor.shortDescription} className="mb-2 inline-flex cursor-help items-center gap-1.5 text-sm font-semibold text-color">
                <Icon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                {investor.name}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {goals.map((goal) => (
                  <span
                    key={goal.key}
                    title={goal.shortDescription}
                    className="inline-flex cursor-help rounded-full bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-200 hover:bg-gray-700"
                  >
                    {goal.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
