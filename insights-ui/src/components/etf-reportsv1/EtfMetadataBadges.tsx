import { getEtfGroupName } from '@/utils/etf-categorization-utils';

export interface EtfMetadataBadgesProps {
  assetClass?: string | null;
  category?: string | null;
  className?: string;
}

interface BadgeItem {
  label: string;
  value: string;
}

export default function EtfMetadataBadges({ assetClass, category, className }: EtfMetadataBadgesProps): JSX.Element | null {
  const groupName = getEtfGroupName(category);

  const items: BadgeItem[] = [];
  if (assetClass) items.push({ label: 'Asset Class', value: assetClass });
  if (category) items.push({ label: 'Category', value: category });
  if (groupName) items.push({ label: 'Group', value: groupName });

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1 rounded-full border border-color bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-color"
        >
          <span className="text-muted-foreground">{item.label}:</span>
          <span>{item.value}</span>
        </span>
      ))}
    </div>
  );
}
