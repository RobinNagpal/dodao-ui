'use client';

import { MeasureSources } from '@/components/tariff-calculator/OfficialMeasuresFields';
import Text from '@/components/ui/Text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Stack from '@/components/ui/containers/Stack';
import type { MeasureEngineInput } from '@/types/tariff-calculator-measures';
import type { TariffContentInput, TariffContentInputKind } from '@/utils/tariff-calculator/measures-engine';
import React from 'react';

// Content values (issue #1796): some extra duties on a line are charged only on part of the
// customs value — Section 232 steel / aluminum / copper derivatives on the metal content
// (notes 16 / 19), Section 232 autos/parts for USMCA-qualifying goods on the non-U.S. content
// (note 33). The importer declares those values here. Composed from leaves only.

/** Raw input text per content kind, as typed. */
export type ContentValueDrafts = Partial<Record<TariffContentInputKind, string>>;

/** Deep-link parameter for each content kind: ?steel=&aluminum=&copper=&uscontent=. */
export const CONTENT_DEEP_LINK_PARAMS: Record<TariffContentInputKind, string> = {
  steel: 'steel',
  aluminum: 'aluminum',
  copper: 'copper',
  usContent: 'uscontent',
};

/** The typed values for the inputs currently asked, as numbers (blank / invalid ones left out); undefined when none. */
export function contentValuesForInputs(drafts: ContentValueDrafts, inputs: TariffContentInput[]): MeasureEngineInput['contentValuesUsd'] {
  const out: NonNullable<MeasureEngineInput['contentValuesUsd']> = {};
  for (const i of inputs) {
    const raw = drafts[i.kind];
    const n = raw === undefined ? NaN : Number(raw);
    if (raw !== undefined && raw.trim() !== '' && Number.isFinite(n) && n >= 0) out[i.kind] = n;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

interface ContentValueFieldsProps {
  inputs: TariffContentInput[];
  values: ContentValueDrafts;
  onChange: (next: ContentValueDrafts) => void;
}

export default function ContentValueFields({ inputs, values, onChange }: ContentValueFieldsProps): JSX.Element | null {
  if (inputs.length === 0) return null;
  return (
    <Stack gap="md">
      <Stack gap="xxs">
        <Text size="xs" weight="medium" tone="muted">
          Content values
        </Text>
        <Text size="xs" tone="muted">
          Some extra duties on this line are charged only on part of the shipment value. Enter the value from the importer&apos;s records (it can&apos;t be more
          than the shipment value).
        </Text>
      </Stack>
      {inputs.map((i) => (
        <Stack key={i.kind} gap="xs">
          <Label htmlFor={`content-${i.kind}`}>{i.label}</Label>
          <Input
            id={`content-${i.kind}`}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={values[i.kind] ?? ''}
            onChange={(e) => onChange({ ...values, [i.kind]: e.target.value })}
          />
          <Text size="xs" tone="muted">
            {i.explanation} Applies to {i.ch99Codes.join(', ')}.
          </Text>
          <MeasureSources sources={i.sources} />
        </Stack>
      ))}
    </Stack>
  );
}
