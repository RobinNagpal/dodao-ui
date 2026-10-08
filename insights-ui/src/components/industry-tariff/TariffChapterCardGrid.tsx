'use client';

import ToggleChip from '@/components/ui/ToggleChip';
import MetricGrid from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import React, { useState } from 'react';

// Chapter card grid on /tariff-reports with a "Has export report" filter. The cards are rendered
// on the server and passed in; this only decides which ones show. The chip appears only when at
// least one chapter has export pages.

export interface TariffChapterCardItem {
  key: string;
  hasExports: boolean;
  card: React.ReactNode;
}

export default function TariffChapterCardGrid({ items }: { items: TariffChapterCardItem[] }): React.JSX.Element {
  const [onlyExports, setOnlyExports] = useState(false);
  const exportCount = items.filter((item) => item.hasExports).length;
  const visible = onlyExports ? items.filter((item) => item.hasExports) : items;

  return (
    <Stack gap="lg">
      {exportCount > 0 && (
        <Stack direction="row" gap="sm" align="center" wrap>
          <ToggleChip label="Has export report" active={onlyExports} onToggle={() => setOnlyExports(!onlyExports)} count={exportCount} />
        </Stack>
      )}
      <MetricGrid columns="1-2-3" gap="xl">
        {visible.map((item) => (
          <React.Fragment key={item.key}>{item.card}</React.Fragment>
        ))}
      </MetricGrid>
    </Stack>
  );
}
