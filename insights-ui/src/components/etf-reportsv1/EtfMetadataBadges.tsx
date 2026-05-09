import Link from 'next/link';
import { getEtfGroupName, getEtfGroupKey } from '@/utils/etf-categorization-utils';

export interface EtfMetadataBadgesProps {
  assetClass?: string | null;
  category?: string | null;
  className?: string;
}

interface BadgeItem {
  label: string;
  value: string;
  href: string;
}

export default function EtfMetadataBadges({ assetClass, category, className }: EtfMetadataBadgesProps): JSX.Element | null {
  const groupName = getEtfGroupName(category);
  const groupKey = getEtfGroupKey(category);

  const items: BadgeItem[] = [];
  if (assetClass) {
    items.push({
      label: 'Asset Class',
      value: assetClass,
      href: `/etfs/asset-classes/${encodeURIComponent(assetClass)}`,
    });
  }
  if (category) {
    items.push({
      label: 'Category',
      value: category,
      href: `/etfs/categories/${encodeURIComponent(category)}`,
    });
  }
  if (groupName && groupKey) {
    items.push({
      label: 'Group',
      value: groupName,
      href: `/etfs/groups/${encodeURIComponent(groupKey)}`,
    });
  }

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="inline-flex items-center gap-1 rounded-full border border-color bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-color hover:border-[#F59E0B] hover:bg-gray-700 transition-colors"
          aria-label={`View all ETFs in ${item.label}: ${item.value}`}
        >
          <span className="text-muted-foreground">{item.label}:</span>
          <span>{item.value}</span>
        </Link>
      ))}
    </div>
  );
}
