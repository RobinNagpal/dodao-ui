import GlossaryTerm from '@/components/industry-tariff/chapter/GlossaryTerm';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import InlineCard from '@/components/ui/sections/InlineCard';
import type { TariffExtraDutyInEffect } from '@/types/tariff-chapter-prototype';
import React from 'react';

// "These are base rates" notice above the overview rate table. The table holds only the schedule's
// own rates; the extra duty by origin lives on the tariff-updates and rates-by-country pages. This
// line is generated from `tariffUpdates.inEffect` so a reader doesn't take a base rate for the total.

// Origins named inline before the rest collapse to "+N more".
const MAX_ORIGINS = 4;

interface BaseRateNoticeProps {
  inEffect: TariffExtraDutyInEffect[];
  /** The rates-by-country page; omitted when the chapter has none. */
  ratesByCountryHref?: string;
  ratesByCountryLabel: string;
}

// "Other Section 301 economies (incl. Japan, …)" → "Other Section 301 economies": the list is on the linked page.
function shortOrigin(country: string): string {
  return country.replace(/\s*\(.*\)\s*$/, '');
}

export default function BaseRateNotice({ inEffect, ratesByCountryHref, ratesByCountryLabel }: BaseRateNoticeProps): React.JSX.Element | null {
  if (inEffect.length === 0) return null;
  const shown = inEffect.slice(0, MAX_ORIGINS).map((measure) => `${shortOrigin(measure.country)} ${measure.now}`);
  const more = inEffect.length - shown.length;

  return (
    <InlineCard padding="cozy">
      <Text size="sm">
        <Text as="span" size="sm" weight="semibold" tone="white">
          These are <GlossaryTerm id="base-rate">base rates</GlossaryTerm>.
        </Text>{' '}
        An extra duty may be added on top, depending on where the goods come from and which measures cover them: {shown.join(' · ')}
        {more > 0 ? ` · +${more} more` : ''}. {ratesByCountryHref && <TextLink href={ratesByCountryHref}>{ratesByCountryLabel} →</TextLink>}
      </Text>
    </InlineCard>
  );
}
