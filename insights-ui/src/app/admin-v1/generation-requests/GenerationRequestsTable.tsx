'use client';

import { TickerV1GenerationRequestWithTicker } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import { analysisTypes, GenerationRequestStatus, ReportType } from '@/types/ticker-typesv1';
import { calculatePendingSteps } from '@/utils/analysis-reports/report-steps-statuses';
import { getScoreColorClasses } from '@/utils/score-utils';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

export type GenerationRequestWithFlags = TickerV1GenerationRequestWithTicker;

interface StatusDotProps {
  stepName: ReportType;
  completedSteps: ReportType[];
  failedSteps: ReportType[];
  pendingSteps: ReportType[];
  inProgressStep: ReportType | null;
}

// A step is "enabled" (part of this request) when it shows up in one of the step
// arrays the request already carries — completed, failed, or pending (pending also
// covers the in-progress step). Anything else was not requested, so it stays gray.
function StatusDot({ stepName, completedSteps, failedSteps, pendingSteps, inProgressStep }: StatusDotProps): JSX.Element {
  if (failedSteps.includes(stepName)) return <div className="w-3 h-3 rounded-full bg-red-500" title="Failed" />;
  if (completedSteps.includes(stepName)) return <div className="w-3 h-3 rounded-full bg-green-500" title="Completed" />;
  if (inProgressStep === stepName) return <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" title="In Progress" />;
  if (pendingSteps.includes(stepName)) return <div className="w-3 h-3 rounded-full bg-blue-500" title="Pending" />;
  return <div className="w-3 h-3 rounded-full bg-surface-3" title="Not enabled" />;
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
      ? 'bg-surface-2 text-body'
      : status === GenerationRequestStatus.Failed
      ? 'bg-red-900 text-red-200'
      : 'bg-green-900 text-green-200';
  return <span className={`px-2 py-0.5 rounded-full text-xs ${toneClass}`}>{status}</span>;
}

const HEADER_CELL = 'px-3 py-2 text-xs font-medium text-muted uppercase tracking-wider';
const BODY_CELL = 'px-3 py-2 whitespace-nowrap text-sm text-center';

interface GenerationRequestsTableProps {
  rows: GenerationRequestWithFlags[];
  onReloadRequest: (request: GenerationRequestWithFlags) => void;
}

export default function GenerationRequestsTable({ rows, onReloadRequest }: GenerationRequestsTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-2">
          <tr>
            <th className={`${HEADER_CELL} text-left sticky left-0 bg-surface-2 z-10`}>Ticker</th>
            <th className={HEADER_CELL}>Industry</th>
            {analysisTypes.map(({ key, label }) => (
              <th key={key} className={HEADER_CELL}>
                {label}
              </th>
            ))}
            <th className={HEADER_CELL}>Status</th>
            <th className={HEADER_CELL}>Updated At</th>
            <th className={HEADER_CELL}>Actions</th>
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-border">
          {rows.map((request) => {
            const { exchange, symbol } = request.ticker;
            const completedSteps: ReportType[] = (request.completedSteps as ReportType[] | undefined) ?? [];
            const failedSteps: ReportType[] = (request.failedSteps as ReportType[] | undefined) ?? [];
            const inProgressStep: ReportType | null = (request.inProgressStep as ReportType | undefined) ?? null;
            const pendingSteps: ReportType[] = request.pendingSteps ?? calculatePendingSteps(request);
            const isFailed: boolean = request.status === GenerationRequestStatus.Failed;
            return (
              <tr key={request.id}>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium sticky left-0 bg-surface z-10 link-color">
                  <Link href={`/stocks/${exchange}/${symbol}`} target="_blank">
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={request.ticker.cachedScoreEntry?.finalScore} />
                      <span className="font-semibold">{symbol}</span>
                      <span className="text-link text-xs">({exchange})</span>
                    </div>
                    <div className="text-xs text-muted">{request.ticker.name}</div>
                  </Link>
                  <div className="text-[11px] text-muted mt-1 whitespace-nowrap" title="LLM provider · model used for this request">
                    {request.llmProvider || request.llmModel ? `${request.llmProvider ?? '—'} · ${request.llmModel ?? '—'}` : 'default LLM'}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="text-xs text-muted">
                    {request.ticker.industry?.name || 'Unknown Industry'}
                    <br />
                    {request.ticker.subIndustry?.name || 'Unknown Sub-Industry'}
                  </div>
                </td>
                {analysisTypes.map(({ key }) => (
                  <td key={`${symbol}-${key}`} className={BODY_CELL}>
                    <div className="flex justify-center">
                      <StatusDot
                        stepName={key}
                        completedSteps={completedSteps}
                        failedSteps={failedSteps}
                        pendingSteps={pendingSteps}
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
                    <button onClick={() => onReloadRequest(request)} className="text-link hover:text-link transition-colors" title="Reload failed request">
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
