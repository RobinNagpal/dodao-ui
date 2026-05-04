'use client';

import { CalculatorResult, PotentialExclusion, TRANSPORT_MODES, TransportMode } from '@/utils/tariff-calculator/duty-engine';
import { COUNTRY_OPTIONS } from '@/utils/tariff-calculator/countries';
import { TariffCandidateCodeType } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

interface FormState {
  htsCode: string;
  shipmentValueUsd: string;
  countryOfOrigin: string;
  modeOfTransport: TransportMode;
  entryDate: string;
  dateOfLoading: string;
  unitOfMeasure: string;
  quantity: string;
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

const INITIAL_FORM: FormState = {
  htsCode: '0901.90.20.00',
  shipmentValueUsd: '100000',
  countryOfOrigin: 'CN',
  modeOfTransport: 'OCEAN',
  entryDate: TODAY_ISO,
  dateOfLoading: TODAY_ISO,
  // UOM is auto-derived from the candidate-code data after the first calc.
  // Pre-calc we don't know whether this HTS line is priced per KG, NO,
  // dozen, etc., so leave it blank rather than guess.
  unitOfMeasure: '',
  quantity: '500000',
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

function exclusionKey(code: string, variant: string | null): string {
  return `${code}|${variant ?? ''}`;
}

function formatExclusionTargets(targets: { code: string; variant: string | null }[]): string {
  return targets.map((t) => (t.variant ? `${t.code} (${t.variant})` : t.code)).join(', ');
}

export default function CalculatorClient() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Set of `code|variant` keys for user-elected exclusions. Each toggle
  // re-runs the duty engine with the new selection so the duty totals stay
  // in sync with what the user has claimed.
  const [chosenExclusions, setChosenExclusions] = useState<Set<string>>(new Set());

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const submitCalculation = useCallback(
    async (currentForm: FormState, exclusions: Set<string>) => {
      setError(null);
      setSubmitting(true);
      try {
        const hts10 = digitsOnly(currentForm.htsCode);
        if (hts10.length !== 10) throw new Error('HTS code must contain 10 digits (separators are ignored).');
        const value = Number(currentForm.shipmentValueUsd);
        if (!Number.isFinite(value) || value <= 0) throw new Error('Shipment value must be a positive number.');
        const qty = Number(currentForm.quantity);
        const unitsOfMeasure: Record<string, number> = {};
        if (currentForm.unitOfMeasure.trim() && Number.isFinite(qty) && qty >= 0) {
          unitsOfMeasure[currentForm.unitOfMeasure.trim().toUpperCase()] = qty;
        }
        const body = {
          hts10,
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
        setResult((await res.json()) as CalculatorResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Calculation failed');
        setResult(null);
      } finally {
        setSubmitting(false);
      }
    },
    [setError, setSubmitting, setResult]
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Fresh form submit clears any previous user-elected exclusions — the
    // shipment may have changed (different HTS, country, dates) and the old
    // selection is no longer meaningful.
    const fresh = new Set<string>();
    setChosenExclusions(fresh);
    await submitCalculation(form, fresh);
  }

  async function toggleExclusion(key: string, applied: boolean) {
    const next = new Set(chosenExclusions);
    if (applied) next.add(key);
    else next.delete(key);
    setChosenExclusions(next);
    await submitCalculation(form, next);
  }

  // Once we have a result we know whether any candidate is priced per-unit;
  // if not, the UOM/Quantity inputs are inert and we hide them. Before the
  // first calc we leave them visible so the user can fill them in case the
  // selected HTS turns out to need a quantity.
  const hideQuantityInputs = result !== null && !result.diagnostics.requiresQuantity;
  const primaryUoms = result?.diagnostics.primaryUoms ?? [];

  // After each calc, if the candidate data tells us which UOMs this HTS line
  // is priced in, snap form.unitOfMeasure into that set. This is the
  // mechanism that switches a poultry line (HTS 0105.11.00.10) from the
  // default empty UOM to 'NO' without the user guessing. We depend on the
  // result object directly (not the derived array) so the effect doesn't
  // fire on every render when there's no result yet.
  useEffect(() => {
    const uoms = result?.diagnostics.primaryUoms ?? [];
    if (uoms.length === 0) return;
    setForm((prev) => (uoms.includes(prev.unitOfMeasure) ? prev : { ...prev, unitOfMeasure: uoms[0] }));
  }, [result]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <form onSubmit={onSubmit} className="rounded-lg border border-color p-6 space-y-4">
        <h2 className="text-xl font-semibold">Shipment</h2>

        <div>
          <label htmlFor="htsCode" className="block text-sm font-medium mb-1">
            HTS Code
          </label>
          <input
            id="htsCode"
            type="text"
            value={form.htsCode}
            onChange={(e) => update('htsCode', e.target.value)}
            placeholder="0901.90.20.00"
            className="block w-full rounded-md border border-color bg-transparent px-3 py-2 text-sm shadow-xs"
          />
          <p className="mt-1 text-xs opacity-70">Enter the 10-digit HTSUS classification (separators are optional).</p>
        </div>

        <div>
          <label htmlFor="shipmentValueUsd" className="block text-sm font-medium mb-1">
            Shipment Value (USD)
          </label>
          <input
            id="shipmentValueUsd"
            type="number"
            min="0"
            step="0.01"
            value={form.shipmentValueUsd}
            onChange={(e) => update('shipmentValueUsd', e.target.value)}
            className="block w-full rounded-md border border-color bg-transparent px-3 py-2 text-sm shadow-xs"
          />
        </div>

        <div>
          <label htmlFor="countryOfOrigin" className="block text-sm font-medium mb-1">
            Country of Origin
          </label>
          <select
            id="countryOfOrigin"
            value={form.countryOfOrigin}
            onChange={(e) => update('countryOfOrigin', e.target.value)}
            className="block w-full rounded-md border border-color bg-transparent px-3 py-2 text-sm shadow-xs"
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="modeOfTransport" className="block text-sm font-medium mb-1">
            Mode of Transport
          </label>
          <select
            id="modeOfTransport"
            value={form.modeOfTransport}
            onChange={(e) => update('modeOfTransport', e.target.value as TransportMode)}
            className="block w-full rounded-md border border-color bg-transparent px-3 py-2 text-sm shadow-xs"
          >
            {TRANSPORT_MODES.map((m) => (
              <option key={m} value={m}>
                {m.charAt(0) + m.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="entryDate" className="block text-sm font-medium mb-1">
              Entry Date
            </label>
            <input
              id="entryDate"
              type="date"
              value={form.entryDate}
              onChange={(e) => update('entryDate', e.target.value)}
              className="block w-full rounded-md border border-color bg-transparent px-3 py-2 text-sm shadow-xs"
            />
          </div>
          <div>
            <label htmlFor="dateOfLoading" className="block text-sm font-medium mb-1">
              Date of Loading
            </label>
            <input
              id="dateOfLoading"
              type="date"
              value={form.dateOfLoading}
              onChange={(e) => update('dateOfLoading', e.target.value)}
              className="block w-full rounded-md border border-color bg-transparent px-3 py-2 text-sm shadow-xs"
            />
          </div>
        </div>

        {hideQuantityInputs ? (
          <p className="text-xs opacity-70">
            UOM and quantity are not required for this HTS code — its duty rates are entirely ad-valorem (percentage of shipment value).
          </p>
        ) : (
          <>
            <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-3">
              <div>
                <label htmlFor="unitOfMeasure" className="block text-sm font-medium mb-1">
                  UOM
                </label>
                {primaryUoms.length === 1 ? (
                  <input
                    id="unitOfMeasure"
                    type="text"
                    value={primaryUoms[0]}
                    readOnly
                    className="block w-full rounded-md border border-color bg-transparent px-3 py-2 text-sm shadow-xs uppercase opacity-80"
                  />
                ) : primaryUoms.length > 1 ? (
                  <select
                    id="unitOfMeasure"
                    value={form.unitOfMeasure}
                    onChange={(e) => update('unitOfMeasure', e.target.value)}
                    className="block w-full rounded-md border border-color bg-transparent px-3 py-2 text-sm shadow-xs uppercase"
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
                    onChange={(e) => update('unitOfMeasure', e.target.value)}
                    placeholder="KG"
                    className="block w-full rounded-md border border-color bg-transparent px-3 py-2 text-sm shadow-xs uppercase"
                  />
                )}
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity}
                  onChange={(e) => update('quantity', e.target.value)}
                  className="block w-full rounded-md border border-color bg-transparent px-3 py-2 text-sm shadow-xs"
                />
              </div>
            </div>
            <p className="text-xs opacity-70">
              {primaryUoms.length > 0
                ? `This HTS line is priced per ${primaryUoms.join(' / ')} — quantity below must be in that unit.`
                : 'Required for codes priced per-unit (e.g. coffee at 1.5¢/kg). The unit is derived from the candidate-code data after the first calculation.'}
            </p>
          </>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--primary-color, #2563eb)', color: '#fff' }}
        >
          {submitting ? 'Calculating…' : 'Calculate duties'}
        </button>

        {error && <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</div>}
      </form>

      <div className="space-y-6">
        {result ? (
          <ResultPanel result={result} submitting={submitting} onToggleExclusion={toggleExclusion} />
        ) : (
          <div className="rounded-lg border border-dashed border-color p-8 text-center text-sm opacity-70">
            Fill out the shipment details and click <strong>Calculate duties</strong> to see a per-line breakdown of the applicable HTSUS rates and Chapter 99
            special tariffs.
          </div>
        )}
      </div>
    </div>
  );
}

interface ResultPanelProps {
  result: CalculatorResult;
  submitting: boolean;
  onToggleExclusion: (key: string, applied: boolean) => void;
}

function ResultPanel({ result, submitting, onToggleExclusion }: ResultPanelProps) {
  const { lines, potentialExclusions, totals, diagnostics, hts10, inputs } = result;

  return (
    <>
      <div className="rounded-lg border border-color p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Result</h2>
            <p className="text-xs opacity-70">
              HTS {hts10.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4')} · {inputs.countryOfOrigin} · {inputs.modeOfTransport}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-70">Effective duty rate</div>
            <div className="text-2xl font-semibold">{formatPercent(totals.effectiveDutyRate)}</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-color overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-color text-left text-xs uppercase opacity-70">
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Rate</th>
              <th className="px-4 py-2 text-right">Duty</th>
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
              <tr key={line.candidateId} className="border-b border-color/40 last:border-0 align-top">
                <td className="px-4 py-3">
                  <div className="font-mono text-xs">
                    {line.code}
                    {line.variant ? ` (${line.variant})` : ''}
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">
                    {line.type === TariffCandidateCodeType.SPECIAL_CODE ? line.label || 'Special code' : 'Base HTSUS rate'}
                  </div>
                  {line.notes.length > 0 && (
                    <ul className="mt-1 text-xs text-amber-600 dark:text-amber-300 list-disc list-inside">
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

      <div className="rounded-lg border border-color p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70 mb-3">Cost breakdown</h3>
        <dl className="space-y-2 text-sm">
          <Row label="Base cost" value={formatCurrency(totals.baseCost)} />
          <Row label="Total duties" value={formatCurrency(totals.totalDuties)} />
          <Row label="Harbor Maintenance Fee (HMF)" value={formatCurrency(totals.hmf)} />
          <Row label="Merchandise Processing Fee (MPF)" value={formatCurrency(totals.mpf)} />
          <Row label="Landed cost" value={formatCurrency(totals.landedCost)} bold />
        </dl>
        <p className="mt-4 text-xs opacity-60">
          Evaluated {diagnostics.candidatesEvaluated} candidate codes · {diagnostics.candidatesApplicable} applicable · {diagnostics.candidatesExcluded}{' '}
          excluded by another code.
        </p>
      </div>
    </>
  );
}

interface PotentialExclusionsPanelProps {
  exclusions: PotentialExclusion[];
  submitting: boolean;
  onToggle: (key: string, applied: boolean) => void;
}

function PotentialExclusionsPanel({ exclusions, submitting, onToggle }: PotentialExclusionsPanelProps) {
  return (
    <div className="rounded-lg border border-color p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70 mb-1">Potential exclusion codes</h3>
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
                className="mt-1 h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                checked={ex.applied}
                disabled={submitting}
                onChange={(e) => onToggle(key, e.target.checked)}
              />
              <label htmlFor={`excl-${ex.candidateId}`} className="flex-1 cursor-pointer">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-xs">
                    {ex.code}
                    {ex.variant ? ` (${ex.variant})` : ''}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                      ex.applied ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
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

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold border-t border-color pt-2 mt-2' : ''}`}>
      <dt>{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}
