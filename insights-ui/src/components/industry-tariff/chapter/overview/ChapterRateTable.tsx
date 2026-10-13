'use client';

import GlossaryTerm from '@/components/industry-tariff/chapter/GlossaryTerm';
import DefinitionList from '@/components/ui/DefinitionList';
import ShowAt from '@/components/ui/containers/ShowAt';
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
import { StackedRow, StackedRowList, StackedRowListHeader } from '@/components/ui/tables/StackedRowList';
import TextButton from '@/components/ui/TextButton';
import { StackedRowGroup, TableRowGroup } from '@/components/ui/tables/RowGroup';
import type { TariffProductGroup, TariffRateTableRow } from '@/types/tariff-chapter-prototype';
import { EXPAND_ALL_MAX_LINES, groupRowsByHeading, parseRateTableAnchor } from '@/utils/tariff-reports/rate-table-groups';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// The chapter rate table: Approach 2's overview job — "the complete, searchable
// rate table: general, FTA and Column 2 rates plus additional duties,
// filterable by product name" (issue #1770).
//
// The lines are grouped into an accordion of 4-digit headings (issue #1819):
// large chapters open as a map of their headings, small ones fully expanded.
// This is a client component so the search box, toggles and headings work.
// Next still server-renders the full row set into the HTML — a collapsed
// heading only hides its rows (`hidden`), it doesn't drop them — so every line
// and description stays crawlable.

interface ChapterRateTableProps {
  rows: TariffRateTableRow[];
  /** Short names and rate summaries for the 4-digit headings the table is grouped by. */
  productGroups: TariffProductGroup[];
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
        <TextLink href={calculatorHref(row)} size="xs">
          Work out the landed cost in the duty calculator →
        </TextLink>
      </Stack>
    </InlineCard>
  );
}

function calculatorHref(row: TariffRateTableRow): string {
  return row.htsCode10 ? `/tariff-calculator?hts=${row.htsCode10}` : '/tariff-calculator';
}

/**
 * Phone detail for a line: the columns the phone list leaves out (trade-deal rate, Column 2,
 * unit) as labelled fields, plus quota, additional duties and the calculator link.
 */
function PhoneRowDetail({ row }: { row: TariffRateTableRow }): React.JSX.Element {
  const fields = [
    {
      term: <GlossaryTerm id="special-rate">With a trade deal</GlossaryTerm>,
      // A space after each comma lets "Free (A+,AU,BH,…)" wrap instead of running off a phone screen.
      definition: <RateValue value={row.effectiveSpecial?.replace(/,(?=\S)/g, ', ') ?? null} inheritedFrom={row.specialInheritedFrom} />,
    },
    {
      term: <GlossaryTerm id="column-2">Column 2</GlossaryTerm>,
      definition: (
        <Stack gap="xxs">
          <RateValue value={row.effectiveColumn2} inheritedFrom={row.column2InheritedFrom} />
          <Text as="span" size="xs" tone="muted">
            Cuba, N. Korea, Russia, Belarus only
          </Text>
        </Stack>
      ),
    },
    { term: 'Unit', definition: row.units.length > 0 ? row.units.join(', ') : <EmptyCellValue /> },
    ...(row.quotaQuantity ? [{ term: 'Quota', definition: row.quotaQuantity }] : []),
    ...(row.additionalDuties ? [{ term: 'Additional duties', definition: row.additionalDuties }] : []),
  ];

  return (
    <InlineCard padding="cozy">
      <Stack gap="md">
        {row.ancestorPath.length > 0 && (
          <Text size="xs" tone="muted">
            {[...row.ancestorPath, row.description].join(' › ')}
          </Text>
        )}
        <DefinitionList look="fields" columns="1" items={fields} />
        <TextLink href={calculatorHref(row)} size="sm" wrap>
          Work out the landed cost in the duty calculator →
        </TextLink>
      </Stack>
    </InlineCard>
  );
}

const COLUMN_COUNT = 6;

function pluralize(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** The first of these elements that is on screen — the desktop table and the phone list both carry an anchor. */
function visibleElement(ids: string[]): HTMLElement | null {
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element && element.getClientRects().length > 0) return element;
  }
  return null;
}

interface RowProps {
  row: TariffRateTableRow;
  expanded: boolean;
  onToggle: (() => void) | undefined;
  showBreadcrumb: boolean;
}

function DesktopRow({ row, expanded, onToggle, showBreadcrumb }: RowProps): React.JSX.Element {
  return (
    <>
      <TableRow
        // `#0102.29.40.54` lands on the line (the hash handler opens its heading first).
        id={row.hts ?? undefined}
        emphasis={row.isHeaderRow ? 'group' : 'normal'}
        interactive={Boolean(onToggle)}
        onClick={onToggle}
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
          <TableCell colSpan={COLUMN_COUNT} colSpanFull>
            <RowDetail row={row} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function PhoneRow({ row, expanded, onToggle, showBreadcrumb }: RowProps): React.JSX.Element {
  return (
    <StackedRow
      id={`phone-${row.hts ?? row.id}`}
      code={row.hts}
      label={
        <Stack gap="xxs">
          {/* Only when the parent headings are filtered out; a search keeps them as rows above. */}
          {showBreadcrumb && row.ancestorPath.length > 0 && (
            <Text as="span" size="xs" tone="muted">
              {row.ancestorPath.join(' › ')}
            </Text>
          )}
          <span>{row.description}</span>
        </Stack>
      }
      value={row.effectiveGeneral ? <RateValue value={row.effectiveGeneral} inheritedFrom={row.generalInheritedFrom} /> : undefined}
      tone={row.htsCode10 && row.dutiable ? 'emphasis' : 'body'}
      indent={row.indent}
      emphasis={row.isHeaderRow ? 'group' : 'normal'}
      expanded={expanded}
      onToggle={onToggle}
      detail={<PhoneRowDetail row={row} />}
    />
  );
}

export default function ChapterRateTable({ rows, productGroups, note }: ChapterRateTableProps): React.JSX.Element {
  const groups = useMemo(() => groupRowsByHeading(rows, productGroups), [rows, productGroups]);
  const totalLines = useMemo(() => rows.filter((r) => r.htsCode10).length, [rows]);
  const dutiableLines = useMemo(() => rows.filter((r) => r.htsCode10 && r.dutiable).length, [rows]);

  const [query, setQuery] = useState('');
  const [dutiableOnly, setDutiableOnly] = useState(false);
  const [leafOnly, setLeafOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Headings the reader has opened. A small chapter starts fully open; a large one starts as a map of its headings.
  const [openHeadings, setOpenHeadings] = useState<Set<string>>(() => (totalLines <= EXPAND_ALL_MAX_LINES ? new Set(groups.map((g) => g.heading)) : new Set()));
  // While searching, every heading with a match is open except the ones closed during this search;
  // `openHeadings` is left alone, so clearing the search restores what was open before.
  const [closedWhileSearching, setClosedWhileSearching] = useState<Set<string>>(() => new Set());
  const [scrollTarget, setScrollTarget] = useState<{ ids: string[]; line: boolean } | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const searching = normalizedQuery.length > 0;
  const filtering = searching || dutiableOnly;
  const shown = useMemo(() => visibleRows(rows, normalizedQuery, dutiableOnly, leafOnly), [rows, normalizedQuery, dutiableOnly, leafOnly]);
  const shownGroups = useMemo(() => {
    const keep = new Set(shown.map((row) => row.id));
    return groups
      .map((group) => {
        const groupRows = group.rows.filter((row) => keep.has(row.id));
        return { ...group, rows: groupRows, shownLines: groupRows.filter((row) => row.htsCode10).length };
      })
      .filter((group) => group.rows.length > 0);
  }, [groups, shown]);

  const shownLines = shown.filter((r) => r.htsCode10).length;
  const showBreadcrumb = leafOnly || searching;

  const isOpen = (heading: string): boolean => (searching ? !closedWhileSearching.has(heading) : openHeadings.has(heading));
  const allOpen = shownGroups.every((group) => isOpen(group.heading));
  const noneOpen = shownGroups.every((group) => !isOpen(group.heading));

  const toggleIn = (set: Set<string>, heading: string): Set<string> => {
    const next = new Set(set);
    if (next.has(heading)) next.delete(heading);
    else next.add(heading);
    return next;
  };
  const toggleHeading = (heading: string): void => {
    if (searching) setClosedWhileSearching((closed) => toggleIn(closed, heading));
    else setOpenHeadings((open) => toggleIn(open, heading));
  };
  const setAll = (open: boolean): void => {
    const all = new Set(groups.map((g) => g.heading));
    if (searching) setClosedWhileSearching(open ? new Set() : all);
    else setOpenHeadings(open ? all : new Set());
  };
  const changeQuery = (value: string): void => {
    setQuery(value);
    setClosedWhileSearching(new Set());
  };

  // Deep links: `#0102` opens and scrolls to the heading; `#0102.29.40.54` (or `#0102294054`) also
  // scrolls to the line. Filters that would hide the target are cleared.
  const openAnchor = useCallback(
    (hash: string): void => {
      const target = parseRateTableAnchor(hash, groups);
      if (!target) return;
      setQuery('');
      setClosedWhileSearching(new Set());
      setDutiableOnly(false);
      setOpenHeadings((open) => (open.has(target.heading) ? open : new Set(open).add(target.heading)));
      const anchor = target.row?.hts ?? target.heading;
      setScrollTarget({ ids: [anchor, `phone-${anchor}`], line: Boolean(target.row) });
    },
    [groups]
  );

  useEffect(() => {
    openAnchor(window.location.hash);
    const onHashChange = (): void => openAnchor(window.location.hash);
    // An in-page `<Link href="#0102">` (e.g. from the chapter's other sections) updates the URL with pushState, which
    // fires no hashchange, so same-page anchor clicks are handled here too.
    const onClick = (event: MouseEvent): void => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href*="#"]') : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href);
      if (url.pathname === window.location.pathname && url.hash) openAnchor(url.hash);
    };
    window.addEventListener('hashchange', onHashChange);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      document.removeEventListener('click', onClick);
    };
  }, [openAnchor]);

  // Scroll once the heading is open, so a line inside it has a position to scroll to.
  useEffect(() => {
    if (!scrollTarget) return;
    const element = visibleElement(scrollTarget.ids);
    setScrollTarget(null);
    if (!element) return;
    element.scrollIntoView({ block: scrollTarget.line ? 'center' : 'start' });
    if (!scrollTarget.line) element.querySelector('button')?.focus({ preventScroll: true });
  }, [scrollTarget]);

  const toggleProps = (group: (typeof shownGroups)[number]) => ({
    code: group.heading,
    title: group.label,
    // The official wording, when the short label is a paraphrase of it.
    description: group.description.toLowerCase() === group.label.toLowerCase() ? undefined : group.description,
    body: group.blurb || undefined,
    value: group.rateSummary,
    valueNote: group.dutiableLineCount > 0 ? `${group.dutiableLineCount} with a base-rate duty` : undefined,
    aside: searching
      ? pluralize(group.shownLines, 'match', 'matches')
      : filtering
      ? `${group.shownLines} of ${pluralize(group.lineCount, 'line', 'lines')}`
      : pluralize(group.lineCount, 'line', 'lines'),
    expanded: isOpen(group.heading),
    onToggle: () => toggleHeading(group.heading),
  });

  const rowToggle = (row: TariffRateTableRow, expandable: boolean): (() => void) | undefined =>
    expandable ? () => setExpandedId(expandedId === row.id ? null : row.id) : undefined;

  return (
    <Stack gap="lg">
      <SearchField
        value={query}
        onChange={changeQuery}
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

      {shownGroups.length === 0 ? (
        <InlineCard padding="cozy">
          <Text size="sm" tone="muted">
            No tariff line in this chapter matches “{query}”. Try a broader word, or search by HTS code.
          </Text>
        </InlineCard>
      ) : (
        <>
          <Stack direction="row" gap="md" align="center" justify="between" wrap>
            <Text size="sm" tone="muted">
              {filtering
                ? `${shownGroups.length} of ${pluralize(groups.length, 'heading', 'headings')} ${searching ? 'match' : 'shown'}`
                : pluralize(groups.length, 'heading', 'headings')}
            </Text>
            <Stack direction="row" gap="lg">
              <TextButton onClick={() => setAll(true)} disabled={allOpen}>
                Expand all
              </TextButton>
              <TextButton onClick={() => setAll(false)} disabled={noneOpen}>
                Collapse all
              </TextButton>
            </Stack>
          </Stack>

          <ShowAt range="lg-up">
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
                {/* One group per 4-digit heading. Collapsed groups keep their rows in the HTML (hidden), so every line is crawlable. */}
                {shownGroups.map((group) => (
                  <TableRowGroup key={group.heading} id={group.heading} colSpan={COLUMN_COUNT} {...toggleProps(group)}>
                    {group.rows.map((row) => (
                      <DesktopRow
                        key={row.id}
                        row={row}
                        expanded={expandedId === row.id}
                        onToggle={rowToggle(row, Boolean(row.htsCode10))}
                        showBreadcrumb={showBreadcrumb}
                      />
                    ))}
                  </TableRowGroup>
                ))}
              </DataTable>
            </TableScroll>
          </ShowAt>

          {/* Phones: six columns would show two at a time, so each line becomes a list item with its
              code, base rate and full description; the other columns open with a tap. */}
          <ShowAt range="below-lg">
            <StackedRowList header={<StackedRowListHeader label="HTS code and product" value={<GlossaryTerm id="base-rate">Base rate</GlossaryTerm>} />}>
              {shownGroups.map((group) => (
                <StackedRowGroup key={group.heading} id={`phone-${group.heading}`} {...toggleProps(group)}>
                  {group.rows.map((row) => (
                    <PhoneRow
                      key={row.id}
                      row={row}
                      expanded={expandedId === row.id}
                      // Every line with a code and a rate opens, including 8-digit lines, since the list has
                      // no other place to show their trade-deal and Column 2 rates.
                      onToggle={rowToggle(row, Boolean(row.hts && row.effectiveGeneral))}
                      showBreadcrumb={leafOnly}
                    />
                  ))}
                </StackedRowGroup>
              ))}
            </StackedRowList>
          </ShowAt>
        </>
      )}
    </Stack>
  );
}
