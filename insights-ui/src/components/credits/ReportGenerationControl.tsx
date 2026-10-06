'use client';

import FloatingReportCta from '@/components/ui/credits/FloatingReportCta';
import ReportFreshnessBar from '@/components/ui/credits/ReportFreshnessBar';
import RegenerateButton from '@/components/ui/credits/RegenerateButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { ReportGenerationStatusResponse, ReportSpendStatus, ReportTargetRequest, TriggerReportGenerationResponse } from '@/types/credits';
import { KoalaGainsSession } from '@/types/auth';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { formatReportAge, formatReportGeneratedDate, formatShortDate } from '@/utils/credits/credit-format';
import { CREDITS_CHANGED_EVENT, consumeCreditsPurchasedMarker, notifyCreditsChanged } from '@/utils/credits/credit-return-path';
import { REPORT_STATUS_BADGES } from '@/utils/credits/report-status-badges';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { CreditReportKind } from '@prisma/client';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

// Both are only needed once the user actually engages with the control, so they
// stay out of the report page's critical bundle.
const RegenerateReportModal = dynamic(() => import('@/components/credits/RegenerateReportModal'), { ssr: false });
const LoginPopup = dynamic(() => import('@/components/login/login-popup').then((m) => ({ default: m.LoginPopup })), { ssr: false });

export interface ReportGenerationControlProps {
  kind: CreditReportKind;
  symbol: string;
  exchange: string;
  /**
   * Server-rendered date, so the line reads correctly in the initial HTML
   * (and for logged-out visitors, who never hit the status endpoint).
   */
  lastReportGeneratedAt: string | null;
  /**
   * `full` (default): the "Report generated on …" line plus the actions, for a
   * report's main page. `section`: the actions only — a sub-report page already
   * carries its own date in `ReportSectionHeader`, so a second one would just
   * repeat it. Either way the action regenerates the whole report for one
   * credit; there is no per-section generation.
   */
  variant?: 'full' | 'section';
}

/**
 * "Report generated on … · Regenerate" — the single freshness date for a report
 * plus the paid action to refresh it.
 *
 * Logged-out visitors still see the date; only the status/credit lookup is
 * gated on a session, so the common case costs no extra request.
 */
export default function ReportGenerationControl({
  kind,
  symbol,
  exchange,
  lastReportGeneratedAt,
  variant = 'full',
}: ReportGenerationControlProps): JSX.Element {
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;

  const { showNotification } = useNotificationContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  // Once mounted the modal stays mounted, so closing it plays its exit
  // transition instead of vanishing. Same pattern as the favourite/notes buttons.
  const [hasMountedModal, setHasMountedModal] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  const statusUrl = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/report-generation?kind=${kind}&symbol=${encodeURIComponent(
    symbol
  )}&exchange=${encodeURIComponent(exchange)}`;

  const {
    data: status,
    loading: statusLoading,
    reFetchData: refetchStatus,
  } = useFetchData<ReportGenerationStatusResponse>(statusUrl, { skipInitialFetch: !session }, 'Failed to load report generation status');

  const { postData: triggerGeneration, loading: generating } = usePostData<TriggerReportGenerationResponse, ReportTargetRequest>({
    errorMessage: 'Could not start the report generation. Please try again.',
  });

  // Only the user's own paid run counts as "in progress"; admin and nightly runs
  // are never shown, so the user can always regenerate.
  const generationInProgress = status?.generationInProgress ?? false;

  // Read the clock only after mount: the server and browser would otherwise
  // disagree on "N days ago" around midnight and break hydration.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  // The date the server rendered stays authoritative until the status endpoint
  // reports a newer one, so nothing flickers on hydration.
  const reportDate = status?.lastReportGeneratedAt ?? lastReportGeneratedAt;
  const age = now ? formatReportAge(reportDate, now) : null;
  const generatedAt = formatReportGeneratedDate(reportDate);
  const generatedAtWithAge = generatedAt && age ? `${generatedAt} (${age})` : generatedAt;

  // The user's own history with this report, shown under the main date.
  // Same badges as the credits page history, so a state looks the same everywhere.
  const badge = (state: ReportSpendStatus, label: string) => <StatusBadge variant={REPORT_STATUS_BADGES[state].variant} label={label} />;
  const lastRegeneration = status?.lastRegeneration;
  const historyNote = generationInProgress
    ? badge('InProgress', REPORT_STATUS_BADGES.InProgress.label)
    : !lastRegeneration
    ? null
    : lastRegeneration.succeeded
    ? badge('Completed', `${REPORT_STATUS_BADGES.Completed.label} by you on ${formatShortDate(lastRegeneration.finishedAt)}`)
    : badge('Failed', `${REPORT_STATUS_BADGES.Failed.label} · ${formatShortDate(lastRegeneration.finishedAt)}`);

  const openModal = useCallback(async () => {
    if (!session) {
      setIsLoginPopupOpen(true);
      return;
    }
    setHasMountedModal(true);
    setIsModalOpen(true);
    await refetchStatus();
  }, [session, refetchStatus]);

  // The one place the status is re-read after anything changes it: a paid run
  // started or finished (see ReportResultNotifier) or the balance changed.
  // Declared before the Stripe-return effect so it is listening when that
  // effect fires the event on mount.
  useEffect(() => {
    if (!session) return;
    const refresh = () => void refetchStatus();
    window.addEventListener(CREDITS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(CREDITS_CHANGED_EVENT, refresh);
  }, [session, refetchStatus]);

  // Coming back from Stripe: reopen the modal with the new balance so the
  // purchase lands the user exactly where they left off rather than on a
  // confirmation dead end. The marker is cleared from the URL as it is read.
  useEffect(() => {
    if (!session || !consumeCreditsPurchasedMarker()) {
      return;
    }
    showNotification({ type: 'success', message: 'Payment received. Your credits have been added.' });
    setHasMountedModal(true);
    setIsModalOpen(true);
    // Re-reads the status here and the balance in the navbar (the webhook may
    // land after the redirect).
    notifyCreditsChanged();
  }, [session, showNotification]);

  const handleConfirm = async () => {
    const response = await triggerGeneration(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/report-generation`, { kind, symbol, exchange });

    if (!response) {
      return;
    }

    if (response.outcome === 'InsufficientCredits') {
      // Balance changed under us (another tab spent it). The modal re-renders
      // into its buy state off the refreshed status rather than erroring.
      notifyCreditsChanged();
      return;
    }

    setIsModalOpen(false);
    showNotification({
      type: 'success',
      message:
        response.outcome === 'AlreadyInProgress'
          ? `Your ${symbol} report is already being generated. You have not been charged again.`
          : `Generating a new ${symbol} report. This can take up to an hour. Refresh the page later to see it.`,
    });
    // Re-reads the status, which now reports the run as in progress.
    notifyCreditsChanged();
  };

  return (
    <>
      {variant === 'full' ? (
        <ReportFreshnessBar
          generatedAt={generatedAtWithAge}
          action={
            // Phones only: from `md` up the floating CTA below is the regenerate
            // action, and showing both at once would just be clutter.
            // Hidden entirely while the user's own run is going (the note below
            // says so). No polling: the new report shows up on the next page load.
            !generationInProgress && <RegenerateButton visibility="mobileOnly" loading={generating} onClick={openModal} />
          }
          note={historyNote}
        />
      ) : (
        // Sub-report page: the button alone, in the slot the full-report link
        // vacated on phones. The status badge lives on the main report page.
        !generationInProgress && <RegenerateButton visibility="mobileOnly" loading={generating} onClick={openModal} />
      )}

      {/* The inline button above competes with the comparison / competition /
          favourite actions, so the same action is repeated as a floating CTA —
          visible from the moment the page opens, no scroll needed. Shown to
          logged-out visitors too: `openModal` sends them to the login prompt
          first. Tablet and up only; phones keep the inline button alone. */}
      {!generationInProgress && (
        <FloatingReportCta
          label="Get the latest analysis"
          subLabel={age ? `This report was generated ${age}` : null}
          loading={generating}
          onClick={openModal}
        />
      )}

      {session && hasMountedModal && (
        <RegenerateReportModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          kind={kind}
          reportLabel={symbol}
          generatedAt={generatedAtWithAge}
          status={status}
          statusLoading={statusLoading}
          generating={generating}
          onConfirm={handleConfirm}
        />
      )}

      {!session && <LoginPopup open={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />}
    </>
  );
}
