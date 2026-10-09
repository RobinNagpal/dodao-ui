'use client';

import type { ClaimableTradeDeal } from '@/app/api/tariff-calculator/requirements/[hts10]/route';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import ToggleChip from '@/components/ui/ToggleChip';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import { RuleList, RuleListItem } from '@/components/ui/sections/RuleList';
import type { TariffMeasureSource, TariffProductType } from '@/types/tariff-calculator-measures';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import React from 'react';

// Calculator controls and result parts for the official-measures engine (issue #1785).
// Composed from leaves only — no Tailwind here.

const NO_DEAL = '';

/** Product types the calculator offers when an extra duty on the line depends on one. */
export const PRODUCT_TYPE_CHOICES: { value: TariffProductType; label: string }[] = [
  { value: 'patented', label: 'Patented' },
  { value: 'generic', label: 'Generic' },
  { value: 'specialty', label: 'Specialty' },
];

/** Deals that can be claimed for goods from `country` (deals tied to no country list are always offered). */
export function dealsForCountry(deals: ClaimableTradeDeal[], country: string): ClaimableTradeDeal[] {
  return deals.filter((d) => d.countries.length === 0 || d.countries.includes(country));
}

interface TradeDealFieldsProps {
  deals: ClaimableTradeDeal[];
  country: string;
  claimedSpi: string;
  onClaim: (code: string) => void;
  /** Product types an extra duty on this line depends on; empty hides the choice. */
  productTypes: TariffProductType[];
  productType: TariffProductType | '';
  onProductType: (type: TariffProductType | '') => void;
}

export function TradeDealFields({ deals, country, claimedSpi, onClaim, productTypes, productType, onProductType }: TradeDealFieldsProps): JSX.Element | null {
  const available = dealsForCountry(deals, country);
  const claimed = available.find((d) => d.codes[0] === claimedSpi);
  const showDeals = available.length > 0;
  const showProductType = productTypes.length > 0;
  if (!showDeals && !showProductType) return null;

  return (
    <Stack gap="md">
      {showDeals && (
        <Stack gap="xs">
          <StyledSelect
            label="Claim a trade deal"
            items={[
              { id: NO_DEAL, label: 'No trade deal (pay the general rate)' },
              ...available.map((d) => ({ id: d.codes[0], label: `${d.name} — ${d.rateText}` })),
            ]}
            selectedItemId={claimed ? claimed.codes[0] : NO_DEAL}
            setSelectedItemId={(id) => onClaim(id ?? NO_DEAL)}
          />
          <Text size="xs" tone="muted">
            {claimed
              ? `Claiming ${claimed.name} (program ${claimed.codes.join(' / ')}) needs the goods to meet its rules of origin, with proof at entry.`
              : 'Trade deals this HTS line lists for goods from the chosen country. Pick one only if the goods meet its rules of origin.'}
          </Text>
        </Stack>
      )}

      {showProductType && (
        <Stack gap="xs">
          <Text size="xs" weight="medium" tone="muted">
            Product type
          </Text>
          <Stack direction="row" gap="sm" wrap>
            {PRODUCT_TYPE_CHOICES.map((c) => (
              <ToggleChip
                key={c.value}
                label={c.label}
                active={productType === c.value}
                onToggle={() => onProductType(productType === c.value ? '' : c.value)}
              />
            ))}
          </Stack>
          <Text size="xs" tone="muted">
            An extra duty on this line depends on the kind of product (for example, Section 232 pharmaceuticals: patented vs generic). Pick one to calculate.
          </Text>
        </Stack>
      )}
    </Stack>
  );
}

/** Official documents behind a duty line. */
export function MeasureSources({ sources }: { sources: TariffMeasureSource[] }): JSX.Element | null {
  if (sources.length === 0) return null;
  return (
    <Stack gap="xxs">
      {sources.map((s) => (
        <TextLink key={s.url} href={s.url} size="xs" wrap>
          {s.citation} ({s.published})
        </TextLink>
      ))}
    </Stack>
  );
}

/** Extra duties in scope for the line and country that are not charged on this shipment, and why. */
export function SkippedMeasuresPanel({ skipped }: { skipped: { ch99Code: string; reason: string }[] }): JSX.Element | null {
  if (skipped.length === 0) return null;
  return (
    <CardSection bordered>
      <Stack gap="sm">
        <Heading as="h3" size="sm" weight="semibold">
          Extra duties not charged
        </Heading>
        <RuleList>
          {skipped.map((s, i) => (
            <RuleListItem key={`${s.ch99Code}-${i}`}>
              <Text size="xs" font="mono" tone="warning">
                {s.ch99Code}
              </Text>
              <Text size="xs" tone="muted">
                {s.reason}
              </Text>
            </RuleListItem>
          ))}
        </RuleList>
      </Stack>
    </CardSection>
  );
}
