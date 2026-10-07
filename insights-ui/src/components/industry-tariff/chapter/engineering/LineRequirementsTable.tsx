'use client';

import Stack from '@/components/ui/containers/Stack';
import SearchField from '@/components/ui/SearchField';
import StatusBadge from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import InlineCard from '@/components/ui/sections/InlineCard';
import { DataTable, EmptyCellValue, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import type { TariffEngineeringLever, TariffEngineeringLine, TariffEngineeringRule } from '@/types/tariff-chapter-prototype';
import React, { useMemo, useState } from 'react';

// "The documents and rules required, per line" — Approach 2's core for this
// page. Every line is server-rendered; search only narrows the list.

interface LineRequirementsTableProps {
  lines: TariffEngineeringLine[];
  rules: TariffEngineeringRule[];
  levers: TariffEngineeringLever[];
}

export default function LineRequirementsTable({ lines, rules, levers }: LineRequirementsTableProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const ruleById = useMemo(() => new Map(rules.map((r) => [r.id, r])), [rules]);
  const leverById = useMemo(() => new Map(levers.map((l) => [l.id, l])), [levers]);

  const normalized = query.trim().toLowerCase();
  const digits = normalized.replace(/\D/g, '');
  const shown = useMemo(
    () => lines.filter((line) => !normalized || line.searchText.includes(normalized) || (digits.length > 0 && line.hts.replace(/\D/g, '').startsWith(digits))),
    [lines, normalized, digits]
  );

  return (
    <Stack gap="lg">
      <SearchField
        value={query}
        onChange={setQuery}
        label="Find the requirements for a tariff line"
        placeholder='What do I need for… "parrot", "cattle", "horse", or an HTS code'
        resultLabel={`${shown.length} of ${lines.length} lines`}
      />
      {shown.length === 0 ? (
        <InlineCard padding="cozy">
          <Text size="sm" tone="muted">
            No tariff line in this chapter matches “{query}”.
          </Text>
        </InlineCard>
      ) : (
        <TableScroll maxHeight="lg">
          <DataTable>
            <TableHead sticky>
              <TableRow>
                <TableHeaderCell>HTS code</TableHeaderCell>
                <TableHeaderCell width="wide">Description</TableHeaderCell>
                <TableHeaderCell>General rate</TableHeaderCell>
                <TableHeaderCell>Rules &amp; documents</TableHeaderCell>
                <TableHeaderCell>Ways to pay less</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {shown.map((line) => (
                <TableRow key={line.hts}>
                  <TableCell variant="code">{line.hts}</TableCell>
                  <TableCell>
                    <Stack gap="xxs">
                      {line.ancestorPath.length > 0 && (
                        <Text size="xs" tone="muted">
                          {line.ancestorPath.join(' › ')}
                        </Text>
                      )}
                      <span>{line.description}</span>
                    </Stack>
                  </TableCell>
                  <TableCell variant="rate">{line.general ?? <EmptyCellValue />}</TableCell>
                  <TableCell variant="rateWrap">
                    <Stack gap="xs">
                      {line.ruleIds.map((id) => {
                        const rule = ruleById.get(id);
                        return rule ? (
                          <Text key={id} as="span" size="xs">
                            {rule.agency}: {rule.citations.map((c) => c.label).join(', ')}
                          </Text>
                        ) : null;
                      })}
                    </Stack>
                  </TableCell>
                  <TableCell variant="rateWrap">
                    <Stack direction="row" gap="xs" wrap>
                      {line.leverIds.map((id) => {
                        const lever = leverById.get(id);
                        return lever ? <StatusBadge key={id} variant="success" size="sm" label={id === 'usmca' ? 'USMCA' : 'Purebred'} /> : null;
                      })}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </DataTable>
        </TableScroll>
      )}
    </Stack>
  );
}
