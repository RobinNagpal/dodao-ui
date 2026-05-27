import { getInvestorByKey } from '@/etf-analysis-data/etf-investor-taxonomy';
import { EtfApplicableInvestorGoals as EtfApplicableInvestorGoalsType } from '@/types/etf/etf-analysis-types';

interface EtfApplicableInvestorGoalsProps {
  investorGoals?: EtfApplicableInvestorGoalsType[] | null;
}

/**
 * "Who This ETF Suits" — the goals (grouped by investor type) the key-facts
 * report says this ETF can help achieve. Keys come from the LLM; we resolve
 * each to its taxonomy display name here. Renders nothing when no goals were
 * selected (a bad/unsuitable fund) or for reports generated before this
 * feature, so older reports are unaffected.
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
      <ul className="space-y-2">
        {groups.map(({ investor, goals }) => (
          <li key={investor.key} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
            <span className="flex-shrink-0 text-sm font-semibold text-color sm:w-64">{investor.name}</span>
            <span className="flex flex-wrap gap-1.5">
              {goals.map((goal) => (
                <span
                  key={goal.key}
                  title={goal.shortDescription}
                  className="inline-flex rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-200"
                >
                  {goal.name}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
