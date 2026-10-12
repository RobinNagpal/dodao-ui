'use client';

import { MeasureSources } from '@/components/tariff-calculator/OfficialMeasuresFields';
import NoticeCallout from '@/components/ui/NoticeCallout';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import type { TariffImportProhibition } from '@/types/tariff-calculator-measures';
import React from 'react';

// "Import prohibited" (issue #1796): an import ban (import-bans.json) covers the line, country and
// entry date. Shown above the result instead of letting a duty read as "you can import this".
// Composed from leaves only.

function formatDay(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default function ImportProhibitedNotice({ prohibition }: { prohibition: TariffImportProhibition }): JSX.Element {
  const conditional = prohibition.unconfirmed && prohibition.unconfirmed.length > 0;
  return (
    <NoticeCallout tone="danger">
      <Stack gap="xs">
        <Text size="base" weight="bold" tone="inherit">
          {conditional ? 'Import may be prohibited' : 'Import prohibited'}
        </Text>
        <Text size="sm" tone="inherit">
          {prohibition.reason} Banned for goods imported on or after {formatDay(prohibition.effectiveFrom)}.
        </Text>
        {conditional &&
          prohibition.unconfirmed?.map((u) => (
            <Text key={u.factId} size="sm" tone="inherit">
              Banned if the answer is &quot;{u.bannedWhen ? 'yes' : 'no'}&quot; to: {u.prompt} Answer it under &quot;Do any of these apply to your goods?&quot;.
            </Text>
          ))}
        {prohibition.dutyNote && (
          <Text size="xs" tone="inherit">
            {prohibition.dutyNote}
          </Text>
        )}
        <MeasureSources sources={prohibition.sources} />
      </Stack>
    </NoticeCallout>
  );
}
