'use client';

import Text from '@/components/ui/Text';
import ToggleChip from '@/components/ui/ToggleChip';
import ShowAt from '@/components/ui/containers/ShowAt';
import Stack from '@/components/ui/containers/Stack';
import DetailModal from '@/components/ui/sections/DetailModal';
import { DataTable, MatrixCellButton, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import React, { useState } from 'react';

/**
 * A row × group matrix whose cells open a detail view — the tariff "rate by country and product
 * group" matrices, import and export. The caller owns the selection and renders the detail; this
 * leaf owns the two layouts and the modal the detail opens in:
 *
 * - Desktop: a table with plain selectable cells.
 * - Phones: a wide matrix would show one column at a time, so it becomes a list — pick a group with
 *   the chips, then each row is one tappable item.
 *
 * Selecting a cell (or list item) opens its detail in a modal, so the matrix itself never shifts;
 * the selected cell stays highlighted behind the modal and after it closes.
 */

export interface MatrixGroup {
  /** Stable key, shown as an HTS code under the label (e.g. "3002"). */
  key: string;
  label: string;
  shortLabel: string;
}

export interface MatrixRow {
  key: string;
  name: string;
  /** Muted line under the name, e.g. "$42.61B in 2025". */
  sub?: string;
  /** A summary row (e.g. "Any other country"), drawn as a group row. */
  floor?: boolean;
}

export interface MatrixCellValue {
  value: string;
  emphasis: 'quiet' | 'normal' | 'high';
  /** Muted second line, e.g. the trade value in this cell. */
  secondary?: string;
  dim?: boolean;
}

export interface MatrixSelection {
  row: string;
  group: string;
}

interface SelectableMatrixProps {
  /** Header of the row-label column, e.g. "Country of origin". */
  rowHeader: string;
  groups: MatrixGroup[];
  rows: MatrixRow[];
  cell: (row: MatrixRow, group: MatrixGroup) => MatrixCellValue;
  /** Accessible name for a cell, e.g. "Biologics from Ireland". */
  cellLabel: (row: MatrixRow, group: MatrixGroup) => string;
  selected: MatrixSelection;
  onSelect: (selection: MatrixSelection) => void;
  /** Modal title for the selected cell, e.g. "Ireland · 3002 Blood, antisera…". */
  detailTitle: string;
  /** Detail view for the selected cell, shown in the modal. */
  detail: React.ReactNode;
}

export default function SelectableMatrix({
  rowHeader,
  groups,
  rows,
  cell,
  cellLabel,
  selected,
  onSelect,
  detailTitle,
  detail,
}: SelectableMatrixProps): React.JSX.Element {
  const [detailOpen, setDetailOpen] = useState(false);
  const selectedGroup = groups.find((g) => g.key === selected.group) ?? groups[0];

  const openDetail = (selection: MatrixSelection): void => {
    onSelect(selection);
    setDetailOpen(true);
  };

  return (
    <>
      <ShowAt range="lg-up">
        <TableScroll>
          <DataTable>
            <TableHead look="plain">
              <TableRow>
                <TableHeaderCell pinned>{rowHeader}</TableHeaderCell>
                {groups.map((g) => (
                  <TableHeaderCell key={g.key} title={g.label}>
                    <Stack gap="xxs">
                      <span>{g.shortLabel}</span>
                      <Text as="span" size="xs" tone="primary" font="mono">
                        {g.key}
                      </Text>
                    </Stack>
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <tbody>
              {rows.map((row) => (
                <TableRow key={row.key} emphasis={row.floor ? 'group' : 'normal'}>
                  <TableCell pinned>
                    <Stack gap="xxs">
                      <Text as="span" weight="semibold" tone="white">
                        {row.name}
                      </Text>
                      {row.sub && (
                        <Text as="span" size="xs" tone="muted">
                          {row.sub}
                        </Text>
                      )}
                    </Stack>
                  </TableCell>
                  {groups.map((g) => {
                    const value = cell(row, g);
                    return (
                      <TableCell key={g.key}>
                        <MatrixCellButton
                          label={cellLabel(row, g)}
                          primary={value.value}
                          emphasis={value.emphasis}
                          secondary={value.secondary}
                          dim={value.dim}
                          selected={selected.row === row.key && selected.group === g.key}
                          onSelect={() => openDetail({ row: row.key, group: g.key })}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </tbody>
          </DataTable>
        </TableScroll>
      </ShowAt>

      <ShowAt range="below-lg">
        <Stack gap="md">
          <Stack direction="row" gap="sm" wrap>
            {groups.map((g) => (
              <ToggleChip
                key={g.key}
                label={g.shortLabel}
                active={g.key === selectedGroup?.key}
                onToggle={() => onSelect({ row: selected.row, group: g.key })}
              />
            ))}
          </Stack>
          {selectedGroup && (
            <Stack gap="xs">
              {rows.map((row) => {
                const value = cell(row, selectedGroup);
                const isSelected = selected.row === row.key && selected.group === selectedGroup.key;
                return (
                  <MatrixCellButton
                    key={row.key}
                    label={cellLabel(row, selectedGroup)}
                    name={row.name}
                    primary={value.value}
                    emphasis={value.emphasis}
                    secondary={value.secondary ? `${value.secondary} in ${selectedGroup.shortLabel.toLowerCase()}` : row.sub}
                    dim={value.dim}
                    selected={isSelected}
                    onSelect={() => openDetail({ row: row.key, group: selectedGroup.key })}
                  />
                );
              })}
            </Stack>
          )}
        </Stack>
      </ShowAt>

      <DetailModal open={detailOpen} onClose={() => setDetailOpen(false)} title={detailTitle}>
        {detail}
      </DetailModal>
    </>
  );
}
