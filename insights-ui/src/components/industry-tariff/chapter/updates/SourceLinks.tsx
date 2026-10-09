import TextLink from '@/components/ui/TextLink';
import Stack from '@/components/ui/containers/Stack';
import type { TariffUpdateSource } from '@/types/tariff-chapter-prototype';
import React from 'react';

/** External links to the documents behind a duty or change, e.g. "90 FR 9117 ↗". */
export function SourceLinks({ ids, sources }: { ids: string[]; sources: Map<string, TariffUpdateSource> }): React.JSX.Element {
  return (
    <Stack direction="row" gap="md" wrap>
      {ids.map((id) => {
        const source = sources.get(id);
        if (!source) return null;
        return (
          <TextLink key={id} href={source.url} size="xs" wrap>
            {source.citation} ↗
          </TextLink>
        );
      })}
    </Stack>
  );
}
