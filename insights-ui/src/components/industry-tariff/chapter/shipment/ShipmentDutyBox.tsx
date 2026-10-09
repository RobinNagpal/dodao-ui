'use client';

import NoticeCallout from '@/components/ui/NoticeCallout';
import MetricCell from '@/components/ui/MetricCell';
import SearchField from '@/components/ui/SearchField';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import ToggleChip from '@/components/ui/ToggleChip';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import MetricGrid from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import InlineCard from '@/components/ui/sections/InlineCard';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { MatrixCellButton } from '@/components/ui/tables/DataTable';
import type { TariffMatrixCountry } from '@/types/tariff-chapter-prototype';
import {
  HMF_RATE,
  MPF_FORMAL_ENTRY_THRESHOLD,
  MPF_MAX_USD,
  MPF_MIN_USD,
  MPF_RATE,
  TRANSPORT_MODES,
  type TransportMode,
} from '@/utils/tariff-calculator/duty-engine';
import {
  calculatorHref,
  computeShipmentDuty,
  type DollarRange,
  findShipmentRule,
  type QuantityUnit,
  rowQuantityUnits,
  rowVariantLabels,
  searchShipmentLines,
  type ShipmentLine,
} from '@/utils/tariff-reports/shipment-duty';
import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import React, { useMemo, useState } from 'react';

// "Your shipment" box (issue #1784): one number — what a shipment of one line
// from one country pays — worked out from the chapter's own matrix (the same
// breakdown the "Rates by country" cells show), plus MPF/HMF from the
// calculator's fee rules. Approach-2 chapters only.

const MAX_RESULTS = 8;

const MODE_LABELS: Record<TransportMode, string> = {
  OCEAN: 'Ocean (adds the harbor fee, HMF)',
  AIR: 'Air',
  TRUCK: 'Truck',
  RAIL: 'Rail',
};

const UNIT_QUESTIONS: Record<string, string> = {
  kg: 'Total weight (kg)',
  count: 'Number of animals / items',
  dozen: 'Number of dozens',
  liter: 'Volume (liters)',
  'proof liter': 'Proof liters',
  pair: 'Number of pairs',
};

export interface ShipmentDutyBoxProps {
  lines: ShipmentLine[];
  countries: TariffMatrixCountry[];
  /** ISO date the chapter's rules were checked. */
  ratesAsOf: string;
  scheduleEdition: string;
  /** Link to the chapter's "Rates by country" page, when this box isn't on it. */
  ratesByCountryHref?: string;
}

function usd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
}

function pct(rate: number): string {
  return `${Number((rate * 100).toFixed(4))}%`;
}

function usdRange(r: DollarRange): string {
  return r.low === r.high ? usd(r.low) : `${usd(r.low)} – ${usd(r.high)}`;
}

function formatDate(iso: string): string {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function parsePositive(raw: string): number | undefined {
  const n = Number(raw.replace(/[,$\s]/g, ''));
  return raw.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : undefined;
}

function unitQuestion(unit: QuantityUnit): string {
  return UNIT_QUESTIONS[unit.key] ?? `Quantity (${unit.label})`;
}

export default function ShipmentDutyBox({ lines, countries, ratesAsOf, scheduleEdition, ratesByCountryHref }: ShipmentDutyBoxProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [line, setLine] = useState<ShipmentLine | null>(null);
  const [countryName, setCountryName] = useState<string>(countries[0]?.country ?? '');
  const [usmcaClaimed, setUsmcaClaimed] = useState(true);
  const [valueRaw, setValueRaw] = useState('');
  const [quantityRaw, setQuantityRaw] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<TransportMode>('OCEAN');
  const [variant, setVariant] = useState<string | null>(null);

  const results = useMemo(() => searchShipmentLines(lines, query, MAX_RESULTS), [lines, query]);
  const country = countries.find((c) => c.country === countryName) ?? null;
  const isUsmcaCountry = country?.rule.kind === 'usmca';
  const rule = line && country ? findShipmentRule(countries, country.country, line.hts, usmcaClaimed) : null;
  const variantLabels = rule ? rowVariantLabels(rule.row) : [];
  const activeVariant = variantLabels.length > 0 ? (variant && variantLabels.includes(variant) ? variant : variantLabels[0]) : null;
  const units = rule ? rowQuantityUnits(rule.row, activeVariant) : [];

  const value = parsePositive(valueRaw);
  const quantities: Record<string, number | undefined> = {};
  for (const unit of units) quantities[unit.key] = parsePositive(quantityRaw[unit.key] ?? '');
  const result =
    rule && value !== undefined && value > 0
      ? computeShipmentDuty(rule.row, { customsValueUsd: value, quantities, modeOfTransport: mode }, activeVariant)
      : null;

  const singleQty = units.length === 1 ? quantities[units[0].key] ?? null : null;
  const isAnyOther = country?.rule.atLeast === true;
  const fullCalculatorHref = line ? calculatorHref(line.htsCode10, isAnyOther ? null : countryName, value ?? null, singleQty) : '/tariff-calculator';

  return (
    <CardSection padding="roomy" bordered id="your-shipment">
      <Stack gap="lg">
        <Stack gap="xs">
          <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
            Your shipment: what you pay
          </SectionHeading>
          <Text size="sm" tone="muted">
            Pick a product line, the country it comes from and its value to get one number: base duty + extra duty + customs fees. It uses this chapter&apos;s
            current rules (HTSUS {scheduleEdition}, rates as of {formatDate(ratesAsOf)}) — the same ones the{' '}
            {ratesByCountryHref ? <TextLink href={ratesByCountryHref}>rates by country</TextLink> : 'rates by country'} grid shows.
          </Text>
        </Stack>

        {/* 1. Product line */}
        <Stack gap="sm">
          <Text size="sm" weight="semibold" tone="white">
            1. Product line
          </Text>
          {line ? (
            <Stack gap="xs">
              <MatrixCellButton
                selected
                name={line.hts}
                primary={line.label}
                secondary="Change product line"
                label={`Selected line ${line.hts}. Select to change.`}
                onSelect={() => setLine(null)}
              />
            </Stack>
          ) : (
            <Stack gap="sm">
              <SearchField
                value={query}
                onChange={setQuery}
                label="Search product lines"
                placeholder="Search by product name or HTS code, e.g. horses, gauze, 0102.29"
                resultLabel={query ? `${results.count} line${results.count === 1 ? '' : 's'}` : undefined}
              />
              {results.matches.length > 0 && (
                <Stack as="ul" gap="xxs">
                  {results.matches.map((match) => (
                    <li key={match.hts}>
                      <MatrixCellButton
                        name={match.hts}
                        primary={match.label}
                        label={`Pick ${match.hts} ${match.label}`}
                        onSelect={() => {
                          setLine(match);
                          setQuery('');
                          setVariant(null);
                        }}
                      />
                    </li>
                  ))}
                </Stack>
              )}
              {results.count > MAX_RESULTS && (
                <Text size="xs" tone="muted">
                  Showing the first {MAX_RESULTS}. Add a word or more of the HTS code to narrow it down.
                </Text>
              )}
            </Stack>
          )}
        </Stack>

        {/* 2. Origin, value, quantities */}
        <MetricGrid columns="1-2" gap="md">
          <StyledSelect
            label="2. Country of origin"
            items={countries.map((c) => ({ id: c.country, label: c.country }))}
            selectedItemId={countryName}
            setSelectedItemId={(id) => id && setCountryName(id)}
          />
          <Input
            label="3. Customs value (USD)"
            number
            min={0}
            modelValue={valueRaw}
            placeholder="e.g. 50000"
            onUpdate={(v) => setValueRaw(v === undefined ? '' : String(v))}
          />
          {units.map((unit) => (
            <Input
              key={unit.key}
              label={`${unitQuestion(unit)} — the rate is charged per ${unit.label}`}
              number
              min={0}
              modelValue={quantityRaw[unit.key] ?? ''}
              onUpdate={(v) => setQuantityRaw({ ...quantityRaw, [unit.key]: v === undefined ? '' : String(v) })}
            />
          ))}
          <StyledSelect
            label="How it arrives"
            items={TRANSPORT_MODES.map((m) => ({ id: m, label: MODE_LABELS[m] }))}
            selectedItemId={mode}
            setSelectedItemId={(id) => id && setMode(id as TransportMode)}
          />
        </MetricGrid>

        {isUsmcaCountry && (
          <Stack gap="xs">
            <ToggleSwitch label="Goods qualify for USMCA (North American trade deal)" checked={usmcaClaimed} onToggle={() => setUsmcaClaimed(!usmcaClaimed)} />
            <Text size="xs" tone="muted">
              Claiming USMCA needs the goods to meet its rules of origin and a certification of origin at entry.
            </Text>
          </Stack>
        )}

        {rule && variantLabels.length > 0 && (
          <Stack gap="xs">
            <Stack direction="row" gap="sm" wrap>
              {variantLabels.map((label) => (
                <ToggleChip key={label} label={capitalize(label)} active={label === activeVariant} onToggle={() => setVariant(label)} />
              ))}
            </Stack>
            <Text size="xs" tone="muted">
              The rate depends on the kind of product: {rule.row.extra}
            </Text>
          </Stack>
        )}

        {/* Result */}
        {!line && (
          <Text size="sm" tone="muted">
            Start by searching for your product above.
          </Text>
        )}
        {line && country && !rule && (
          <NoticeCallout tone="warning">
            {line.hts} isn&apos;t in the {country.country} column of this chapter&apos;s rate grid, so it cannot be computed automatically here. Try the{' '}
            <TextLink href={fullCalculatorHref}>full tariff calculator</TextLink>.
          </NoticeCallout>
        )}
        {rule && value === undefined && (
          <Text size="sm" tone="muted">
            Enter the customs value to see what you pay.
          </Text>
        )}
        {result?.status === 'needs-quantity' && (
          <Text size="sm" tone="muted">
            This line&apos;s rate ({rule?.row.total}) is charged per {result.units.map((u) => u.label).join(' and per ')}: enter the quantity to see what you
            pay.
          </Text>
        )}
        {result?.status === 'unparsed' && (
          <NoticeCallout tone="warning">
            The total rate for this line from {countryName} is “{result.text}”, which we cannot compute automatically. The rule: {rule?.country.rule.label} Use
            the <TextLink href={fullCalculatorHref}>full tariff calculator</TextLink>.
          </NoticeCallout>
        )}
        {rule && result?.status === 'ok' && (
          <InlineCard surface="highlight" padding="spacious">
            <Stack gap="md">
              <MetricCell
                size="lg"
                label={result.exact ? 'You pay on this shipment' : 'You pay on this shipment (depends on the country)'}
                value={usdRange(result.total)}
                note={`Duty ${usdRange(result.duty)} + customs fees ${usd(result.mpf + result.hmf)}`}
              />
              <Text size="sm">
                {result.baseDuty && result.extraDuty ? (
                  <>
                    Base duty {usdRange(result.baseDuty)} ({rule.row.base}
                    {result.baseNote === 'replaced' ? ', replaced by the extra duty' : result.baseNote === 'preference' ? ', waived by the trade deal' : ''}) +
                    extra duty {usdRange(result.extraDuty)} ({rule.row.extra})
                  </>
                ) : (
                  <>
                    Duty {usdRange(result.duty)} ({rule.row.total})
                  </>
                )}{' '}
                + MPF {usd(result.mpf)} + HMF {usd(result.hmf)} = {usdRange(result.total)}
              </Text>
              {!result.exact && (
                <NoticeCallout tone="info">
                  “{countryName}” covers many countries, so this is a range ({rule.row.total}). Pick a listed country for an exact number, or open the full
                  calculator for your country.
                </NoticeCallout>
              )}
              <Stack gap="xs">
                <Text size="xs" tone="muted">
                  Rule: {rule.country.rule.label}
                  {rule.row.preference !== 'None' ? ` Preference: ${rule.row.preference}.` : ''}
                </Text>
                <Text size="xs" tone="muted">
                  Rates as of {formatDate(ratesAsOf)}, from the {rule.heading} × {rule.country.country} cell
                  {isUsmcaCountry ? (rule.usmcaClaimed ? ' (USMCA claimed)' : ' (no USMCA claim)') : ''}. MPF is {pct(MPF_RATE)} of value (min{' '}
                  {usd(MPF_MIN_USD)}, max {usd(MPF_MAX_USD)}) on entries over {usd(MPF_FORMAL_ENTRY_THRESHOLD)}; HMF is {pct(HMF_RATE)} on ocean shipments. An
                  estimate from this chapter&apos;s current rules, not a customs ruling.
                </Text>
              </Stack>
            </Stack>
          </InlineCard>
        )}

        {line && (
          <Text size="sm">
            <TextLink href={fullCalculatorHref}>Open this shipment in the full tariff calculator →</TextLink>
          </Text>
        )}
      </Stack>
    </CardSection>
  );
}
