'use client';

import EmptyStateCard from '@/components/ui/EmptyStateCard';
import SearchField from '@/components/ui/SearchField';
import Text from '@/components/ui/Text';
import ToggleChip from '@/components/ui/ToggleChip';
import Stack from '@/components/ui/containers/Stack';
import { IndexList, IndexListGroup } from '@/components/ui/sections/IndexList';
import React, { useState } from 'react';

// Chapter list on /tariff-reports: one row per chapter, grouped by HTS section like the HTS code
// browser, with a search box and an "Also has a U.S. exports report" filter. The rows are rendered on the
// server and passed in; this only decides which ones show. Every row stays in the server HTML.

export interface TariffChapterListItem {
  key: string;
  chapterNumber: number;
  /** Lower-cased text the search box matches: title, summary and section title. */
  searchText: string;
  hasExports: boolean;
  row: React.ReactNode;
}

export interface TariffChapterListGroup {
  key: string;
  /** e.g. "Section I"; omitted for the catch-all group. */
  label?: string;
  title: string;
  /** e.g. "Chapters 1 – 5". */
  subtitle?: string;
  items: TariffChapterListItem[];
}

// "3" finds chapters 03 and 30–39, "38" finds chapter 38; anything else is a text search.
function matches(item: TariffChapterListItem, query: string): boolean {
  if (/^\d{1,2}$/.test(query)) {
    return item.chapterNumber.toString().startsWith(query) || item.chapterNumber.toString().padStart(2, '0').startsWith(query);
  }
  return query.split(/\s+/).every((word) => item.searchText.includes(word));
}

export default function TariffChapterList({ groups }: { groups: TariffChapterListGroup[] }): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [onlyExports, setOnlyExports] = useState(false);

  const allItems = groups.flatMap((group) => group.items);
  const exportCount = allItems.filter((item) => item.hasExports).length;
  const normalized = query.trim().toLowerCase();
  const isVisible = (item: TariffChapterListItem): boolean => (!onlyExports || item.hasExports) && (normalized === '' || matches(item, normalized));
  const visibleGroups = groups.map((group) => ({ ...group, items: group.items.filter(isVisible) })).filter((group) => group.items.length > 0);
  const visibleCount = visibleGroups.reduce((sum, group) => sum + group.items.length, 0);
  const filtered = normalized !== '' || onlyExports;

  return (
    <Stack gap="xl">
      <Stack gap="sm">
        <SearchField
          size="lg"
          value={query}
          onChange={setQuery}
          label="Find a chapter"
          placeholder="Chapter number or product, e.g. 38 or coffee"
          resultLabel={filtered ? `${visibleCount} of ${allItems.length} chapters` : `${allItems.length} chapters`}
        />
        {exportCount > 0 && (
          <Stack direction="row" gap="sm" align="center" wrap>
            <ToggleChip label="Also has a U.S. exports report" active={onlyExports} onToggle={() => setOnlyExports(!onlyExports)} count={exportCount} />
            <Text as="span" size="xs" tone="muted">
              what other countries charge on these goods when the U.S. sells them abroad
            </Text>
          </Stack>
        )}
      </Stack>

      {visibleGroups.length === 0 ? (
        <EmptyStateCard
          variant="inline"
          title={`No chapter matches "${query.trim()}"`}
          description="Try a product name (e.g. steel, coffee) or a chapter number from 1 to 99."
        />
      ) : (
        visibleGroups.map((group) => (
          <IndexListGroup key={group.key} label={group.label} title={group.title} subtitle={group.subtitle}>
            <IndexList>
              {group.items.map((item) => (
                <React.Fragment key={item.key}>{item.row}</React.Fragment>
              ))}
            </IndexList>
          </IndexListGroup>
        ))
      )}
    </Stack>
  );
}
