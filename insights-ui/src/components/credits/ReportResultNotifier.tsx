'use client';

import ReportResultToast from '@/components/ui/credits/ReportResultToast';
import ReportResultToastItem from '@/components/ui/credits/ReportResultToastItem';
import StatusBadge from '@/components/ui/StatusBadge';
import TextLink from '@/components/ui/TextLink';
import { ReportResult, ReportResultsResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { notifyCreditsChanged } from '@/utils/credits/credit-return-path';
import { REPORT_STATUS_BADGES } from '@/utils/credits/report-status-badges';
import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Shares claimed results with the user's other open tabs. */
const CHANNEL_NAME = 'koalagains:report-results';

type ChannelMessage = { type: 'results'; results: ReportResult[] } | { type: 'close' };

/** At most one check a minute per tab, whatever triggers it. */
const MIN_CHECK_INTERVAL_MS = 60 * 1000;

/**
 * Plain fetch rather than usePostData: this runs in the background, so a failed
 * check should stay silent instead of showing an error toast.
 */
async function claimReportResults(): Promise<ReportResult[]> {
  try {
    const accessToken = localStorage.getItem(DODAO_ACCESS_TOKEN_KEY);
    const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/credits/report-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { 'dodao-auth-token': accessToken } : {}) },
    });
    if (!response.ok) return [];
    return ((await response.json()) as ReportResultsResponse).results;
  } catch {
    return [];
  }
}

/**
 * Tells the user when a report they paid for has finished or failed, on any
 * page. No polling: it checks once when the site loads, when the user comes
 * back to the tab, and on navigation (at most once a minute). Each result is
 * marked seen by the server, so only one tab claims it; that tab passes it to
 * the user's other open tabs, so the notice shows wherever they are looking.
 */
export default function ReportResultNotifier(): JSX.Element | null {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [results, setResults] = useState<ReportResult[]>([]);
  const lastCheckAt = useRef(0);
  const channel = useRef<BroadcastChannel | null>(null);
  const broadcast = (message: ChannelMessage) => channel.current?.postMessage(message);

  const showResults = useCallback(
    (newResults: ReportResult[]) => {
      // Skip ids already shown, in case the same results arrive twice.
      setResults((current) => [...newResults.filter((result) => !current.some((shown) => shown.id === result.id)), ...current]);
      // Either way the reserved credit was released (charged or not), and a success means the report changed:
      // refresh the balance, the regenerate status, and this page if it is the report.
      notifyCreditsChanged();
      if (newResults.some((result) => result.reportHref === window.location.pathname)) {
        router.refresh();
      }
    },
    [router]
  );

  // Results claimed or closed in another tab.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const tabs = new BroadcastChannel(CHANNEL_NAME);
    tabs.onmessage = (event: MessageEvent<ChannelMessage>) => {
      if (event.data.type === 'results') showResults(event.data.results);
      else setResults([]);
    };
    channel.current = tabs;
    return () => {
      tabs.close();
      channel.current = null;
    };
  }, [showResults]);

  const check = useCallback(async () => {
    if (!session || document.visibilityState !== 'visible') return;
    if (Date.now() - lastCheckAt.current < MIN_CHECK_INTERVAL_MS) return;
    lastCheckAt.current = Date.now();

    const newResults = await claimReportResults();
    if (newResults.length === 0) return;

    showResults(newResults);
    broadcast({ type: 'results', results: newResults });
  }, [session, showResults]);

  // Site load (once the session is known) and every navigation.
  useEffect(() => {
    void check();
  }, [check, pathname]);

  // Coming back to the tab is the moment a user who left is most likely waiting.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [check]);

  if (results.length === 0) return null;

  return (
    <ReportResultToast
      onClose={() => {
        // Closing in one tab closes it in all of them.
        setResults([]);
        broadcast({ type: 'close' });
      }}
    >
      {results.map((result) => {
        const badge = REPORT_STATUS_BADGES[result.succeeded ? 'Completed' : 'Failed'];
        const label = result.reportHref ? <TextLink href={result.reportHref}>{result.reportLabel}</TextLink> : result.reportLabel;
        return (
          <ReportResultToastItem key={result.id} badge={<StatusBadge variant={badge.variant} label={badge.label} />}>
            {label} {result.succeeded ? 'report is ready.' : "report couldn't be generated. You weren't charged."}
          </ReportResultToastItem>
        );
      })}
    </ReportResultToast>
  );
}
