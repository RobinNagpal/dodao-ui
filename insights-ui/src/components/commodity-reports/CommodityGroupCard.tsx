import { CommodityListItem } from '@/app/api/[spaceId]/commodities-v1/listing/route';
import { getScoreColorClasses } from '@/utils/score-utils';
import Link from 'next/link';

/** Commodity final score = sum of the four category pass counts (5 factors each). */
const COMMODITY_MAX_SCORE = 20;

/**
 * One commodity group (Energy, Metals, Agriculture, Livestock) rendered as a
 * card — the commodity parallel of the stock `SubIndustryCard`. The group name
 * is the header (with a count pill) and each commodity is a scored row, reusing
 * the same score-badge colors as stocks for a consistent look.
 */
export default function CommodityGroupCard({ group, commodities }: { group: string; commodities: CommodityListItem[] }): JSX.Element {
  const countLabel = `${commodities.length.toLocaleString()} ${commodities.length === 1 ? 'commodity' : 'commodities'}`;

  return (
    <div className="relative bg-block-bg-color rounded-lg border border-color overflow-hidden flex flex-col">
      <div className="px-3 py-2 sm:px-4 border-b border-color bg-surface-2">
        <h3 className="text-sm font-semibold heading-color leading-snug break-words pr-24" title={group}>
          {group}
        </h3>
      </div>
      <div className="absolute top-2 right-2 z-10 text-[13px] text-heading bg-primary px-2 py-0.5 rounded-full" aria-label={countLabel} title={countLabel}>
        {countLabel}
      </div>

      <ul className="divide-y divide-color flex-1">
        {commodities.map((commodity) => {
          const hasScore = commodity.finalScore !== null;
          const { textColorClass, bgColorClass } = getScoreColorClasses(commodity.finalScore ?? 0);

          return (
            <li key={commodity.id} className="px-3 sm:px-4 py-1.5 hover:bg-surface-3 transition-colors">
              <Link
                href={`/commodities/${commodity.slug}`}
                prefetch={false}
                className="w-full"
                aria-label={`View ${commodity.name}`}
                title={`View ${commodity.name}`}
              >
                <div className="flex gap-1.5 items-center min-w-0">
                  {hasScore ? (
                    <p className={`${textColorClass} px-1 rounded-md ${bgColorClass} bg-opacity-15 hover:bg-opacity-25 w-[52px] text-right shrink-0`}>
                      <span className="font-mono tabular-nums text-right text-xs">
                        {commodity.finalScore}/{COMMODITY_MAX_SCORE}
                      </span>
                    </p>
                  ) : (
                    <p className="text-muted px-1 rounded-md bg-gray-500 bg-opacity-15 w-[52px] text-right shrink-0">
                      <span className="font-mono tabular-nums text-right text-xs">—</span>
                    </p>
                  )}
                  <p className="text-sm font-medium text-heading break-words truncate min-w-0 flex-1">{commodity.name}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
