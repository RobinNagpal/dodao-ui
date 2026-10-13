'use client';

import Text from '@/components/ui/Text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Stack from '@/components/ui/containers/Stack';
import { FULL_POLARITY_DEGREES, formatPolarityRate, isValidPolarity } from '@/utils/tariff-reports/shipment-duty';
import React from 'react';

// Sugar polarity: raw cane and beet sugar of heading 1701 pays a per-kg rate that falls for each degree of polarity
// (the sucrose reading of the polariscope test) under 100°, down to a minimum. The importer enters the polarity from
// the sugar's test certificate; left blank, the calculator prices at 100°, the highest the rate can be, and says so.
// Composed from leaves only.

/** The typed polarity as a number of degrees; undefined when blank or not a usable value. */
export function polarityForInput(draft: string, polarityRates: string[]): number | undefined {
  if (polarityRates.length === 0 || draft.trim() === '') return undefined;
  const n = Number(draft);
  return isValidPolarity(n) ? n : undefined;
}

interface PolarityFieldProps {
  /** The line's rates graded by polarity; nothing is shown when empty. */
  polarityRates: string[];
  value: string;
  onChange: (next: string) => void;
}

export default function PolarityField({ polarityRates, value, onChange }: PolarityFieldProps): JSX.Element | null {
  if (polarityRates.length === 0) return null;
  return (
    <Stack gap="xs">
      <Label htmlFor="sugar-polarity">Sugar polarity (degrees)</Label>
      <Input
        id="sugar-polarity"
        type="number"
        min="0"
        max={String(FULL_POLARITY_DEGREES)}
        step="any"
        inputMode="decimal"
        placeholder="e.g. 96"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Text size="xs" tone="muted">
        This line&apos;s rate falls for each degree of polarity under 100 ({polarityRates.map((r) => formatPolarityRate(r) ?? r).join('; ')}). Enter the
        polarity from the sugar&apos;s polariscope test; left blank, the duty is priced at 100°, the highest it can be.
      </Text>
    </Stack>
  );
}
