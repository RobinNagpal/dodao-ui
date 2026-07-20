'use client';

import { TickerV1GenerationRequestWithTicker } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import { GenerationRequestStatus, ReportType } from '@/types/ticker-typesv1';
import { getScoreColorClasses } from '@/utils/score-utils';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

/** Canonical list of report flags we render, in column order. */
export type GenerationReportField = keyof Pick<
  TickerV1GenerationRequestWithTicker,
  | 'regenerateCompetition'
  | 'regenerateFinancialAnalysis'
  | 'regenerateBusinessAndMoat'
  | 'regeneratePastPerformance'
  | 'regenerateFutureGrowth'
  | 'regenerateFairValue'
  | 'regenerateManagementTeam'
  | 'regenerateFinalSummary'
>;

export const REGENERATE_FIELDS: GenerationReportField[] = [
  'regenerateCompetition',
  'regenerateFinancialAnalysis',
  'regenerateBusinessAndMoat',
  'regeneratePastPerformance',
  'regenerateFutureGrowth',
  'regenerateFairValue',
  'regenerateManagementTeam',
  'regenerateFinalSummary',
];

export type GenerationRequestWithFlags = TickerV1GenerationRequestWithTicker;

const FIELD_LABELS: Record<GenerationReportField, string> = {
  regenerateCompetition: 'Competition',
  regenerateFinancialAnalysis: 'Financial Analysis',
  regenerateBusinessAndMoat: 'Business & Moat',
  regeneratePastPerformance: 'Past Perf.',
  regenerateFutureGrowth: 'Future Growth',
  regenerateFairValue: 'Fair Value',
  regenerateManagementTeam: 'Management Team',
  regenerateFinalSummary: 'Summary/Meta/About',
};

const FIELD_TO_STEP_MAP: Record<GenerationReportField, ReportType> = {
  regenerateCompetition: ReportType.COMPETITION,
  regenerateFinancialAnalysis: ReportType.FINANCIAL_ANALYSIS,
  regenerateBusinessAndMoat: ReportType.BUSINESS_AND_MOAT,
  regeneratePastPerformance: ReportType.PAST_PERFORMANCE,
  regenerateFutureGrowth: ReportType.FUTURE_GROWTH,
  regenerateFairValue: ReportType.FAIR_VALUE,
  regenerateManagementTeam: ReportType.MANAGEMENT_TEAM,
  regenerateFinalSummary: ReportType.FINAL_SUMMARY,
};

interface StatusDotProps {
  isEnabled: boolean;
  stepName: ReportType;
  completedSteps: ReportType[];
  failedSteps: ReportType[];
  inProgressStep?: ReportType | null;
}

export function StatusDot({ isEnabled, stepName, completedSteps, failedSteps, inProgressStep }: StatusDotProps): JSX.Element {
  if (!isEnabled) return <div className="w-3 h-3 rounded-full bg-gray-400" title="Not enabled" />;
  if (failedSteps.includes(stepName)) return <div className="w-3 h-3 rounded-full bg-red-500" title="Failed" />;
  if (completedSteps.includes(stepName)) return <div className="w-3 h-3 rounded-full bg-green-500" title="Completed" />;
  if (inProgressStep && inProgressStep === stepName) return <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" title="In Progress" />;
  return <div className="w-3 h-3 rounded-full bg-blue-500" title="Pending" />;
}

/** Total score badge (out of 25) shown next to the ticker symbol. */
function ScoreBadge({ score }: { score: number | null | undefined }): JSX.Element {
  const { textColorClass, bgColorClass } = getScoreColorClasses(score ?? 0);
  return (
    <span className={`${textColorClass} ${bgColorClass} bg-opacity-15 rounded px-1 font-mono tabular-nums text-xs`} title="Total score (out of 25)">
      {score ?? '—'}/25
    </span>
  );
}

function StatusPill({ status }: { status: GenerationRequestStatus }): JSX.Element {
  const toneClass =
    status === GenerationRequestStatus.InProgress
      ? 'bg-blue-900 text-blue-200'
      : status === GenerationRequestStatus.NotStarted
      ? 'bg-gray-700 text-gray-200'
      : status === GenerationRequestStatus.Failed
      ? 'bg-red-900 text-red-200'
      : 'bg-green-900 text-green-200';
  return <span className={`px-2 py-0.5 rounded-full text-xs ${toneClass}`}>{status}</span>;
}

const HEADER_CELL = 'px-3 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider';
const BODY_CELL = 'px-3 py-2 whitespace-nowrap text-sm text-center';

interface GenerationRequestsTableProps {
  rows: GenerationRequestWithFlags[];
  onReloadRequest: (request: GenerationRequestWithFlags) => void;
}

export default function GenerationRequestsTable({ rows, onReloadRequest }: GenerationRequestsTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-700">
          <tr>
            <th className={`${HEADER_CELL} text-left sticky left-0 bg-gray-700 z-10`}>Ticker</th>
            <th className={HEADER_CELL}>Industry</th>
            {REGENERATE_FIELDS.map((field) => (
              <th key={field} className={HEADER_CELL}>
                {FIELD_LABELS[field]}
              </th>
            ))}
            <th className={HEADER_CELL}>Status</th>
            <th className={HEADER_CELL}>Updated At</th>
            <th className={HEADER_CELL}>Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {rows.map((request) => {
            const { exchange, symbol } = request.ticker;
            const completedSteps: ReportType[] = (request.completedSteps as ReportType[] | undefined) ?? [];
            const failedSteps: ReportType[] = (request.failedSteps as ReportType[] | undefined) ?? [];
            const inProgressStep: ReportType | null = (request.inProgressStep as ReportType | undefined) ?? null;
            const isFailed: boolean = request.status === GenerationRequestStatus.Failed;
            return (
              <tr key={request.id}>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium sticky left-0 bg-gray-800 z-10 link-color">
                  <Link href={`/stocks/${exchange}/${symbol}`} target="_blank">
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={request.ticker.cachedScoreEntry?.finalScore} />
                      <span className="font-semibold">{symbol}</span>
                      <span className="text-blue-400 text-xs">({exchange})</span>
                    </div>
                    <div className="text-xs text-gray-400">{request.ticker.name}</div>
                  </Link>
                  <div className="text-[11px] text-gray-500 mt-1 whitespace-nowrap" title="LLM provider · model used for this request">
                    {request.llmProvider || request.llmModel ? `${request.llmProvider ?? '—'} · ${request.llmModel ?? '—'}` : 'default LLM'}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="text-xs text-gray-400">
                    {request.ticker.industry?.name || 'Unknown Industry'}
                    <br />
                    {request.ticker.subIndustry?.name || 'Unknown Sub-Industry'}
                  </div>
                </td>
                {REGENERATE_FIELDS.map((field) => (
                  <td key={`${symbol}-${field}`} className={BODY_CELL}>
                    <div className="flex justify-center">
                      <StatusDot
                        isEnabled={Boolean(request[field])}
                        stepName={FIELD_TO_STEP_MAP[field]}
                        completedSteps={completedSteps}
                        failedSteps={failedSteps}
                        inProgressStep={inProgressStep}
                      />
                    </div>
                  </td>
                ))}
                <td className={BODY_CELL}>
                  <StatusPill status={request.status as GenerationRequestStatus} />
                </td>
                <td className={BODY_CELL}>{new Date(request.updatedAt || request.createdAt).toLocaleString()}</td>
                <td className={BODY_CELL}>
                  {isFailed && failedSteps.length > 0 && (
                    <button
                      onClick={() => onReloadRequest(request)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Reload failed request"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
