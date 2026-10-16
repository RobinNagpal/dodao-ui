'use client';

import Text from '@/components/ui/Text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Stack from '@/components/ui/containers/Stack';
import type { BaseRateComponentInput } from '@/utils/tariff-calculator/measures-engine';
import React from 'react';

// Component values (issue #1812): some HTS base rates are charged on the value of a part of the goods, not the whole
// customs value — "2.5% on the value of the lead content" (7801), "4.7% on the value of the rifle + 20% on the value of
// the telescopic sight, if any" (9301 / 9303), "5.3% on the battery" (watches and movements). The importer declares
// those values here; a missing one is a "Value required" error, never $0. Composed from leaves only.

/** Raw input text per component ("lead content" → "9000"), as typed. */
export type RateComponentDrafts = Record<string, string>;

/** The typed values for the components currently asked, as numbers (blank / invalid ones left out); undefined when none. */
export function componentValuesForInputs(drafts: RateComponentDrafts, inputs: BaseRateComponentInput[]): Record<string, number> | undefined {
  const out: Record<string, number> = {};
  for (const i of inputs) {
    const raw = drafts[i.component];
    const n = raw === undefined ? NaN : Number(raw);
    if (raw !== undefined && raw.trim() !== '' && Number.isFinite(n) && n >= 0) out[i.component] = n;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

interface RateComponentFieldsProps {
  inputs: BaseRateComponentInput[];
  values: RateComponentDrafts;
  onChange: (next: RateComponentDrafts) => void;
}

function fieldId(component: string): string {
  return `rate-component-${component.replace(/[^a-z]+/g, '-')}`;
}

export default function RateComponentFields({ inputs, values, onChange }: RateComponentFieldsProps): JSX.Element | null {
  if (inputs.length === 0) return null;
  return (
    <Stack gap="md">
      <Stack gap="xxs">
        <Text size="xs" weight="medium" tone="muted">
          Values the base rate is charged on
        </Text>
        <Text size="xs" tone="muted">
          This line&apos;s rate ({Array.from(new Set(inputs.flatMap((i) => i.rateTexts))).join('; ')}) is charged on the value of part of the goods. Enter each
          value from the commercial invoice (together they can&apos;t be more than the shipment value).
        </Text>
      </Stack>
      {inputs.map((i) => (
        <Stack key={i.component} gap="xs">
          <Label htmlFor={fieldId(i.component)}>{i.label}</Label>
          <Input
            id={fieldId(i.component)}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={values[i.component] ?? ''}
            onChange={(e) => onChange({ ...values, [i.component]: e.target.value })}
          />
        </Stack>
      ))}
    </Stack>
  );
}
