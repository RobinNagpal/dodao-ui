import Term from '@/components/ui/Term';
import { glossaryEntry } from '@/tariff-data/glossary';
import React from 'react';

// A tap-to-explain jargon label backed by the tariff glossary: `<GlossaryTerm id="column-2">Column 2</GlossaryTerm>`.
// The visible text defaults to the glossary's term name.

interface GlossaryTermProps {
  /** Glossary entry id (see `src/tariff-data/glossary.ts`). */
  id: string;
  children?: React.ReactNode;
}

export default function GlossaryTerm({ id, children }: GlossaryTermProps): React.JSX.Element {
  const entry = glossaryEntry(id);
  return <Term definition={entry.plain}>{children ?? entry.term}</Term>;
}
