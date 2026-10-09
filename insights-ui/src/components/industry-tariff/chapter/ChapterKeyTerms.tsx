import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import { DisclosureItem, DisclosureList } from '@/components/ui/sections/DisclosureList';
import type { GlossaryEntry } from '@/tariff-data/glossary';
import React from 'react';

// "Key terms on this page" (issue #1784): a collapsed list of plain-English definitions for the jargon an
// Approach-2 chapter page uses. The terms come from `approach2PageGlossaryTerms`, which scans the page's
// content file, so the block is generic across chapters. Native <details>: no client JS, and the
// definitions stay in the server HTML.

// A page rarely needs more; past this the list stops being a quick reference.
const MAX_TERMS = 20;

interface ChapterKeyTermsProps {
  terms: GlossaryEntry[];
}

export default function ChapterKeyTerms({ terms }: ChapterKeyTermsProps): React.JSX.Element | null {
  if (terms.length === 0) return null;
  const shown = terms.slice(0, MAX_TERMS);
  return (
    <Stack mb="lg">
      <DisclosureList>
        <DisclosureItem id="key-terms" summary={`Key terms on this page (${shown.length})`}>
          <Stack as="ul" gap="md">
            {shown.map((entry) => (
              <li key={entry.id}>
                <Text size="sm" leading="relaxed">
                  <Text as="span" size="sm" weight="semibold" tone="white">
                    {entry.term}:
                  </Text>{' '}
                  {entry.plain}
                </Text>
              </li>
            ))}
          </Stack>
        </DisclosureItem>
      </DisclosureList>
    </Stack>
  );
}
