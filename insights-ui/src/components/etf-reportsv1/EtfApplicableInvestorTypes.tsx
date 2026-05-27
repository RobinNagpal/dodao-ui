import { getInvestorByKey } from '@/etf-analysis-data/etf-investor-taxonomy';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface EtfApplicableInvestorTypesProps {
  investorTypeKeys?: string[] | null;
}

/**
 * "Who this ETF suits" — the key-facts report's applicable investor types.
 * Keys come from the LLM; we resolve each to its taxonomy display name here.
 * Renders nothing when no types were selected (a bad/unsuitable fund) or for
 * reports generated before this feature, so older reports are unaffected.
 */
export default function EtfApplicableInvestorTypes({ investorTypeKeys }: EtfApplicableInvestorTypesProps): JSX.Element | null {
  const investors = (investorTypeKeys ?? []).map((key) => getInvestorByKey(key)).filter((inv): inv is NonNullable<typeof inv> => Boolean(inv));

  if (investors.length === 0) return null;

  return (
    <section id="applicable-investor-types" className="mb-8">
      <h2 className="text-xl font-semibold text-color mb-3">Who This ETF Suits</h2>
      <div className="flex flex-wrap gap-2">
        {investors.map((investor) => (
          <span
            key={investor.key}
            title={investor.shortDescription}
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-200"
          >
            <UserGroupIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
            {investor.name}
          </span>
        ))}
      </div>
    </section>
  );
}
