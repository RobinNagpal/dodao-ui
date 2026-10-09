'use client';

import { MeasureSources } from '@/components/tariff-calculator/OfficialMeasuresFields';
import Text from '@/components/ui/Text';
import ToggleChip from '@/components/ui/ToggleChip';
import Stack from '@/components/ui/containers/Stack';
import type { TariffCompanyProgram, TariffConfirmationQuestion, TariffEndUse, TariffShipmentConfirmations } from '@/types/tariff-calculator-measures';
import React from 'react';

// "Do any of these apply to your goods?" (issue #1790): facts about the shipment the HTS line
// alone can't tell (end use, a named product, the manufacturer's company program, a U.S.-origin
// active ingredient) that decide whether a conditional exemption or company rate applies.
// Composed from leaves only.

/** True when the confirmations answer this question "yes". */
export function isConfirmed(q: TariffConfirmationQuestion, c: TariffShipmentConfirmations): boolean {
  switch (q.kind) {
    case 'endUse':
      return c.endUse === q.value;
    case 'companyProgram':
      return c.companyProgram === q.value;
    case 'productDescription':
      return (c.productDescriptionIds ?? []).includes(q.value);
    case 'usOriginIngredient':
      return c.usOriginIngredient === true;
  }
}

/** Sets one answer. End use and company program hold one value each, so "yes" to one end use (or company program) replaces another. */
export function setConfirmed(q: TariffConfirmationQuestion, c: TariffShipmentConfirmations, yes: boolean): TariffShipmentConfirmations {
  const next: TariffShipmentConfirmations = { ...c };
  if (q.kind === 'endUse') {
    if (yes) next.endUse = q.value as TariffEndUse;
    else if (next.endUse === q.value) delete next.endUse;
  } else if (q.kind === 'companyProgram') {
    if (yes) next.companyProgram = q.value as TariffCompanyProgram;
    else if (next.companyProgram === q.value) delete next.companyProgram;
  } else if (q.kind === 'usOriginIngredient') {
    if (yes) next.usOriginIngredient = true;
    else delete next.usOriginIngredient;
  } else {
    const ids = (next.productDescriptionIds ?? []).filter((id) => id !== q.value);
    if (yes) ids.push(q.value);
    if (ids.length > 0) next.productDescriptionIds = ids;
    else delete next.productDescriptionIds;
  }
  return next;
}

/** Only the answers to questions currently asked (a changed country or date can drop a question). */
export function confirmationsForQuestions(c: TariffShipmentConfirmations, questions: TariffConfirmationQuestion[]): TariffShipmentConfirmations {
  return questions.reduce<TariffShipmentConfirmations>((acc, q) => (isConfirmed(q, c) ? setConfirmed(q, acc, true) : acc), {});
}

interface ConfirmationQuestionsProps {
  questions: TariffConfirmationQuestion[];
  confirmations: TariffShipmentConfirmations;
  onChange: (next: TariffShipmentConfirmations) => void;
}

export default function ConfirmationQuestions({ questions, confirmations, onChange }: ConfirmationQuestionsProps): JSX.Element | null {
  if (questions.length === 0) return null;
  return (
    <Stack gap="md">
      <Stack gap="xxs">
        <Text size="xs" weight="medium" tone="muted">
          Do any of these apply to your goods?
        </Text>
        <Text size="xs" tone="muted">
          These depend on facts the HTS code can&apos;t tell us. Leave them at &quot;No&quot; unless you can prove the answer to CBP.
        </Text>
      </Stack>
      {questions.map((q) => {
        const yes = isConfirmed(q, confirmations);
        return (
          <Stack key={`${q.kind}-${q.value}`} gap="xs">
            <Text size="sm" weight="medium">
              {q.prompt}
            </Text>
            <Stack direction="row" gap="sm" wrap>
              <ToggleChip label="Yes" active={yes} onToggle={() => onChange(setConfirmed(q, confirmations, true))} />
              <ToggleChip label="No" active={!yes} onToggle={() => onChange(setConfirmed(q, confirmations, false))} />
            </Stack>
            <Text size="xs">If yes: {q.effect}</Text>
            {q.caveat && (
              <Text size="xs" tone="muted">
                {q.caveat}
              </Text>
            )}
            <MeasureSources sources={q.sources} />
          </Stack>
        );
      })}
    </Stack>
  );
}
