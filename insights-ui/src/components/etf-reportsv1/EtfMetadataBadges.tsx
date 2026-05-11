import Link from 'next/link';
import { getEtfGroupName, getEtfGroupKey } from '@/utils/etf-categorization-utils';
import { getCountryByExchange, SupportedCountries, toExchange } from '@/utils/countryExchangeUtils';

export interface EtfMetadataBadgesProps {
  exchange?: string | null;
  assetClass?: string | null;
  category?: string | null;
  issuer?: string | null;
  className?: string;
}

interface BadgeItem {
  label: string;
  value: string;
  href: string;
  colorClasses: string;
}

const ASSET_CLASS_COLORS = 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800';
const CATEGORY_COLORS = 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800';
const GROUP_COLORS = 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-800';
const PROVIDER_COLORS = 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800';

function getCountryPathPrefix(exchange: string | null | undefined): string {
  if (!exchange) return '/etfs';
  try {
    const country = getCountryByExchange(toExchange(exchange));
    return country === SupportedCountries.US ? '/etfs' : `/etfs/countries/${encodeURIComponent(country)}`;
  } catch {
    return '/etfs';
  }
}

export default function EtfMetadataBadges({ exchange, assetClass, category, issuer, className }: EtfMetadataBadgesProps): JSX.Element | null {
  const groupName = getEtfGroupName(category);
  const groupKey = getEtfGroupKey(category);
  const prefix = getCountryPathPrefix(exchange);
  const trimmedIssuer = issuer?.trim();

  const items: BadgeItem[] = [];
  if (assetClass) {
    items.push({
      label: 'Asset Class',
      value: assetClass,
      href: `${prefix}/asset-classes/${encodeURIComponent(assetClass)}`,
      colorClasses: ASSET_CLASS_COLORS,
    });
  }
  if (category) {
    items.push({
      label: 'Category',
      value: category,
      href: `${prefix}/categories/${encodeURIComponent(category)}`,
      colorClasses: CATEGORY_COLORS,
    });
  }
  if (groupName && groupKey) {
    items.push({
      label: 'Group',
      value: groupName,
      href: `${prefix}/groups/${encodeURIComponent(groupKey)}`,
      colorClasses: GROUP_COLORS,
    });
  }
  if (trimmedIssuer) {
    items.push({
      label: 'Provider',
      value: trimmedIssuer,
      href: `${prefix}/providers/${encodeURIComponent(trimmedIssuer)}`,
      colorClasses: PROVIDER_COLORS,
    });
  }

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${item.colorClasses}`}
          aria-label={`View all ETFs in ${item.label}: ${item.value}`}
        >
          <span className="opacity-80">{item.label}:</span>
          <span>{item.value}</span>
        </Link>
      ))}
    </div>
  );
}
