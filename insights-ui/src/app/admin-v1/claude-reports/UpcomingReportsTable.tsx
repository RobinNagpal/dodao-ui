'use client';

import { UpcomingAutoGenerationStock } from '@/app/api/[spaceId]/tickers-v1/upcoming-auto-generation/route';
import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';
import React from 'react';

const HEADER_CELL = 'px-3 py-2 text-xs font-medium text-muted uppercase tracking-wider';
const BODY_CELL = 'px-3 py-2 whitespace-nowrap text-sm';

interface UpcomingReportsTableProps {
  rows: UpcomingAutoGenerationStock[];
  /** Queue position of `rows[0]`, 1-based — the row number continues across pages. */
  startRank: number;
  /**
   * How many leading rows the next batch will take, or 0 to mark none. Only set
   * when the listed markets match the configured ones; otherwise the preview is
   * hypothetical and marking a batch would be misleading.
   */
  nextBatchCount: number;
}

/** Whole days between `iso` and now — how stale the report is, which is what the queue orders by. */
function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

/** The auto-generation queue, in the order the nightly Claude job will consume it. */
export default function UpcomingReportsTable({ rows, startRank, nextBatchCount }: UpcomingReportsTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-2">
          <tr>
            <th className={`${HEADER_CELL} text-left`}>#</th>
            <th className={`${HEADER_CELL} text-left`}>Ticker</th>
            <th className={`${HEADER_CELL} text-left`}>Exchange</th>
            <th className={`${HEADER_CELL} text-left`}>Report last updated</th>
            <th className={`${HEADER_CELL} text-left`}>Days old</th>
            <th className={`${HEADER_CELL} text-left`}>Next batch</th>
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-border">
          {rows.map((row, index) => {
            const rank: number = startRank + index;
            const inNextBatch: boolean = rank <= nextBatchCount;
            return (
              <tr key={row.tickerId}>
                <td className={`${BODY_CELL} text-muted tabular-nums`}>{rank}</td>
                <td className={`${BODY_CELL} link-color`}>
                  <Link href={`/stocks/${row.exchange}/${row.symbol}`} target="_blank">
                    <span className="font-semibold">{row.symbol}</span>
                    <div className="text-xs text-muted">{row.name}</div>
                  </Link>
                </td>
                <td className={`${BODY_CELL} text-muted`}>{row.exchange}</td>
                <td className={BODY_CELL}>{new Date(row.reportLastUpdatedAt).toLocaleString()}</td>
                <td className={`${BODY_CELL} tabular-nums`}>{daysSince(row.reportLastUpdatedAt)}</td>
                <td className={BODY_CELL}>{inNextBatch ? <StatusBadge variant="info" label="Next batch" /> : null}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
