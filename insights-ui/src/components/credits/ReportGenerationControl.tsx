'use client';

import { useCheckoutReturn } from '@/hooks/useCheckoutReturn';
import { publishCreditBalance, useCreditBalance, useCreditBalanceProvider } from '@/hooks/useCreditBalance';
import { usePurchasesEnabled } from '@/hooks/usePurchasesEnabled';
import FloatingReportCta from '@/components/ui/credits/FloatingReportCta';
import ReportFreshnessBar from '@/components/ui/credits/ReportFreshnessBar';
import RegenerateButton from '@/components/ui/credits/RegenerateButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { CREDITS_PER_REPORT, ReportGenerationStatusResponse, ReportTargetRequest, TriggerReportGenerationResponse } from '@/types/credits';
import { KoalaGainsSession } from '@/types/auth';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { formatReportAge, formatReportGeneratedDate, formatShortDate } from '@/utils/credits/credit-format';
import { CREDITS_CHANGED_EVENT, notifyCreditsChanged } from '@/utils/credits/credit-return-path';
import { REPORT_STATUS_BADGES } from '@/utils/credits/report-status-badges';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { CreditReportKind, ReportSpendStatus } from '@prisma/client';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

// Both are only needed once the user actually engages with the control, so they
// stay out of the report page's critical bundle.
const RegenerateReportModal = dynamic(() => import('@/components/credits/RegenerateReportModal'), { ssr: false });
const LoginPopup = dynamic(() => import('@/components/login/login-popup').then((m) => ({ default: m.LoginPopup })), { ssr: false });

/**
 * What to tell the user when a run did not start, keyed by outcome. The
 * server's own `message` wins when it sends one; unknown future outcomes fall
 * back to the generic line rather than breaking the control.
 */
const REFUSED_OUTCOME_MESSAGES: Record<string, string> = {
  TooManyInProgress: 'You already have 3 reports generating. Please wait for one to finish.',
  TemporarilyUnavailable: 'This report is failing to generate right now. Please try again later.',
};
const GENERIC_REFUSED_MESSAGE = 'We could not start this report right now. You have not been charged. Please try again later.';

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
  const { data: koalaSession, status: sessionStatus } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;
  const sessionLoading = sessionStatus === 'loading';

  const { showNotification } = useNotificationContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  // Once mounted the modal stays mounted, so closing it plays its exit
  // transition instead of vanishing. Same pattern as the favourite/notes buttons.
  const [hasMountedModal, setHasMountedModal] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  // Shown at the top of the modal after the server refused a spend.
  const [modalNotice, setModalNotice] = useState<string | null>(null);

  const statusUrl = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/report-generation?kind=${kind}&symbol=${encodeURIComponent(
    symbol
  )}&exchange=${encodeURIComponent(exchange)}`;

  const {
    data: status,
    loading: statusLoading,
    reFetchData: refetchStatus,
  } = useFetchData<ReportGenerationStatusResponse>(statusUrl, { skipInitialFetch: !session }, 'Failed to load report generation status');

  // The status already carries the balance, so this control is the page's
  // balance source: the navbar shows the number published here instead of
  // asking the server (and Stripe) for it a second time.
  useCreditBalanceProvider(Boolean(session));
  useEffect(() => {
    if (status) publishCreditBalance(status.credits, status.stripeUnavailable);
  }, [status]);
  const balance = useCreditBalance(Boolean(session));

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
  const badge = (state: ReportSpendStatus, label: string) => (
    <StatusBadge variant={REPORT_STATUS_BADGES[state].variant} spinning={REPORT_STATUS_BADGES[state].spinning} label={label} />
  );
  const lastRegeneration = status?.lastRegeneration;
  const historyNote = generationInProgress
    ? badge(ReportSpendStatus.InProgress, REPORT_STATUS_BADGES.InProgress.label)
    : !lastRegeneration
    ? null
    : lastRegeneration.succeeded
    ? badge(ReportSpendStatus.Completed, `${REPORT_STATUS_BADGES.Completed.label} by you on ${formatShortDate(lastRegeneration.finishedAt)}`)
    : badge(ReportSpendStatus.Failed, `${REPORT_STATUS_BADGES.Failed.label} · ${formatShortDate(lastRegeneration.finishedAt)}`);

  const showModal = useCallback(() => {
    setModalNotice(null);
    setHasMountedModal(true);
    setIsModalOpen(true);
  }, []);

  // A click while the session is still loading is remembered and replayed once
  // it resolves, rather than flashing the login prompt at a signed-in user.
  const [openWhenSessionLoads, setOpenWhenSessionLoads] = useState(false);

  const openModal = useCallback(async () => {
    if (sessionLoading) {
      setOpenWhenSessionLoads(true);
      return;
    }
    if (!session) {
      setIsLoginPopupOpen(true);
      return;
    }
    showModal();
    await refetchStatus();
  }, [session, sessionLoading, showModal, refetchStatus]);

  useEffect(() => {
    if (openWhenSessionLoads && !sessionLoading) {
      setOpenWhenSessionLoads(false);
      void openModal();
    }
  }, [openWhenSessionLoads, sessionLoading, openModal]);

  // The one place the status is re-read after anything changes it: a paid run
  // started or finished (see ReportResultNotifier) or the balance changed.
  // Declared before the Stripe-return hook so it is listening when that hook
  // fires the event.
  useEffect(() => {
    if (!session) return;
    const refresh = () => void refetchStatus();
    window.addEventListener(CREDITS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(CREDITS_CHANGED_EVENT, refresh);
  }, [session, refetchStatus]);

  // Coming back from Stripe: reopen the modal right away ("Adding your
  // credits…" while the purchase is confirmed), then with the new balance, so
  // the purchase lands the user exactly where they left off.
  const checkoutReturn = useCheckoutReturn(Boolean(session), showModal);

  // Buying can be switched off by an admin. Only asked for when it matters:
  // signed out (the CTA would lead to buying) or once the balance is known to
  // be too low. The answer is shared with the navbar, so it is one request.
  const canAffordFromBalance = typeof balance === 'number' && balance >= CREDITS_PER_REPORT;
  const purchasesEnabled = usePurchasesEnabled(!sessionLoading && (!session || (balance !== undefined && !canAffordFromBalance)));

  // With buying off, the floating CTA is only for users who can actually
  // regenerate; for anyone else it would lead to a dead end.
  const ctaUseful = canAffordFromBalance || purchasesEnabled !== false;

  const handleConfirm = async () => {
    const response = await triggerGeneration(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/report-generation`, { kind, symbol, exchange });

    if (!response) {
      return;
    }

    // Matched as a string so an outcome added on the server later still lands
    // in the default branch instead of being mistaken for a start.
    const outcome: string = response.outcome;
    const serverMessage = response.message?.trim() || null;

    if (outcome === 'InsufficientCredits') {
      // Balance changed under us (another tab spent it). The modal re-renders
      // into its buy state off the refreshed status rather than erroring.
      setModalNotice(purchasesEnabled === false ? 'Your balance changed.' : 'Your balance changed — pick a pack to continue.');
      notifyCreditsChanged();
      return;
    }

    if (outcome === 'Started' || outcome === 'AlreadyInProgress') {
      setIsModalOpen(false);
      showNotification({
        type: 'success',
        message:
          outcome === 'AlreadyInProgress'
            ? `Your ${symbol} report is already being generated. You have not been charged again.`
            : `Generating a new ${symbol} report. This can take up to an hour. Refresh the page later to see it.`,
      });
      // Re-reads the status, which now reports the run as in progress.
      notifyCreditsChanged();
      return;
    }

    // Refused (too many runs going, report failing, or an outcome this build
    // doesn't know yet): nothing was charged.
    setIsModalOpen(false);
    showNotification({
      type: 'info',
      message: serverMessage ?? REFUSED_OUTCOME_MESSAGES[outcome] ?? GENERIC_REFUSED_MESSAGE,
      duration: 6000,
    });
    notifyCreditsChanged();
  };

  // The floating CTA sits above the page (z-40) but below nothing that a
  // `relative z-10` modal establishes, so it is hidden while a dialog is open.
  const dialogOpen = isModalOpen || isLoginPopupOpen;

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
      {!generationInProgress && !dialogOpen && ctaUseful && (
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
          reportLabel={symbol}
          generatedAt={generatedAt}
          status={status}
          statusLoading={statusLoading}
          generating={generating}
          addingCredits={checkoutReturn === 'confirming'}
          purchasesEnabled={purchasesEnabled}
          notice={modalNotice}
          onConfirm={handleConfirm}
        />
      )}

      {!session && <LoginPopup open={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />}
    </>
  );
}
