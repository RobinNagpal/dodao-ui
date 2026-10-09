'use client';

import type { HtsSearchResponse } from '@/app/api/tariff-calculator/hts-search/route';
import type { CalculatorRequirementsResponse } from '@/app/api/tariff-calculator/requirements/[hts10]/route';
import ConfirmationQuestions, { confirmationsForQuestions, setConfirmed } from '@/components/tariff-calculator/ConfirmationQuestions';
import HtsCodeSearch from '@/components/tariff-calculator/HtsCodeSearch';
import {
  dealsForCountry,
  MeasureSources,
  PRODUCT_TYPE_CHOICES,
  SkippedMeasuresPanel,
  TradeDealFields,
} from '@/components/tariff-calculator/OfficialMeasuresFields';
import NoticeCallout from '@/components/ui/NoticeCallout';
import TextLink from '@/components/ui/TextLink';
import type { TariffConfirmationQuestion, TariffProductType, TariffShipmentConfirmations } from '@/types/tariff-calculator-measures';
import {
  CalculatorResponse,
  DataFreshness,
  describeUom,
  PerUnitRequirement,
  PotentialExclusion,
  TRANSPORT_MODES,
  TransportMode,
} from '@/utils/tariff-calculator/duty-engine';
import { isKnownCountryCode, OTHER_COUNTRY_OPTIONS, PINNED_COUNTRY_OPTIONS } from '@/utils/tariff-calculator/countries';
import { TariffCandidateCodeType } from '@prisma/client';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface FormState {
  shipmentValueUsd: string;
  countryOfOrigin: string;
  modeOfTransport: TransportMode;
  entryDate: string;
  dateOfLoading: string;
  // Quantity per unit of measure (e.g. { KG: '21000' }). Only the units a
  // per-unit duty on the picked HTS line is charged in are shown/sent.
  quantities: Record<string, string>;
  // Official-measures engine only: claimed trade-deal program code ('' = none) and product type.
  claimedSpi: string;
  productType: TariffProductType | '';
  // Official-measures engine only: facts the importer confirmed (end use, named product, company program).
  confirmations: TariffShipmentConfirmations;
}

interface SelectedCode {
  hts10: string;
  htsNumber: string;
  description: string;
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

const INITIAL_FORM: FormState = {
  shipmentValueUsd: '100000',
  countryOfOrigin: 'CN',
  modeOfTransport: 'OCEAN',
  entryDate: TODAY_ISO,
  dateOfLoading: TODAY_ISO,
  // Quantities stay blank until we know whether the picked HTS line is
  // priced per-unit and which unit(s) it uses.
  quantities: {},
  claimedSpi: '',
  productType: '',
  confirmations: {},
};

// Extra-duty data older than this gets a visible "may be missing recent tariffs" warning.
const STALE_DATA_DAYS = 30;
const USER_ENTERED_DESCRIPTION = 'User-entered HTS code';

interface DeepLinkParams {
  hts10: string;
  country: string | null;
  value: string | null;
  qty: string | null;
  // Trade-deal program code (e.g. "S"), validated against the line's deals once they load.
  claim: string | null;
  productType: TariffProductType | null;
  // Confirmation answers, kept only when the line asks that question:
  // ?use=<pharmaceutical|research>, ?company=<program>, ?product=<id,id>, ?usapi=1.
  use: string | null;
  usOriginIngredient: boolean;
  company: string | null;
  products: string[];
}

// Reads ?hts=<10 digits>&country=<ISO2>&value=&qty=&claim=<SPI>&type=<patented|generic|specialty>
// &use=<pharmaceutical|research>&company=<onshoring|mfnPricing|annexCompany>&product=<id,id>&usapi=1
// (e.g. links from the chapter reports). Returns null when there's no usable HTS code.
function parseDeepLink(params: URLSearchParams | null): DeepLinkParams | null {
  if (!params) return null;
  const hts10 = (params.get('hts') ?? '').replace(/[^\d]/g, '');
  if (hts10.length !== 10) return null;
  const countryRaw = (params.get('country') ?? '').trim().toUpperCase();
  const valueRaw = Number(params.get('value'));
  const qtyRaw = Number(params.get('qty'));
  const claimRaw = (params.get('claim') ?? '').trim().toUpperCase();
  const typeRaw = (params.get('type') ?? '').trim().toLowerCase();
  return {
    hts10,
    country: isKnownCountryCode(countryRaw) ? countryRaw : null,
    value: params.get('value') && Number.isFinite(valueRaw) && valueRaw > 0 ? String(valueRaw) : null,
    qty: params.get('qty') && Number.isFinite(qtyRaw) && qtyRaw >= 0 ? String(qtyRaw) : null,
    claim: /^[A-Z]{1,2}\+?$/.test(claimRaw) ? claimRaw : null,
    productType: PRODUCT_TYPE_CHOICES.find((c) => c.value === typeRaw)?.value ?? null,
    use: params.get('use')?.trim() || null,
    company: params.get('company')?.trim() || null,
    usOriginIngredient: params.get('usapi') === '1',
    products: (params.get('product') ?? '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean),
  };
}

// The HTS line's own description, via the same search API the picker uses.
async function lookupHtsDescription(hts10: string): Promise<string> {
  try {
    const res = await fetch(`/api/tariff-calculator/hts-search?q=${encodeURIComponent(formatHts10(hts10))}`);
    if (!res.ok) return USER_ENTERED_DESCRIPTION;
    const data = (await res.json()) as HtsSearchResponse;
    return data.results.find((r) => r.htsCode10 === hts10)?.description ?? USER_ENTERED_DESCRIPTION;
  } catch {
    return USER_ENTERED_DESCRIPTION;
  }
}

function formatDataDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function isStale(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() > STALE_DATA_DAYS * 24 * 60 * 60 * 1000;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

function formatPercent(rate: number | null): string {
  if (rate === null || !Number.isFinite(rate)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(rate);
}

function digitsOnly(raw: string): string {
  return raw.replace(/[^\d]/g, '');
}

function formatHts10(hts10: string): string {
  return hts10.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4');
}

function exclusionKey(code: string, variant: string | null): string {
  return `${code}|${variant ?? ''}`;
}

function formatExclusionTargets(targets: { code: string; variant: string | null }[]): string {
  return targets.map((t) => (t.variant ? `${t.code} (${t.variant})` : t.code)).join(', ');
}

// Deep-link answers for the questions the line actually asks; unknown values are dropped.
function deepLinkConfirmations(link: DeepLinkParams, questions: TariffConfirmationQuestion[]): TariffShipmentConfirmations {
  return questions.reduce<TariffShipmentConfirmations>((acc, q) => {
    const yes =
      (q.kind === 'endUse' && q.value === link.use) ||
      (q.kind === 'companyProgram' && q.value === link.company) ||
      (q.kind === 'productDescription' && link.products.includes(q.value)) ||
      (q.kind === 'usOriginIngredient' && link.usOriginIngredient);
    return yes ? setConfirmed(q, acc, true) : acc;
  }, {});
}

// Units to ask a quantity for. Official-measures engine: the units of the rate actually
// charged as the base — the claimed deal's, the column 2 rate's for column 2 countries,
// else the general rate's. Otherwise the cached candidate codes' units.
function quantityUnitsFor(requirements: CalculatorRequirementsResponse, form: FormState): PerUnitRequirement[] {
  const official = requirements.officialMeasures;
  if (!official) return requirements.perUnit;
  const deal = dealsForCountry(official.tradeDeals, form.countryOfOrigin).find((d) => d.codes[0] === form.claimedSpi);
  if (deal) return deal.perUnit;
  if (official.column2Countries.includes(form.countryOfOrigin)) return official.column2PerUnit;
  return requirements.perUnit;
}

export default function CalculatorClient(): JSX.Element {
  const [selected, setSelected] = useState<SelectedCode | null>(null);
  // Free-form HTS input — only used when the user wants to bypass search
  // and type a code directly. Stays empty otherwise.
  const [manualCode, setManualCode] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [result, setResult] = useState<CalculatorResponse | null>(null);
  // Units the picked HTS line's per-unit duties need + data freshness, loaded on selection.
  const [requirements, setRequirements] = useState<CalculatorRequirementsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [chosenExclusions, setChosenExclusions] = useState<Set<string>>(new Set());

  // Guards against an in-flight calculation from clobbering a newer one when
  // the user toggles exclusions or re-submits quickly.
  const requestSeqRef = useRef(0);
  // Questions currently asked, so a calculation only sends answers to them (a changed country or date can drop one).
  const questionsRef = useRef<TariffConfirmationQuestion[] | null>(null);

  const updateForm = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submitCalculation = useCallback(async (currentForm: FormState, code: SelectedCode, exclusions: Set<string>) => {
    const seq = ++requestSeqRef.current;
    setError(null);
    setSubmitting(true);
    try {
      const value = Number(currentForm.shipmentValueUsd);
      if (!Number.isFinite(value) || value <= 0) throw new Error('Shipment value must be a positive number.');
      const unitsOfMeasure: Record<string, number> = {};
      for (const [uom, raw] of Object.entries(currentForm.quantities)) {
        const qty = Number(raw);
        if (raw.trim() !== '' && Number.isFinite(qty) && qty >= 0) unitsOfMeasure[uom] = qty;
      }
      const body = {
        hts10: code.hts10,
        shipmentValueUsd: value,
        countryOfOrigin: currentForm.countryOfOrigin,
        modeOfTransport: currentForm.modeOfTransport,
        entryDate: new Date(currentForm.entryDate).toISOString(),
        dateOfLoading: new Date(currentForm.dateOfLoading).toISOString(),
        unitsOfMeasure,
        chosenSpis: [] as string[],
        chosenExclusions: Array.from(exclusions),
        claimedSpi: currentForm.claimedSpi || undefined,
        productType: currentForm.productType || undefined,
        confirmations: questionsRef.current ? confirmationsForQuestions(currentForm.confirmations, questionsRef.current) : currentForm.confirmations,
      };
      const res = await fetch('/api/tariff-calculator/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        // The error middleware returns `{ error }`; fall back to the other
        // shapes and finally a generic message so the user always sees text.
        const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string; errorMessage?: string };
        throw new Error(payload.error ?? payload.errorMessage ?? payload.message ?? `Calculation failed (HTTP ${res.status})`);
      }
      const data = (await res.json()) as CalculatorResponse;
      if (seq !== requestSeqRef.current) return;
      setResult(data);
    } catch (err) {
      if (seq !== requestSeqRef.current) return;
      setError(err instanceof Error ? err.message : 'Calculation failed');
      setResult(null);
    } finally {
      if (seq === requestSeqRef.current) setSubmitting(false);
    }
  }, []);

  function handleSelect(selection: SelectedCode) {
    setSelected(selection);
    setManualCode('');
    setManualError(null);
    setResult(null);
    setError(null);
    setChosenExclusions(new Set());
    setRequirements(null);
    setForm((prev) => ({ ...prev, quantities: {}, claimedSpi: '', productType: '', confirmations: {} }));
  }

  function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const digits = digitsOnly(manualCode);
    if (digits.length !== 10) {
      setManualError('HTS code must contain exactly 10 digits.');
      return;
    }
    setManualError(null);
    handleSelect({ hts10: digits, htsNumber: formatHts10(digits), description: USER_ENTERED_DESCRIPTION });
  }

  function handleClearSelection() {
    setSelected(null);
    setResult(null);
    setError(null);
    setChosenExclusions(new Set());
    setRequirements(null);
    setManualCode('');
    setManualError(null);
    setForm(INITIAL_FORM);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const fresh = new Set<string>();
    setChosenExclusions(fresh);
    await submitCalculation(form, selected, fresh);
  }

  async function toggleExclusion(key: string, applied: boolean) {
    if (!selected) return;
    const next = new Set(chosenExclusions);
    if (applied) next.add(key);
    else next.delete(key);
    setChosenExclusions(next);
    await submitCalculation(form, selected, next);
  }

  // Load which units this HTS line's per-unit duties are charged in (e.g.
  // cattle "1¢/kg" -> KG) so the form asks for the right quantity up front,
  // plus how fresh the cached extra-duty data is. Country and entry date scope the
  // "Do any of these apply?" questions, so the call is repeated when they change.
  const selectedHts10 = selected?.hts10 ?? null;
  const questionCountry = form.countryOfOrigin;
  const questionDate = form.entryDate;
  useEffect(() => {
    if (!selectedHts10) return;
    let cancelled = false;
    const query = new URLSearchParams({ country: questionCountry, date: questionDate });
    fetch(`/api/tariff-calculator/requirements/${selectedHts10}?${query.toString()}`)
      .then(async (res) => (res.ok ? ((await res.json()) as CalculatorRequirementsResponse) : null))
      .catch(() => null)
      .then((data) => {
        if (cancelled) return;
        // On failure fall back to an empty list: the calculate API still
        // returns a clear "quantity required" error naming the unit.
        setRequirements(data ?? { hts10: selectedHts10, perUnit: [], dataFreshness: { lastUpdatedAt: null, chapterReportHref: null } });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedHts10, questionCountry, questionDate]);
  const confirmationQuestions = requirements?.officialMeasures?.confirmationQuestions ?? null;
  questionsRef.current = confirmationQuestions;

  // Deep links: ?hts=&country=&value=&qty= pre-fill the form and calculate
  // once the requirements for the code are known.
  const searchParams = useSearchParams();
  const deepLinkRef = useRef<DeepLinkParams | null | undefined>(undefined);
  useEffect(() => {
    if (deepLinkRef.current !== undefined) return;
    const link = parseDeepLink(searchParams);
    deepLinkRef.current = link;
    if (!link) return;
    setForm((prev) => ({
      ...prev,
      countryOfOrigin: link.country ?? prev.countryOfOrigin,
      shipmentValueUsd: link.value ?? prev.shipmentValueUsd,
    }));
    lookupHtsDescription(link.hts10).then((description) => handleSelect({ hts10: link.hts10, htsNumber: formatHts10(link.hts10), description }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    const link = deepLinkRef.current;
    if (!link || !selected || !requirements || requirements.hts10 !== link.hts10 || selected.hts10 !== link.hts10) return;
    deepLinkRef.current = null;
    const quantities: Record<string, string> = {};
    // A single ?qty= fills the first unit the line is charged in.
    if (link.qty !== null && requirements.perUnit.length > 0) quantities[requirements.perUnit[0].uom] = link.qty;
    // ?claim= is kept only when the line offers that deal for the linked country; ?type= only when the line asks for one.
    const deals = requirements.officialMeasures ? dealsForCountry(requirements.officialMeasures.tradeDeals, form.countryOfOrigin) : [];
    const claimedSpi = deals.find((d) => link.claim !== null && d.codes.includes(link.claim))?.codes[0] ?? '';
    const productType = link.productType && requirements.officialMeasures?.productTypes.length ? link.productType : '';
    const confirmations = deepLinkConfirmations(link, requirements.officialMeasures?.confirmationQuestions ?? []);
    const nextForm: FormState = { ...form, quantities, claimedSpi, productType, confirmations };
    setForm(nextForm);
    const hasQuantities = quantityUnitsFor(requirements, nextForm).every((u) => quantities[u.uom] !== undefined);
    if (link.country && link.value && hasQuantities) {
      submitCalculation(nextForm, selected, chosenExclusions);
    }
  }, [requirements, selected, form, chosenExclusions, submitCalculation]);

  // Units to ask a quantity for: from the requirements call, else (if it hasn't
  // loaded) whatever the last calculation reported.
  const quantityUnits: PerUnitRequirement[] = useMemo(
    () => (requirements ? quantityUnitsFor(requirements, form) : result?.diagnostics.primaryUoms.map((uom) => ({ uom, rateDescription: '' })) ?? []),
    [requirements, result, form]
  );
  const hideQuantityInputs = (requirements !== null || result !== null) && quantityUnits.length === 0;
  const freshness = result?.dataFreshness ?? requirements?.dataFreshness ?? null;

  if (!selected) {
    return (
      <CodePicker onSelect={handleSelect} manualCode={manualCode} setManualCode={setManualCode} manualError={manualError} onManualSubmit={handleManualSubmit} />
    );
  }

  return (
    <div className="space-y-6">
      <SelectedCodeBanner selected={selected} onChange={handleClearSelection} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <ShipmentForm
          form={form}
          updateForm={updateForm}
          submitting={submitting}
          hideQuantityInputs={hideQuantityInputs}
          quantityUnits={quantityUnits}
          onSubmit={onSubmit}
          error={error}
          extraFields={
            requirements?.officialMeasures ? (
              <>
                <TradeDealFields
                  deals={requirements.officialMeasures.tradeDeals}
                  country={form.countryOfOrigin}
                  claimedSpi={form.claimedSpi}
                  onClaim={(code) => updateForm('claimedSpi', code)}
                  productTypes={requirements.officialMeasures.productTypes}
                  productType={form.productType}
                  onProductType={(type) => updateForm('productType', type)}
                />
                <ConfirmationQuestions
                  questions={requirements.officialMeasures.confirmationQuestions ?? []}
                  confirmations={form.confirmations}
                  onChange={(next) => updateForm('confirmations', next)}
                />
              </>
            ) : null
          }
        />

        <div className="space-y-6">
          {freshness && <DataFreshnessNotice freshness={freshness} />}
          {result ? <ResultPanel result={result} submitting={submitting} onToggleExclusion={toggleExclusion} /> : <EmptyResultState />}
        </div>
      </div>
    </div>
  );
}

interface CodePickerProps {
  onSelect: (s: SelectedCode) => void;
  manualCode: string;
  setManualCode: (v: string) => void;
  manualError: string | null;
  onManualSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

function CodePicker({ onSelect, manualCode, setManualCode, manualError, onManualSubmit }: CodePickerProps): JSX.Element {
  return (
    <div className="rounded-xl bg-bg border border-border shadow-2xl p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-semibold heading-color">Find your HTS code</h2>
      <p className="mt-2 text-sm opacity-80">
        Type what you ship in plain words. We match it to the official US tariff list and show the full path so you can pick the closest line.
      </p>

      <div className="mt-6">
        <HtsCodeSearch onSelect={onSelect} />
      </div>

      <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-wide opacity-60">
        <div className="h-px flex-1 bg-surface-2" />
        <span>Or enter a code directly</span>
        <div className="h-px flex-1 bg-surface-2" />
      </div>

      <form onSubmit={onManualSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          inputMode="numeric"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="0901.90.20.00"
          aria-label="HTS code"
          className="flex-1 h-11 rounded-lg border border-border bg-surface px-4 text-sm text-heading placeholder-muted font-mono focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300/60"
        />
        <button
          type="submit"
          className="h-11 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 px-6 text-sm font-semibold text-black shadow-md hover:from-amber-400 hover:to-amber-300 transition"
        >
          Use this code
        </button>
      </form>
      {manualError && <p className="mt-2 text-xs text-red-400">{manualError}</p>}
      <p className="mt-3 text-xs opacity-60">Type the full 10-digit code. Dots are fine but not needed.</p>
    </div>
  );
}

function SelectedCodeBanner({ selected, onChange }: { selected: SelectedCode; onChange: () => void }): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-bg border border-amber-300/25 px-4 sm:px-5 py-4 shadow-lg">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1">
          <div className="text-xs uppercase tracking-wide opacity-60">Working out duties for</div>
          <div className="font-mono text-sm sm:text-base font-semibold text-tariff-accent break-all">{formatHts10(selected.hts10)}</div>
          {selected.description && selected.description !== USER_ENTERED_DESCRIPTION && (
            <div className="mt-0.5 text-xs opacity-80 line-clamp-2 sm:line-clamp-1">{selected.description}</div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-body hover:bg-surface-2 transition"
      >
        <ArrowPathIcon className="h-3.5 w-3.5" />
        Change product
      </button>
    </div>
  );
}

interface ShipmentFormProps {
  form: FormState;
  updateForm: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  submitting: boolean;
  hideQuantityInputs: boolean;
  quantityUnits: PerUnitRequirement[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  // Trade-deal claim / product type controls (official-measures engine only).
  extraFields: React.ReactNode;
}

function ShipmentForm({ form, updateForm, submitting, hideQuantityInputs, quantityUnits, onSubmit, error, extraFields }: ShipmentFormProps): JSX.Element {
  return (
    <form onSubmit={onSubmit} className="rounded-xl bg-bg border border-border p-4 sm:p-6 shadow-lg space-y-4">
      <h2 className="text-lg font-semibold heading-color">Shipment details</h2>

      <Field label="Shipment Value (USD)" htmlFor="shipmentValueUsd">
        <input
          id="shipmentValueUsd"
          type="number"
          min="0"
          step="0.01"
          value={form.shipmentValueUsd}
          onChange={(e) => updateForm('shipmentValueUsd', e.target.value)}
          className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-heading shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300/60"
        />
      </Field>

      <Field label="Country of Origin" htmlFor="countryOfOrigin">
        <select
          id="countryOfOrigin"
          value={form.countryOfOrigin}
          onChange={(e) => updateForm('countryOfOrigin', e.target.value)}
          className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-heading shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300/60"
        >
          <optgroup label="Top US trading partners">
            {PINNED_COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </optgroup>
          <optgroup label="All countries">
            {OTHER_COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </optgroup>
        </select>
      </Field>

      <Field label="Mode of Transport" htmlFor="modeOfTransport">
        <select
          id="modeOfTransport"
          value={form.modeOfTransport}
          onChange={(e) => updateForm('modeOfTransport', e.target.value as TransportMode)}
          className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-heading shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300/60"
        >
          {TRANSPORT_MODES.map((m) => (
            <option key={m} value={m}>
              {m.charAt(0) + m.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Entry Date" htmlFor="entryDate">
          <input
            id="entryDate"
            type="date"
            value={form.entryDate}
            onChange={(e) => updateForm('entryDate', e.target.value)}
            className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-heading shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300/60"
          />
        </Field>
        <Field label="Date of Loading" htmlFor="dateOfLoading">
          <input
            id="dateOfLoading"
            type="date"
            value={form.dateOfLoading}
            onChange={(e) => updateForm('dateOfLoading', e.target.value)}
            className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-heading shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300/60"
          />
        </Field>
      </div>

      {extraFields}

      {hideQuantityInputs ? (
        <p className="text-xs opacity-70">This code uses only percentage duties, so you can skip the unit and quantity.</p>
      ) : (
        <>
          {quantityUnits.map((u) => (
            <Field key={u.uom} label={`Quantity in ${describeUom(u.uom)}`} htmlFor={`quantity-${u.uom}`}>
              <input
                id={`quantity-${u.uom}`}
                type="number"
                min="0"
                step="any"
                required
                value={form.quantities[u.uom] ?? ''}
                onChange={(e) => updateForm('quantities', { ...form.quantities, [u.uom]: e.target.value })}
                className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-heading shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300/60"
              />
            </Field>
          ))}
          <p className="text-xs opacity-70">
            {quantityUnits.length > 0
              ? `This code has a per-unit duty${
                  quantityUnits[0].rateDescription ? ` (${quantityUnits.map((u) => u.rateDescription).join(', ')})` : ''
                }. Enter your quantity in ${quantityUnits.map((u) => u.uom).join(' and ')}.`
              : 'Checking whether this code charges per unit (like per kg)…'}
          </p>
        </>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2.5 text-sm font-semibold text-black shadow-md hover:from-amber-400 hover:to-amber-300 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {submitting ? 'Calculating…' : 'Calculate duties'}
      </button>

      {/* `badge-tone-danger` darkens the red-300 text in light mode (page-theme-light.scss). */}
      {error && <div className="badge-tone-danger rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }): JSX.Element {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-medium uppercase tracking-wide opacity-70 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function EmptyResultState(): JSX.Element {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm opacity-70">
      Fill in your shipment details and click <strong>Calculate duties</strong> to see what each line will cost.
    </div>
  );
}

// "Extra-duty data last updated <date>" + a warning when the cached Chapter 99
// data is old enough to miss recent tariff actions.
function DataFreshnessNotice({ freshness }: { freshness: DataFreshness }): JSX.Element | null {
  if (freshness.engine === 'official-measures') return <OfficialDataNotice freshness={freshness} />;
  if (!freshness.lastUpdatedAt) return null;
  const date = formatDataDate(freshness.lastUpdatedAt);
  if (!isStale(freshness.lastUpdatedAt)) {
    return <NoticeCallout tone="neutral">Extra-duty data last updated {date}.</NoticeCallout>;
  }
  return (
    <NoticeCallout tone="warning">
      Extra-duty data last updated {date}. Recent tariff actions after {date} (for example the July 2026 Section 301 tariffs) are not included yet. Check the
      chapter report&apos;s Rates by country page for today&apos;s extra duties.{' '}
      <TextLink href={freshness.chapterReportHref ?? '/tariff-reports'} wrap>
        {freshness.chapterReportHref ? 'Open the chapter report →' : 'Browse tariff reports →'}
      </TextLink>
    </NoticeCallout>
  );
}

// Official-measures engine: rates come straight from the cited HTS edition and the reviewed
// Chapter 99 measures, so there is no cache to go stale — say which edition and when the
// measures were last reviewed against their official sources instead.
function OfficialDataNotice({ freshness }: { freshness: DataFreshness }): JSX.Element {
  const edition = freshness.htsEdition ? `the official HTS (${freshness.htsEdition})` : 'the official HTS';
  if (!freshness.lastUpdatedAt) {
    return (
      <NoticeCallout tone="warning">
        Base and trade-deal rates come from {edition}, but no reviewed extra-duty measures are loaded yet, so Chapter 99 duties are missing.{' '}
        <TextLink href={freshness.chapterReportHref ?? '/tariff-reports'} wrap>
          {freshness.chapterReportHref ? 'Open the chapter report →' : 'Browse tariff reports →'}
        </TextLink>
      </NoticeCallout>
    );
  }
  return (
    <NoticeCallout tone="neutral">
      Base and trade-deal rates from {edition}. Extra duties from the Chapter 99 measures, last checked against official sources on{' '}
      {formatDataDate(freshness.lastUpdatedAt)}.
    </NoticeCallout>
  );
}

interface ResultPanelProps {
  result: CalculatorResponse;
  submitting: boolean;
  onToggleExclusion: (key: string, applied: boolean) => void;
}

function ResultPanel({ result, submitting, onToggleExclusion }: ResultPanelProps): JSX.Element {
  const { lines, potentialExclusions, totals, hts10, inputs } = result;

  return (
    <>
      <div className="rounded-xl bg-bg border border-border p-4 sm:p-6 shadow-lg">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold heading-color">Result</h2>
            <p className="mt-1 text-xs opacity-70 break-all">
              HTS <span className="font-mono">{formatHts10(hts10)}</span> · {inputs.countryOfOrigin} · {inputs.modeOfTransport}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide opacity-70">Total duty rate</div>
            <div className="text-2xl sm:text-3xl font-semibold text-tariff-accent">{formatPercent(totals.effectiveDutyRate)}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-bg border border-border overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide opacity-60">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3 text-right">Duty</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center opacity-70">
                    No duties apply to this shipment.
                  </td>
                </tr>
              )}
              {lines.map((line) => (
                <tr key={line.candidateId} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-tariff-accent">
                      {line.code}
                      {line.variant ? ` (${line.variant})` : ''}
                    </div>
                    <div className="text-xs opacity-80 mt-0.5">
                      {line.type === TariffCandidateCodeType.SPECIAL_CODE
                        ? line.label || 'Special code'
                        : result.engine === 'official-measures'
                        ? line.label
                        : 'Base HTS rate'}
                    </div>
                    {line.sources && <MeasureSources sources={line.sources} />}
                    {line.notes.length > 0 && (
                      <ul className="mt-1 text-xs text-tariff-accent list-disc list-inside">
                        {line.notes.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{line.rateDescription || '—'}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrency(line.dutyAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {result.skippedMeasures && <SkippedMeasuresPanel skipped={result.skippedMeasures} />}

      {potentialExclusions.length > 0 && <PotentialExclusionsPanel exclusions={potentialExclusions} submitting={submitting} onToggle={onToggleExclusion} />}

      <div className="rounded-xl bg-bg border border-border p-4 sm:p-6 shadow-lg">
        <h3 className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-3">Cost breakdown</h3>
        <dl className="space-y-2 text-sm">
          <Row label="Shipment value" value={formatCurrency(totals.baseCost)} />
          <Row label="Duties" value={formatCurrency(totals.totalDuties)} />
          <Row label="Harbor Maintenance Fee" value={formatCurrency(totals.hmf)} />
          <Row label="Merchandise Processing Fee" value={formatCurrency(totals.mpf)} />
          <Row label="Total landed cost" value={formatCurrency(totals.landedCost)} bold />
        </dl>
      </div>
    </>
  );
}

interface PotentialExclusionsPanelProps {
  exclusions: PotentialExclusion[];
  submitting: boolean;
  onToggle: (key: string, applied: boolean) => void;
}

function PotentialExclusionsPanel({ exclusions, submitting, onToggle }: PotentialExclusionsPanelProps): JSX.Element {
  return (
    <div className="rounded-xl bg-bg border border-border p-4 sm:p-6 shadow-lg">
      <h3 className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">Possible exclusions</h3>
      <p className="text-xs opacity-70 mb-4">
        These extra codes are not added by default. The importer has to claim them. Tick one to see how the duty changes.
      </p>
      <ul className="space-y-3">
        {exclusions.map((ex) => {
          const key = exclusionKey(ex.code, ex.variant);
          return (
            <li key={ex.candidateId} className="flex items-start gap-3">
              <input
                id={`excl-${ex.candidateId}`}
                type="checkbox"
                className="mt-1 h-4 w-4 cursor-pointer accent-amber-500 disabled:cursor-not-allowed"
                checked={ex.applied}
                disabled={submitting}
                onChange={(e) => onToggle(key, e.target.checked)}
              />
              <label htmlFor={`excl-${ex.candidateId}`} className="flex-1 cursor-pointer">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-xs text-tariff-accent">
                    {ex.code}
                    {ex.variant ? ` (${ex.variant})` : ''}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                      ex.applied ? 'badge-tone-success bg-emerald-500/15 text-emerald-300' : 'badge-tone-rose bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {ex.applied ? 'Applied' : 'Not applied'}
                  </span>
                  <span className="text-xs">{ex.label}</span>
                </div>
                <div className="text-xs opacity-70 mt-0.5">{ex.rateDescription || '—'}</div>
                <div className="text-xs opacity-70 mt-0.5">
                  {ex.applied ? 'Removes: ' : 'Would remove: '}
                  <span className="font-mono">{formatExclusionTargets(ex.excludesCodes)}</span>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }): JSX.Element {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold border-t border-border pt-2 mt-2 text-tariff-accent' : ''}`}>
      <dt>{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}
