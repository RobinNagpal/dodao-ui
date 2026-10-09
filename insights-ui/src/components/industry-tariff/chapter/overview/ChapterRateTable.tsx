'use client';

import GlossaryTerm from '@/components/industry-tariff/chapter/GlossaryTerm';
import Stack from '@/components/ui/containers/Stack';
import SearchField from '@/components/ui/SearchField';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import ToggleChip from '@/components/ui/ToggleChip';
import InlineCard from '@/components/ui/sections/InlineCard';
import {
  DataTable,
  EmptyCellValue,
  IndentedLabel,
  InheritedValue,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableScroll,
} from '@/components/ui/tables/DataTable';
import type { TariffRateTableRow } from '@/types/tariff-chapter-prototype';
import React, { useMemo, useState } from 'react';

// The chapter rate table: Approach 2's overview job — "the complete, searchable
// rate table: general, FTA and Column 2 rates plus additional duties,
// filterable by product name" (issue #1770).
//
// This is a client component only so the search box and toggles work. Next
// still server-renders the full row set into the HTML, so every line is
// crawlable and readable with JavaScript disabled — nothing a reader (or
// Google) needs is behind an interaction.

interface ChapterRateTableProps {
  rows: TariffRateTableRow[];
  /** Explains the inherited-rate convention. */
  note: string;
}

function matchesQuery(row: TariffRateTableRow, query: string): boolean {
  if (!query) return true;
  if (row.searchText.includes(query)) return true;
  // Digit-only queries match the code itself ("0104", "0104200000").
  const digits = query.replace(/\D/g, '');
  return digits.length > 0 && (row.htsCode10?.startsWith(digits) ?? false);
}

/**
 * Rows to render for the current filters, with each match's ancestors kept so
 * a row never appears without the headings that give it meaning.
 */
export function visibleRows(rows: TariffRateTableRow[], query: string, dutiableOnly: boolean, leafOnly: boolean): TariffRateTableRow[] {
  const keep = new Set<string>();

  rows.forEach((row, index) => {
    if (!matchesQuery(row, query)) return;
    if (dutiableOnly && !row.dutiable) return;
    if (leafOnly && !row.htsCode10) return;
    keep.add(row.id);

    if (leafOnly) return; // breadcrumbs carry the context instead
    let depth = row.indent;
    for (let i = index - 1; i >= 0 && depth > 0; i--) {
      if (rows[i].indent < depth) {
        keep.add(rows[i].id);
        depth = rows[i].indent;
      }
    }
  });

  return rows.filter((row) => keep.has(row.id));
}

function RateValue({ value, inheritedFrom }: { value: string | null; inheritedFrom: string | null }): React.JSX.Element {
  if (!value) return <EmptyCellValue />;
  if (inheritedFrom) return <InheritedValue value={value} from={inheritedFrom} />;
  return <span>{value}</span>;
}

// "Free (A+,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)" is 18 codes wide and
// wraps to three lines in every row of the table. Collapse it to the rate plus
// a count ("Free under 17 trade deals"); the codes themselves are in the expanded row and in the
// legend under the table. Some lines also point to Chapter 98 provisions for
// further programs — "Free (BH,CL) See 9822.05.20 (P+) See 9822.06.10 (PE)" —
// and each of those counts as one more program.
const PREFERENCE_LIST = /^(.*?)\s*\(([^)]+)\)(.*)$/;
const CHAPTER_98_REFERENCE = /See\s+[\d.-]+\s*\(([^)]+)\)/g;

function PreferenceRateValue({ value, inheritedFrom }: { value: string | null; inheritedFrom: string | null }): React.JSX.Element {
  if (!value) return <EmptyCellValue />;
  const match = PREFERENCE_LIST.exec(value);
  if (!match) return <RateValue value={value} inheritedFrom={inheritedFrom} />;

  const [, rate, codes, rest] = match;
  if (rest.replace(CHAPTER_98_REFERENCE, '').trim().length > 0) return <RateValue value={value} inheritedFrom={inheritedFrom} />;

  const referenceCount = Array.from(rest.matchAll(CHAPTER_98_REFERENCE)).length;
  const count = codes.split(',').filter((code) => code.trim().length > 0).length + referenceCount;
  return (
    <Stack direction="row" gap="xs" align="baseline" wrap>
      <RateValue value={rate} inheritedFrom={inheritedFrom} />
      <Text as="span" size="xs" tone="muted">
        under {count} {count === 1 ? 'trade deal' : 'trade deals'}
      </Text>
    </Stack>
  );
}

function RowDetail({ row }: { row: TariffRateTableRow }): React.JSX.Element {
  return (
    <InlineCard padding="cozy">
      <Stack gap="sm">
        {row.ancestorPath.length > 0 && (
          <Text size="xs" tone="muted">
            {[...row.ancestorPath, row.description].join(' › ')}
          </Text>
        )}
        <Stack direction="row" gap="lg" wrap>
          {row.units.length > 0 && (
            <Text size="xs" tone="muted">
              Reported in: {row.units.join(', ')}
            </Text>
          )}
          {row.quotaQuantity && (
            <Text size="xs" tone="muted">
              Quota: {row.quotaQuantity}
            </Text>
          )}
          {row.additionalDuties && (
            <Text size="xs" tone="muted">
              Additional duties: {row.additionalDuties}
            </Text>
          )}
        </Stack>
        {row.effectiveSpecial && (
          <Text size="xs" tone="muted">
            Preference rate: {row.effectiveSpecial}
          </Text>
        )}
        <TextLink href={row.htsCode10 ? `/tariff-calculator?hts=${row.htsCode10}` : '/tariff-calculator'} size="xs">
          Work out the landed cost in the duty calculator →
        </TextLink>
      </Stack>
    </InlineCard>
  );
}

export default function ChapterRateTable({ rows, note }: ChapterRateTableProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [dutiableOnly, setDutiableOnly] = useState(false);
  const [leafOnly, setLeafOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const shown = useMemo(() => visibleRows(rows, normalizedQuery, dutiableOnly, leafOnly), [rows, normalizedQuery, dutiableOnly, leafOnly]);

  const totalLines = useMemo(() => rows.filter((r) => r.htsCode10).length, [rows]);
  const dutiableLines = useMemo(() => rows.filter((r) => r.htsCode10 && r.dutiable).length, [rows]);
  const shownLines = shown.filter((r) => r.htsCode10).length;
  const showBreadcrumb = leafOnly || normalizedQuery.length > 0;

  return (
    <Stack gap="lg">
      <SearchField
        value={query}
        onChange={setQuery}
        label="Filter tariff lines by product name or HTS code"
        placeholder="Search by product name or HTS code"
        resultLabel={`${shownLines} of ${totalLines} tariff lines`}
        size="lg"
      />

      <Stack direction="row" gap="sm" wrap>
        <ToggleChip
          size="md"
          look="outline"
          label="Base rate above Free"
          active={dutiableOnly}
          onToggle={() => setDutiableOnly(!dutiableOnly)}
          count={dutiableLines}
        />
        <ToggleChip size="md" look="outline" label="10-digit lines only" active={leafOnly} onToggle={() => setLeafOnly(!leafOnly)} count={totalLines} />
      </Stack>

      <Text size="xs" tone="muted">
        {note}
      </Text>

      {shown.length === 0 ? (
        <InlineCard padding="cozy">
          <Text size="sm" tone="muted">
            No tariff line in this chapter matches “{query}”. Try a broader word, or search by HTS code.
          </Text>
        </InlineCard>
      ) : (
        <TableScroll pageSticky>
          <DataTable>
            <TableHead sticky look="plain">
              <TableRow>
                <TableHeaderCell>HTS code</TableHeaderCell>
                <TableHeaderCell width="wide">Description</TableHeaderCell>
                {/* Tap-to-explain labels (issue #1784): a `title=` tooltip doesn't open on phones. */}
                <TableHeaderCell>
                  <GlossaryTerm id="base-rate">Base rate</GlossaryTerm>
                </TableHeaderCell>
                <TableHeaderCell width="narrow">
                  <GlossaryTerm id="special-rate">With a trade deal</GlossaryTerm>
                </TableHeaderCell>
                <TableHeaderCell>
                  <Stack gap="xxs">
                    <span>
                      <GlossaryTerm id="column-2">Column 2</GlossaryTerm>
                    </span>
                    <Text as="span" size="xs" tone="muted" weight="normal">
                      Cuba, N. Korea, Russia, Belarus only
                    </Text>
                  </Stack>
                </TableHeaderCell>
                <TableHeaderCell>Unit</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {shown.map((row) => {
                const expandable = Boolean(row.htsCode10);
                const expanded = expandedId === row.id;
                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      id={row.indent === 0 && row.hts ? row.hts : undefined}
                      emphasis={row.isHeaderRow ? 'group' : 'normal'}
                      interactive={expandable}
                      onClick={expandable ? () => setExpandedId(expanded ? null : row.id) : undefined}
                    >
                      <TableCell variant="code" tone="primary">
                        {row.hts ?? <EmptyCellValue />}
                      </TableCell>
                      <TableCell>
                        <IndentedLabel indent={row.indent}>
                          <Stack gap="xxs">
                            {showBreadcrumb && row.ancestorPath.length > 0 && (
                              <Text size="xs" tone="muted">
                                {row.ancestorPath.join(' › ')}
                              </Text>
                            )}
                            <span>{row.description}</span>
                          </Stack>
                        </IndentedLabel>
                      </TableCell>
                      {/* Emphasize the dutiable lines, not the free ones: in most chapters
                          "Free" is the default and the duty is the thing to spot. */}
                      <TableCell variant="rate" tone={row.htsCode10 && row.dutiable ? 'emphasis' : 'body'}>
                        <RateValue value={row.effectiveGeneral} inheritedFrom={row.generalInheritedFrom} />
                      </TableCell>
                      <TableCell variant="rateWrap">
                        <PreferenceRateValue value={row.effectiveSpecial} inheritedFrom={row.specialInheritedFrom} />
                      </TableCell>
                      <TableCell variant="rate">
                        <RateValue value={row.effectiveColumn2} inheritedFrom={row.column2InheritedFrom} />
                      </TableCell>
                      <TableCell variant="rate" tone="muted">
                        {row.units.length > 0 ? row.units.join(', ') : <EmptyCellValue />}
                      </TableCell>
                    </TableRow>
                    {expanded && (
                      <TableRow>
                        <TableCell colSpan={6} colSpanFull>
                          <RowDetail row={row} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </DataTable>
        </TableScroll>
      )}
    </Stack>
  );
}
