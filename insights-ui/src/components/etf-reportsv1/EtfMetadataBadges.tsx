import Link from 'next/link';
import { getEtfGroupName, getEtfGroupKey, slugifyEtfCategory } from '@/utils/etf-categorization-utils';
import { getCountryByExchange, SupportedCountries, toExchange } from '@/utils/countryExchangeUtils';
import { slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import { badgeTone, type BadgeTone } from '@/components/ui/badges/badgeTone';

export interface EtfMetadataBadgesProps {
  exchange?: string | null;
  assetClass?: string | null;
  category?: string | null;
  issuer?: string | null;
  indexName?: string | null;
  className?: string;
}

interface BadgeItem {
  label: string;
  value: string;
  href: string | null;
  tone: BadgeTone;
}

function getCountryPathPrefix(exchange: string | null | undefined): string {
  if (!exchange) return '/etfs';
  try {
    const country = getCountryByExchange(toExchange(exchange));
    return country === SupportedCountries.US ? '/etfs' : `/etfs/countries/${encodeURIComponent(country)}`;
  } catch {
    return '/etfs';
  }
}

export default function EtfMetadataBadges({ exchange, assetClass, category, issuer, indexName, className }: EtfMetadataBadgesProps): JSX.Element | null {
  const groupName = getEtfGroupName(category);
  const groupKey = getEtfGroupKey(category);
  const prefix = getCountryPathPrefix(exchange);
  const trimmedIssuer = issuer?.trim();
  const trimmedIndexName = indexName?.trim();

  const items: BadgeItem[] = [];
  if (assetClass) {
    items.push({
      label: 'Asset Class',
      value: assetClass,
      href: `${prefix}/asset-classes/${slugifyEtfTag(assetClass)}`,
      tone: 'info',
    });
  }
  if (groupName && groupKey) {
    items.push({
      label: 'Group',
      value: groupName,
      href: `${prefix}/groups/${groupKey}`,
      tone: 'neutral',
    });
  }
  if (category) {
    items.push({
      label: 'Category',
      value: category,
      href: groupKey ? `${prefix}/groups/${groupKey}/categories/${slugifyEtfCategory(category)}` : null,
      tone: 'accent',
    });
  }
  if (trimmedIssuer) {
    items.push({
      label: 'Provider',
      value: trimmedIssuer,
      href: `${prefix}/providers/${slugifyEtfTag(trimmedIssuer)}`,
      tone: 'success',
    });
  }
  if (trimmedIndexName) {
    items.push({
      label: 'Index',
      value: trimmedIndexName,
      href: null,
      tone: 'accent',
    });
  }

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {items.map((item) =>
        item.href ? (
          <Link
            key={item.label}
            href={item.href}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${badgeTone({ tone: item.tone })}`}
            aria-label={`View all ETFs in ${item.label}: ${item.value}`}
          >
            <span className="opacity-80">{item.label}:</span>
            <span>{item.value}</span>
          </Link>
        ) : (
          <span
            key={item.label}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeTone({ tone: item.tone })}`}
            aria-label={`${item.label}: ${item.value}`}
          >
            <span className="opacity-80">{item.label}:</span>
            <span>{item.value}</span>
          </span>
        )
      )}
    </div>
  );
}
