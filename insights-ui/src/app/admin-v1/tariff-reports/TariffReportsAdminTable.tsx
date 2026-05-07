'use client';

import type { ChapterReportAdminListResponse, ChapterReportAdminRow } from '@/app/api/industry-tariff-reports/chapters/route';
import { CHAPTER_GENERATE_STEPS, ChapterGenerateStep, ChapterReportField } from '@/utils/tariff-reports/chapter-generate-sections';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

// Tracks per-row run progress. `currentStep` is the index of the running step in
// `CHAPTER_GENERATE_STEPS`; `error` is set if a step fails. `localStatus` overlays
// the server-fetched `fields` so completed steps flip to ✓ before the next refetch.
interface RowRunState {
  currentStep: number | null;
  error: string | null;
  localStatus: Partial<Record<ChapterReportField, boolean>>;
}

const EMPTY_RUN: RowRunState = { currentStep: null, error: null, localStatus: {} };

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
}

function ChapterRow({ row, runState, onGenerateAll }: RowProps): JSX.Element {
  const padded = row.chapter.number.toString().padStart(2, '0');
  const isRunning = runState.currentStep !== null;

  return (
    <tr className="border-b border-gray-700">
      <td className="px-3 py-3 align-top whitespace-nowrap text-sm">
        <div className="font-medium">
          {padded} — {row.chapter.title}
        </div>
        <div className="text-xs text-gray-400">slug: {row.slug}</div>
        <div className="text-xs text-gray-400">oldUrl: {row.oldUrl ?? '—'}</div>
      </td>
      {CHAPTER_GENERATE_STEPS.map((step, idx) => {
        const populated = runState.localStatus[step.field] ?? row.fields[step.field];
        const stepRunning = runState.currentStep === idx;
        return (
          <td key={step.field} className="px-2 py-3 align-top text-center">
            {stepRunning ? <RunningPill /> : <StatusPill filled={populated} />}
          </td>
        );
      })}
      <td className="px-3 py-3 align-top text-sm whitespace-nowrap">
        <button
          type="button"
          onClick={() => onGenerateAll(row.slug)}
          disabled={isRunning}
          className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium"
        >
          {isRunning ? `Running ${(runState.currentStep ?? 0) + 1}/${CHAPTER_GENERATE_STEPS.length}` : 'Generate all'}
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

  const updateRun = (slug: string, patch: Partial<RowRunState>) => {
    setRunStates((prev) => ({ ...prev, [slug]: { ...(prev[slug] ?? EMPTY_RUN), ...patch } }));
  };

  const generateAll = async (slug: string): Promise<void> => {
    updateRun(slug, { currentStep: 0, error: null, localStatus: {} });
    try {
      for (let i = 0; i < CHAPTER_GENERATE_STEPS.length; i++) {
        const step = CHAPTER_GENERATE_STEPS[i] as ChapterGenerateStep;
        updateRun(slug, { currentStep: i });
        // `postData` resolves to `undefined` (without throwing) when the API
        // returns a non-2xx. Treat that as a hard stop so we don't paint later
        // steps green while the chain has already broken — and so cascading
        // failures (e.g. tariffUpdates → executiveSummary) surface immediately.
        const result = await postData(`${getBaseUrl()}/api/industry-tariff-reports/chapters/${slug}/${step.apiPath}`, {});
        if (result === undefined) {
          updateRun(slug, { currentStep: null, error: `Step "${step.label}" failed — see server logs.` });
          await reFetchData();
          return;
        }
        // Mark this field as filled in the local overlay so the pill flips to ✓.
        setRunStates((prev) => {
          const cur = prev[slug] ?? EMPTY_RUN;
          return { ...prev, [slug]: { ...cur, localStatus: { ...cur.localStatus, [step.field]: true } } };
        });
      }
      updateRun(slug, { currentStep: null });
      await reFetchData();
    } catch (err) {
      updateRun(slug, { currentStep: null, error: err instanceof Error ? err.message : 'Generation failed' });
    }
  };

  if (loading) return <div className="py-8 text-sm">Loading tariff chapter reports...</div>;
  if (error) return <div className="py-4 text-sm text-red-500">Error: {error}</div>;
  if (!data || data.rows.length === 0) return <div className="py-4 text-sm">No tariff chapter reports found.</div>;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Chapter</th>
            {CHAPTER_GENERATE_STEPS.map((step) => (
              <th key={step.field} className="px-2 py-2 text-center text-xs font-medium text-gray-300 tracking-wider">
                {step.label}
              </th>
            ))}
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 text-gray-200">
          {data.rows.map((row) => (
            <ChapterRow key={row.slug} row={row} runState={runStates[row.slug] ?? EMPTY_RUN} onGenerateAll={generateAll} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
