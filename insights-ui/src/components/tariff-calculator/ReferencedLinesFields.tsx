'use client';

import type { ReferencedLineResponse } from '@/app/api/tariff-calculator/referenced-line/[hts10]/route';
import NoticeCallout from '@/components/ui/NoticeCallout';
import Text from '@/components/ui/Text';
import TextButton from '@/components/ui/TextButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Stack from '@/components/ui/containers/Stack';
import type { TariffShipmentConfirmations } from '@/types/tariff-calculator-measures';
import { describeUom } from '@/utils/tariff-calculator/duty-engine';
import type { BaseRateReferenceInput } from '@/utils/tariff-calculator/measures-engine';
import React, { useEffect, useState } from 'react';

// Referenced lines (issue #1812): some HTS base rates are another article's rate — "The rate applicable to the article
// of which it is a part or accessory", "… to that article in the set subject to the highest rate of duty", "… to the
// complete, assembled movement" (one line, charged on the whole shipment value), or "… to each garment in the ensemble
// if separately entered" / "… to each article in the absence of this subheading" (one line per article, each on its own
// value). Embroidery in the piece (chapter 58) and movement parts with a plate (9110.90.40 / 9114.90.30) are bounded
// by another line's duty only when the importer answers yes to the condition question. The importer names the line(s)
// here; the form shows each line's rate and asks the quantities its per-unit rate needs. Composed from leaves only.

/** One referenced line as typed. */
export interface ReferencedLineDraft {
  hts: string;
  /** Article-by-article sets only: the value of the articles under this line. */
  value: string;
  quantities: Record<string, string>;
}

/** The request body's `referencedLines`. */
export interface ReferencedLineInput {
  hts10: string;
  valueUsd?: number;
  unitsOfMeasure?: Record<string, number>;
}

const EMPTY_ROW: ReferencedLineDraft = { hts: '', value: '', quantities: {} };

function digits(s: string): string {
  return s.replace(/\D/g, '');
}

/** The reference the form asks about now: the line's first, hidden while its condition question isn't answered yes. */
export function activeReference(inputs: BaseRateReferenceInput[], confirmations: TariffShipmentConfirmations): BaseRateReferenceInput | null {
  const ref = inputs[0];
  if (!ref) return null;
  if (ref.conditionFact && confirmations.facts?.[ref.conditionFact] !== true) return null;
  return ref;
}

/** The typed rows as the calculate API takes them (rows without a 10-digit code left out); undefined when none is asked. */
export function referencedLinesForInput(
  drafts: ReferencedLineDraft[],
  inputs: BaseRateReferenceInput[],
  confirmations: TariffShipmentConfirmations
): ReferencedLineInput[] | undefined {
  const ref = activeReference(inputs, confirmations);
  if (!ref) return undefined;
  const out: ReferencedLineInput[] = [];
  for (const d of drafts) {
    const hts10 = digits(d.hts);
    if (hts10.length !== 10) continue;
    const line: ReferencedLineInput = { hts10 };
    const value = Number(d.value);
    if (ref.kind === 'each' && d.value.trim() !== '' && Number.isFinite(value) && value > 0) line.valueUsd = value;
    const units: Record<string, number> = {};
    for (const [uom, raw] of Object.entries(d.quantities)) {
      const n = Number(raw);
      if (raw.trim() !== '' && Number.isFinite(n) && n >= 0) units[uom] = n;
    }
    if (Object.keys(units).length > 0) line.unitsOfMeasure = units;
    out.push(line);
  }
  return out.length > 0 ? out : undefined;
}

type Lookup = { status: 'loading' } | { status: 'ok'; data: ReferencedLineResponse } | { status: 'error'; message: string };

/** Rates of the 10-digit codes typed so far, fetched once per code. */
function useReferencedLineRates(codes: string[]): Record<string, Lookup> {
  const [lookups, setLookups] = useState<Record<string, Lookup>>({});
  const key = codes.join(',');
  useEffect(() => {
    for (const code of key.split(',').filter(Boolean)) {
      if (lookups[code]) continue;
      setLookups((prev) => ({ ...prev, [code]: { status: 'loading' } }));
      fetch(`/api/tariff-calculator/referenced-line/${code}`)
        .then(async (res) => {
          if (!res.ok) {
            const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
            throw new Error(payload.error ?? payload.message ?? `HTS code ${code} was not found.`);
          }
          return (await res.json()) as ReferencedLineResponse;
        })
        .then((data) => setLookups((prev) => ({ ...prev, [code]: { status: 'ok', data } })))
        .catch((err: unknown) =>
          setLookups((prev) => ({ ...prev, [code]: { status: 'error', message: err instanceof Error ? err.message : 'Lookup failed' } }))
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch only codes not looked up yet
  }, [key]);
  return lookups;
}

interface ReferencedLinesFieldsProps {
  inputs: BaseRateReferenceInput[];
  confirmations: TariffShipmentConfirmations;
  values: ReferencedLineDraft[];
  onChange: (next: ReferencedLineDraft[]) => void;
}

export default function ReferencedLinesFields({ inputs, confirmations, values, onChange }: ReferencedLinesFieldsProps): JSX.Element | null {
  const ref = activeReference(inputs, confirmations);
  const rows = values.length > 0 ? values : [EMPTY_ROW];
  const lookups = useReferencedLineRates(rows.map((r) => digits(r.hts)).filter((c) => c.length === 10));
  if (!ref) return null;
  const multi = ref.kind === 'each';
  const setRow = (i: number, row: ReferencedLineDraft): void => onChange(rows.map((r, j) => (j === i ? row : r)));

  return (
    <Stack gap="md">
      <Stack gap="xxs">
        <Text size="xs" weight="medium" tone="muted">
          {ref.prompt}
        </Text>
        <Text size="xs" tone="muted">
          This line&apos;s rate is “{ref.rateTexts.join('; ')}”. {ref.help}
        </Text>
      </Stack>
      {rows.map((row, i) => {
        const code = digits(row.hts);
        const lookup = code.length === 10 ? lookups[code] : undefined;
        return (
          <Stack key={i} gap="sm">
            <Stack gap="xs">
              <Label htmlFor={`referenced-hts-${i}`}>{multi ? `Article ${i + 1}: HTS code (10 digits)` : 'HTS code (10 digits)'}</Label>
              <Input
                id={`referenced-hts-${i}`}
                inputMode="numeric"
                placeholder="e.g. 6103.42.10.40"
                value={row.hts}
                onChange={(e) => setRow(i, { ...row, hts: e.target.value })}
              />
              {lookup?.status === 'loading' && (
                <Text size="xs" tone="muted">
                  Looking up the rate…
                </Text>
              )}
              {lookup?.status === 'ok' && (
                <Text size="xs" tone="muted">
                  Rate: {lookup.data.general ?? '—'}
                  {lookup.data.column2 ? ` (column 2: ${lookup.data.column2})` : ''}
                </Text>
              )}
              {lookup?.status === 'error' && <NoticeCallout tone="warning">{lookup.message}</NoticeCallout>}
            </Stack>
            {multi && (
              <Stack gap="xs">
                <Label htmlFor={`referenced-value-${i}`}>Value of these articles (USD)</Label>
                <Input
                  id={`referenced-value-${i}`}
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={row.value}
                  onChange={(e) => setRow(i, { ...row, value: e.target.value })}
                />
              </Stack>
            )}
            {lookup?.status === 'ok' &&
              lookup.data.perUnit.map((u) => (
                <Stack key={u.uom} gap="xs">
                  <Label htmlFor={`referenced-qty-${i}-${u.uom}`}>Quantity for this line: {describeUom(u.uom)}</Label>
                  <Input
                    id={`referenced-qty-${i}-${u.uom}`}
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={row.quantities[u.uom] ?? ''}
                    onChange={(e) => setRow(i, { ...row, quantities: { ...row.quantities, [u.uom]: e.target.value } })}
                  />
                </Stack>
              ))}
            {multi && rows.length > 1 && (
              <TextButton size="xs" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
                Remove this article
              </TextButton>
            )}
          </Stack>
        );
      })}
      {multi && (
        <TextButton size="xs" onClick={() => onChange([...rows, EMPTY_ROW])}>
          Add another article
        </TextButton>
      )}
    </Stack>
  );
}
