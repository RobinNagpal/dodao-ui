'use client';

import HtsCodeSearch from '@/components/tariff-calculator/HtsCodeSearch';
import { CalculatorResult, PotentialExclusion, TRANSPORT_MODES, TransportMode } from '@/utils/tariff-calculator/duty-engine';
import { COUNTRY_OPTIONS } from '@/utils/tariff-calculator/countries';
import { TariffCandidateCodeType } from '@prisma/client';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface FormState {
  shipmentValueUsd: string;
  countryOfOrigin: string;
  modeOfTransport: TransportMode;
  entryDate: string;
  dateOfLoading: string;
  unitOfMeasure: string;
  quantity: string;
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
  // UOM/quantity stay blank until we know whether the picked HTS line is
  // priced per-unit and which UOM it uses.
  unitOfMeasure: '',
  quantity: '',
};

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

export default function CalculatorClient(): JSX.Element {
  const [selected, setSelected] = useState<SelectedCode | null>(null);
  // Free-form HTS input — only used when the user wants to bypass search
  // and type a code directly. Stays empty otherwise.
  const [manualCode, setManualCode] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [chosenExclusions, setChosenExclusions] = useState<Set<string>>(new Set());

  // Guards against an in-flight calculation from clobbering a newer one when
  // the user toggles exclusions or re-submits quickly.
  const requestSeqRef = useRef(0);

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
      const qty = Number(currentForm.quantity);
      const unitsOfMeasure: Record<string, number> = {};
      if (currentForm.unitOfMeasure.trim() && Number.isFinite(qty) && qty >= 0) {
        unitsOfMeasure[currentForm.unitOfMeasure.trim().toUpperCase()] = qty;
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
      };
      const res = await fetch('/api/tariff-calculator/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string; errorMessage?: string };
        throw new Error(payload.errorMessage ?? payload.message ?? `Calculation failed (HTTP ${res.status})`);
      }
      const data = (await res.json()) as CalculatorResult;
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
    setForm((prev) => ({ ...prev, unitOfMeasure: '', quantity: '' }));
  }

  function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const digits = digitsOnly(manualCode);
    if (digits.length !== 10) {
      setManualError('HTS code must contain exactly 10 digits.');
      return;
    }
    setManualError(null);
    handleSelect({ hts10: digits, htsNumber: formatHts10(digits), description: 'User-entered HTS code' });
  }

  function handleClearSelection() {
    setSelected(null);
    setResult(null);
    setError(null);
    setChosenExclusions(new Set());
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

  const hideQuantityInputs = result !== null && !result.diagnostics.requiresQuantity;
  const primaryUoms = useMemo(() => result?.diagnostics.primaryUoms ?? [], [result]);

  // After each calc, if the candidate data tells us which UOMs this HTS
  // line is priced in, snap the form's UOM into that set. This is what
  // turns an empty UOM into 'NO' (poultry) or 'KG' (coffee) automatically.
  useEffect(() => {
    if (primaryUoms.length === 0) return;
    setForm((prev) => (primaryUoms.includes(prev.unitOfMeasure) ? prev : { ...prev, unitOfMeasure: primaryUoms[0] }));
  }, [primaryUoms]);

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
          primaryUoms={primaryUoms}
          onSubmit={onSubmit}
          error={error}
        />

        <div className="space-y-6">
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
    <div className="rounded-xl bg-gray-900 border border-gray-800 shadow-2xl p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-semibold heading-color">Find your HTSUS code</h2>
      <p className="mt-2 text-sm opacity-80">
        Start by searching for the product you&apos;re importing. We match against the HTSUS line descriptions and show the full classification path so you can
        pick the most specific match.
      </p>

      <div className="mt-6">
        <HtsCodeSearch onSelect={onSelect} />
      </div>

      <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-wide opacity-60">
        <div className="h-px flex-1 bg-gray-700" />
        <span>Or enter a code directly</span>
        <div className="h-px flex-1 bg-gray-700" />
      </div>

      <form onSubmit={onManualSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          inputMode="numeric"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="0901.90.20.00"
          aria-label="HTS code"
          className="flex-1 h-11 rounded-lg border border-gray-700 bg-gray-950 px-4 text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
        />
        <button
          type="submit"
          className="h-11 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 px-6 text-sm font-semibold text-black shadow-md hover:from-amber-400 hover:to-amber-300 transition"
        >
          Use this code
        </button>
      </form>
      {manualError && <p className="mt-2 text-xs text-red-400">{manualError}</p>}
      <p className="mt-3 text-xs opacity-60">Enter the full 10-digit HTSUS classification (separators are optional).</p>
    </div>
  );
}

function SelectedCodeBanner({ selected, onChange }: { selected: SelectedCode; onChange: () => void }): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gray-900 border border-amber-500/30 px-5 py-4 shadow-lg">
      <div className="flex items-start gap-3 min-w-0">
        <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide opacity-60">Calculating duties for</div>
          <div className="font-mono text-base font-semibold text-amber-300">{formatHts10(selected.hts10)}</div>
          {selected.description && selected.description !== 'User-entered HTS code' && (
            <div className="mt-0.5 text-xs opacity-80 truncate">{selected.description}</div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-gray-700 transition"
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
  primaryUoms: string[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
}

function ShipmentForm({ form, updateForm, submitting, hideQuantityInputs, primaryUoms, onSubmit, error }: ShipmentFormProps): JSX.Element {
  return (
    <form onSubmit={onSubmit} className="rounded-xl bg-gray-900 border border-gray-800 p-6 shadow-lg space-y-4">
      <h2 className="text-lg font-semibold heading-color">Shipment details</h2>

      <Field label="Shipment Value (USD)" htmlFor="shipmentValueUsd">
        <input
          id="shipmentValueUsd"
          type="number"
          min="0"
          step="0.01"
          value={form.shipmentValueUsd}
          onChange={(e) => updateForm('shipmentValueUsd', e.target.value)}
          className="block w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </Field>

      <Field label="Country of Origin" htmlFor="countryOfOrigin">
        <select
          id="countryOfOrigin"
          value={form.countryOfOrigin}
          onChange={(e) => updateForm('countryOfOrigin', e.target.value)}
          className="block w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
      </Field>

      <Field label="Mode of Transport" htmlFor="modeOfTransport">
        <select
          id="modeOfTransport"
          value={form.modeOfTransport}
          onChange={(e) => updateForm('modeOfTransport', e.target.value as TransportMode)}
          className="block w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
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
            className="block w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </Field>
        <Field label="Date of Loading" htmlFor="dateOfLoading">
          <input
            id="dateOfLoading"
            type="date"
            value={form.dateOfLoading}
            onChange={(e) => updateForm('dateOfLoading', e.target.value)}
            className="block w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </Field>
      </div>

      {hideQuantityInputs ? (
        <p className="text-xs opacity-70">
          UOM and quantity are not required for this HTS code — its duty rates are entirely ad-valorem (percentage of shipment value).
        </p>
      ) : (
        <>
          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
            <Field label="UOM" htmlFor="unitOfMeasure">
              {primaryUoms.length === 1 ? (
                <input
                  id="unitOfMeasure"
                  type="text"
                  value={primaryUoms[0]}
                  readOnly
                  className="block w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white shadow-xs uppercase opacity-80"
                />
              ) : primaryUoms.length > 1 ? (
                <select
                  id="unitOfMeasure"
                  value={form.unitOfMeasure}
                  onChange={(e) => updateForm('unitOfMeasure', e.target.value)}
                  className="block w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white shadow-xs uppercase focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {primaryUoms.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="unitOfMeasure"
                  type="text"
                  value={form.unitOfMeasure}
                  onChange={(e) => updateForm('unitOfMeasure', e.target.value)}
                  placeholder="—"
                  className="block w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white shadow-xs uppercase focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              )}
            </Field>
            <Field label="Quantity" htmlFor="quantity">
              <input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={form.quantity}
                onChange={(e) => updateForm('quantity', e.target.value)}
                className="block w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </Field>
          </div>
          <p className="text-xs opacity-70">
            {primaryUoms.length > 0
              ? `Priced per ${primaryUoms.join(' / ')} — quantity must be in that unit.`
              : 'Required for codes priced per-unit. The unit is derived from the candidate-code data after the first calculation.'}
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

      {error && <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
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
    <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/40 p-8 text-center text-sm opacity-70">
      Fill in the shipment details and click <strong>Calculate duties</strong> to see a per-line breakdown of the applicable HTSUS rates and Chapter 99 special
      tariffs.
    </div>
  );
}

interface ResultPanelProps {
  result: CalculatorResult;
  submitting: boolean;
  onToggleExclusion: (key: string, applied: boolean) => void;
}

function ResultPanel({ result, submitting, onToggleExclusion }: ResultPanelProps): JSX.Element {
  const { lines, potentialExclusions, totals, hts10, inputs } = result;

  return (
    <>
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 shadow-lg">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold heading-color">Result</h2>
            <p className="mt-1 text-xs opacity-70">
              HTS <span className="font-mono">{formatHts10(hts10)}</span> · {inputs.countryOfOrigin} · {inputs.modeOfTransport}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide opacity-70">Effective duty rate</div>
            <div className="text-3xl font-semibold text-amber-300">{formatPercent(totals.effectiveDutyRate)}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden shadow-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs uppercase tracking-wide opacity-60">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3 text-right">Duty</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center opacity-70">
                  No applicable duties for this shipment.
                </td>
              </tr>
            )}
            {lines.map((line) => (
              <tr key={line.candidateId} className="border-b border-gray-800/60 last:border-0 align-top">
                <td className="px-4 py-3">
                  <div className="font-mono text-xs text-amber-200">
                    {line.code}
                    {line.variant ? ` (${line.variant})` : ''}
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">
                    {line.type === TariffCandidateCodeType.SPECIAL_CODE ? line.label || 'Special code' : 'Base HTSUS rate'}
                  </div>
                  {line.notes.length > 0 && (
                    <ul className="mt-1 text-xs text-amber-400 list-disc list-inside">
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

      {potentialExclusions.length > 0 && <PotentialExclusionsPanel exclusions={potentialExclusions} submitting={submitting} onToggle={onToggleExclusion} />}

      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 shadow-lg">
        <h3 className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-3">Cost breakdown</h3>
        <dl className="space-y-2 text-sm">
          <Row label="Base cost" value={formatCurrency(totals.baseCost)} />
          <Row label="Total duties" value={formatCurrency(totals.totalDuties)} />
          <Row label="Harbor Maintenance Fee (HMF)" value={formatCurrency(totals.hmf)} />
          <Row label="Merchandise Processing Fee (MPF)" value={formatCurrency(totals.mpf)} />
          <Row label="Landed cost" value={formatCurrency(totals.landedCost)} bold />
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
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 shadow-lg">
      <h3 className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">Potential exclusion codes</h3>
      <p className="text-xs opacity-70 mb-4">
        These Chapter 99 codes are not auto-applied — the importer must claim them. Toggle one to recalculate with that exclusion in effect.
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
                  <span className="font-mono text-xs text-amber-200">
                    {ex.code}
                    {ex.variant ? ` (${ex.variant})` : ''}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                      ex.applied ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {ex.applied ? 'Applied' : 'Not applied'}
                  </span>
                  <span className="text-xs">{ex.label}</span>
                </div>
                <div className="text-xs opacity-70 mt-0.5">{ex.rateDescription || '—'}</div>
                <div className="text-xs opacity-70 mt-0.5">
                  {ex.applied ? 'Currently dropping: ' : 'Would drop: '}
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
    <div className={`flex justify-between ${bold ? 'font-semibold border-t border-gray-800 pt-2 mt-2 text-amber-200' : ''}`}>
      <dt>{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}
