'use client';

import type { InitTariffUpdatesResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/init-tariff-updates/route';
import type { ChapterReportAdminListResponse, ChapterReportAdminRow } from '@/app/api/industry-tariff-reports/chapters/route';
import { CHAPTER_GENERATE_STEPS, ChapterGenerateStep } from '@/utils/tariff-reports/chapter-generate-sections';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

// Tracks per-row run progress. `currentStep` is the index of the step currently
// being kicked off in `CHAPTER_GENERATE_STEPS`; `error` is set if a step fails
// to start. Most section routes generate ASYNCHRONOUSLY — the POST returns
// `{ status: 'started' }` immediately and the work runs in the background on the
// server (so a multi-minute Gemini call no longer 504s at the CloudFront
// origin). We intentionally do NOT poll for completion; the admin clicks
// "Refresh" to re-fetch and see which sections have landed.
interface RowRunState {
  currentStep: number | null;
  error: string | null;
}

const EMPTY_RUN: RowRunState = { currentStep: null, error: null };

function StatusPill({ filled }: { filled: boolean }): JSX.Element {
  return (
    <span
      className={`inline-block min-w-[1.5rem] text-center px-2 py-0.5 rounded-full text-xs ${
        filled ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
      }`}
    >
      {filled ? '✓' : '—'}
    </span>
  );
}

function RunningPill(): JSX.Element {
  return <span className="inline-block min-w-[1.5rem] text-center px-2 py-0.5 rounded-full text-xs bg-blue-900 text-blue-200">…</span>;
}

interface RowProps {
  row: ChapterReportAdminRow;
  runState: RowRunState;
  onGenerateAll: (slug: string) => Promise<void>;
  onGenerateSection: (slug: string, step: ChapterGenerateStep, idx: number) => Promise<void>;
}

function ChapterRow({ row, runState, onGenerateAll, onGenerateSection }: RowProps): JSX.Element {
  const padded = row.chapter.number.toString().padStart(2, '0');
  const isRunning = runState.currentStep !== null;

  return (
    <tr className="border-b border-border">
      <td className="px-3 py-3 align-top whitespace-nowrap text-sm">
        <div className="font-medium">
          {padded} — {row.chapter.title}
        </div>
        <div className="text-xs text-muted">slug: {row.slug}</div>
        <div className="text-xs text-muted">oldUrl: {row.oldUrl ?? '—'}</div>
      </td>
      {CHAPTER_GENERATE_STEPS.map((step, idx) => {
        // Pills reflect whether the section has content in the DB (from the last
        // fetch). Because generation is async and we don't poll, a section that
        // is still running shows "—" until the admin clicks Refresh.
        const populated = row.fields[step.field];
        const stepRunning = runState.currentStep === idx;
        // Per-section "Gen" generates just this section via its own route. It's
        // disabled until every prerequisite section has content (so admins can't
        // generate out of dependency order) — generate a prerequisite, click
        // Refresh, then its dependents unlock.
        const missingDeps = step.requires.filter((dep) => !row.fields[dep]);
        const blocked = missingDeps.length > 0;
        return (
          <td key={step.field} className="px-2 py-3 align-top text-center">
            <div className="flex flex-col items-center gap-1">
              {stepRunning ? <RunningPill /> : <StatusPill filled={populated} />}
              <button
                type="button"
                onClick={() => onGenerateSection(row.slug, step, idx)}
                disabled={isRunning || blocked}
                title={
                  step.requires.length === 0
                    ? 'No prerequisites'
                    : `Requires: ${step.requires.join(', ')}${blocked ? ` — missing: ${missingDeps.join(', ')}` : ''}`
                }
                className="px-1.5 py-0.5 rounded bg-surface-2 hover:bg-surface-3 disabled:bg-surface disabled:text-muted disabled:cursor-not-allowed text-heading text-[10px]"
              >
                Gen
              </button>
            </div>
          </td>
        );
      })}
      <td className="px-3 py-3 align-top text-sm whitespace-nowrap">
        <button
          type="button"
          onClick={() => onGenerateAll(row.slug)}
          disabled={isRunning}
          className="px-3 py-1.5 rounded-md bg-primary disabled:bg-surface-3 disabled:cursor-not-allowed text-heading text-xs font-medium"
        >
          {isRunning ? `Starting ${(runState.currentStep ?? 0) + 1}/${CHAPTER_GENERATE_STEPS.length}` : 'Generate all'}
        </button>
        {runState.error && <div className="mt-1 text-xs text-red-400">{runState.error}</div>}
      </td>
    </tr>
  );
}

export default function TariffReportsAdminTable(): JSX.Element {
  const apiUrl = `${getBaseUrl()}/api/industry-tariff-reports/chapters`;
  const { data, loading, error, reFetchData } = useFetchData<ChapterReportAdminListResponse>(apiUrl, {}, 'Failed to fetch tariff chapter reports');

  // Keyed by row.slug — each row tracks its own progress so multiple rows can run in series.
  const [runStates, setRunStates] = useState<Record<string, RowRunState>>({});
  // `usePostData` is generic enough to call any of the chapter-keyed generate routes.
  const { postData } = usePostData<unknown, unknown>({ successMessage: '', errorMessage: '' });
  const { postData: postInit } = usePostData<InitTariffUpdatesResponse, { date?: string }>({ successMessage: '', errorMessage: '' });
  const { postData: postCountry } = usePostData<unknown, { countryName: string }>({ successMessage: '', errorMessage: '' });

  const updateRun = (slug: string, patch: Partial<RowRunState>) => {
    setRunStates((prev) => ({ ...prev, [slug]: { ...(prev[slug] ?? EMPTY_RUN), ...patch } }));
  };

  // The bundled `generate-tariff-updates` route runs ~6 grounded LLM calls in
  // sequence, which routinely exceeds Vercel's function timeout. Split into
  // (1) init → discover top countries, (2) one POST per country. Each request
  // is a single LLM call so it stays well under any realistic timeout.
  const runTariffUpdatesStep = async (slug: string): Promise<boolean> => {
    const initUrl = `${getBaseUrl()}/api/industry-tariff-reports/chapters/${slug}/init-tariff-updates`;
    const initResult = await postInit(initUrl, {});
    if (!initResult) {
      updateRun(slug, { currentStep: null, error: `Step "tariffUpdates" failed at init step — see server logs.` });
      return false;
    }

    const countryUrl = `${getBaseUrl()}/api/industry-tariff-reports/chapters/${slug}/generate-tariff-updates`;
    const failures: string[] = [];
    for (const country of initResult.countries) {
      const countryResult = await postCountry(countryUrl, { countryName: country });
      if (countryResult === undefined) failures.push(country);
    }

    // In BACKGROUND mode `init` returns an empty country list (it kicks the
    // whole section off as one background task), so there's nothing to fan out
    // and this is a success. In SYNCHRONOUS mode, match the server-side rule
    // (`generateAllCountryTariffs` throws only if zero countries land): treat
    // the step as a failure only when nothing was persisted. Partial success
    // keeps the chain alive — downstream sections only need at least one
    // country in `tariffUpdates` to read.
    if (initResult.countries.length > 0 && failures.length === initResult.countries.length) {
      updateRun(slug, { currentStep: null, error: `Step "tariffUpdates" failed for all countries: ${failures.join(', ')}` });
      return false;
    }
    if (failures.length > 0) {
      console.warn(`tariffUpdates partial success for ${slug}; failed: ${failures.join(', ')}`);
    }
    return true;
  };

  const generateAll = async (slug: string): Promise<void> => {
    updateRun(slug, { currentStep: 0, error: null });
    try {
      for (let i = 0; i < CHAPTER_GENERATE_STEPS.length; i++) {
        const step = CHAPTER_GENERATE_STEPS[i] as ChapterGenerateStep;
        updateRun(slug, { currentStep: i });

        let succeeded: boolean;
        if (step.field === 'tariffUpdates') {
          // Still synchronous: the two-phase init + per-country fan-out is
          // already chunked into single LLM calls that finish within the request.
          succeeded = await runTariffUpdatesStep(slug);
        } else {
          // These routes kick the section off in the background and return
          // `{ status: 'started' }` immediately. `postData` resolves to
          // `undefined` (without throwing) on a non-2xx, which here means the
          // section failed to even *start*. We do NOT wait for completion — the
          // sections are fired in dependency order and the admin clicks Refresh
          // to see when they land.
          const startResult = await postData(`${getBaseUrl()}/api/industry-tariff-reports/chapters/${slug}/${step.apiPath}`, {});
          succeeded = startResult !== undefined;
          if (!succeeded) {
            updateRun(slug, { currentStep: null, error: `Step "${step.label}" failed to start — see server logs.` });
          }
        }

        if (!succeeded) {
          await reFetchData();
          return;
        }
      }
      updateRun(slug, { currentStep: null });
      await reFetchData();
    } catch (err) {
      updateRun(slug, { currentStep: null, error: err instanceof Error ? err.message : 'Generation failed' });
    }
  };

  // Generate a single section via its own route — the "generate one, then wait"
  // flow. Same per-mode behavior as a step inside `generateAll`: background mode
  // returns immediately, synchronous mode waits. We intentionally do NOT
  // re-fetch afterward: re-fetching flips `loading` back on and re-renders the
  // whole table (resetting the admin's scroll position), which is jarring after
  // a single "Gen" click. The admin clicks "Refresh" when they want to pull the
  // latest generation status.
  const generateSection = async (slug: string, step: ChapterGenerateStep, idx: number): Promise<void> => {
    updateRun(slug, { currentStep: idx, error: null });
    try {
      let succeeded: boolean;
      if (step.field === 'tariffUpdates') {
        succeeded = await runTariffUpdatesStep(slug);
      } else {
        const startResult = await postData(`${getBaseUrl()}/api/industry-tariff-reports/chapters/${slug}/${step.apiPath}`, {});
        succeeded = startResult !== undefined;
        if (!succeeded) {
          updateRun(slug, { error: `Step "${step.label}" failed to start — see server logs.` });
        }
      }
      updateRun(slug, { currentStep: null });
    } catch (err) {
      updateRun(slug, { currentStep: null, error: err instanceof Error ? err.message : 'Generation failed' });
    }
  };

  if (loading) return <div className="py-8 text-sm">Loading tariff chapter reports...</div>;
  if (error) return <div className="py-4 text-sm text-red-500">Error: {error}</div>;
  if (!data || data.rows.length === 0) return <div className="py-4 text-sm">No tariff chapter reports found.</div>;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          “Generate all” runs every section; per-column “Gen” runs one section. Generation is async — click “Refresh” to update the statuses below.
        </p>
        <button
          type="button"
          onClick={() => reFetchData()}
          className="px-3 py-1.5 rounded-md bg-surface-2 hover:bg-surface-3 text-heading text-xs font-medium whitespace-nowrap"
        >
          Refresh
        </button>
      </div>

      <details className="mb-3 rounded-md border border-border bg-surface p-3 text-xs text-muted">
        <summary className="cursor-pointer text-muted">
          Generation order &amp; dependencies — generate a section only after its prerequisites show ✓ (its “Gen” button stays disabled until then)
        </summary>
        <ul className="mt-2 list-disc space-y-0.5 pl-5">
          {CHAPTER_GENERATE_STEPS.map((step) => (
            <li key={step.field}>
              <span className="text-body">{step.label}</span>
              {step.requires.length === 0 ? ' — no prerequisites' : ` — needs ${step.requires.join(', ')}`}
            </li>
          ))}
        </ul>
        <ul className="mt-2 list-disc space-y-0.5 pl-5">
          <li>industryAreas is the headings tree — generate it first; every section needs it.</li>
          <li>tariffEngineering uses tariffUpdates if present, but does not require it.</li>
          <li>seoDetails should be generated last — it summarizes every other section.</li>
        </ul>
      </details>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted uppercase tracking-wider">Chapter</th>
              {CHAPTER_GENERATE_STEPS.map((step) => (
                <th key={step.field} className="px-2 py-2 text-center text-xs font-medium text-muted tracking-wider">
                  {step.label}
                </th>
              ))}
              <th className="px-3 py-2 text-left text-xs font-medium text-muted uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-bg text-body">
            {data.rows.map((row) => (
              <ChapterRow
                key={row.slug}
                row={row}
                runState={runStates[row.slug] ?? EMPTY_RUN}
                onGenerateAll={generateAll}
                onGenerateSection={generateSection}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
