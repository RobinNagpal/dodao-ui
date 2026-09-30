'use client';

import ReportFreshnessBar from '@/components/ui/credits/ReportFreshnessBar';
import { ReportGenerationStatusResponse, ReportTargetRequest, TriggerReportGenerationResponse } from '@/types/credits';
import { KoalaGainsSession } from '@/types/auth';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { formatReportGeneratedDate } from '@/utils/credits/credit-format';
import { consumeCreditsPurchasedMarker, notifyCreditsChanged } from '@/utils/credits/credit-return-path';
import Button from '@dodao/web-core/components/core/buttons/Button';
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
}

/**
 * "Report generated on … · Regenerate" — the single freshness date for a report
 * plus the paid action to refresh it.
 *
 * Logged-out visitors still see the date; only the status/credit lookup is
 * gated on a session, so the common case costs no extra request.
 */
export default function ReportGenerationControl({ kind, symbol, exchange, lastReportGeneratedAt }: ReportGenerationControlProps): JSX.Element {
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

  const [inProgress, setInProgress] = useState(false);
  const generationInProgress = inProgress || status?.generationInProgress || false;

  // The date the server rendered stays authoritative until the status endpoint
  // reports a newer one, so nothing flickers on hydration.
  const generatedAt = formatReportGeneratedDate(status?.lastReportGeneratedAt ?? lastReportGeneratedAt);

  const openModal = useCallback(async () => {
    if (!session) {
      setIsLoginPopupOpen(true);
      return;
    }
    setHasMountedModal(true);
    setIsModalOpen(true);
    await refetchStatus();
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
    void refetchStatus();
    // The webhook may land after the redirect, so the navbar re-reads too.
    notifyCreditsChanged();
  }, [session, showNotification, refetchStatus]);

  const handleConfirm = async () => {
    const response = await triggerGeneration(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/report-generation`, { kind, symbol, exchange });

    if (!response) {
      return;
    }

    if (response.outcome === 'InsufficientCredits') {
      // Balance changed under us (another tab spent it). The modal re-renders
      // into its buy state off the refreshed status rather than erroring.
      await refetchStatus();
      notifyCreditsChanged();
      return;
    }

    setInProgress(true);
    setIsModalOpen(false);
    showNotification({
      type: 'success',
      message:
        response.outcome === 'AlreadyInProgress'
          ? `A ${symbol} report is already being generated. You have not been charged.`
          : `Generating a new ${symbol} report. This can take up to an hour. Refresh the page later to see it.`,
    });
    await refetchStatus();
    notifyCreditsChanged();
  };

  return (
    <>
      <ReportFreshnessBar
        generatedAt={generatedAt}
        action={
          // No polling while a generation runs: it can take up to an hour, and the
          // page's own cache refresh picks up the new report once it is saved.
          generationInProgress ? (
            <span>· Your new report is being generated. This can take up to an hour.</span>
          ) : (
            <Button size="sm" variant="text" removeBorder loading={generating} disabled={generating} onClick={openModal}>
              Regenerate
            </Button>
          )
        }
      />

      {session && hasMountedModal && (
        <RegenerateReportModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          reportLabel={symbol}
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
