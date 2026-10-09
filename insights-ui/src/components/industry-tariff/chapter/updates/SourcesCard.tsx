import TextLink from '@/components/ui/TextLink';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import { RuleList, RuleListItem } from '@/components/ui/sections/RuleList';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import type { TariffUpdateSource } from '@/types/tariff-chapter-prototype';
import React from 'react';

// The one "Sources" section at the foot of every Approach-2 tariff page (issue #1770), import and
// export: each source's name (linked when it has a URL), an optional title, and a muted line of
// publisher and dates, in two ruled columns. Pages map their own source shape onto `SourceItem`
// with the helpers below, so the section looks the same everywhere.

export interface SourceItem {
  key: string;
  /** The source's name or citation, e.g. "91 FR 18183 · Proclamation 11020". */
  label: string;
  href?: string;
  /** Full document title, when the label is only a citation. */
  title?: string;
  /** Muted detail line, e.g. "Federal Register · Published Apr 9, 2026". */
  meta?: string;
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/** Federal Register notices, CBP messages and schedule editions (citation, title, publisher, dates). */
export function documentSourceItems(sources: TariffUpdateSource[]): SourceItem[] {
  return sources.map((source) => ({
    key: source.id,
    label: `${source.citation} · ${source.document}`,
    href: source.url,
    title: source.title,
    meta: `${source.publisher}${source.signed ? ` · Signed ${formatDate(source.signed)}` : ''} · Published ${formatDate(source.published)}`,
  }));
}

/** Plain named sources (a label, an optional URL and note), e.g. trade-data providers and news reports. */
export function labeledSourceItems(sources: Array<{ label: string; url?: string; note?: string }>): SourceItem[] {
  return sources.map((source) => ({ key: source.label, label: source.label, href: source.url, meta: source.note }));
}

interface SourcesCardProps {
  items: SourceItem[];
  /** Optional caveat above the list, e.g. what the trade figures do and do not include. */
  intro?: string;
}

export default function SourcesCard({ items, intro }: SourcesCardProps): React.JSX.Element | null {
  if (items.length === 0 && !intro) return null;
  return (
    <Stack as="section" gap="md">
      <SectionHeading as="h2" size="md" weight="bold" tone="heading">
        Sources
      </SectionHeading>
      {intro && <Text size="sm">{intro}</Text>}
      <RuleList as="ol" columns="1-2">
        {items.map((item) => (
          <RuleListItem key={item.key}>
            {item.href ? (
              <TextLink href={item.href} wrap>
                {item.label} ↗
              </TextLink>
            ) : (
              <Text size="sm" weight="medium" tone="white">
                {item.label}
              </Text>
            )}
            {item.title && <Text size="sm">{item.title}</Text>}
            {item.meta && (
              <Text size="xs" tone="muted">
                {item.meta}
              </Text>
            )}
          </RuleListItem>
        ))}
      </RuleList>
    </Stack>
  );
}
