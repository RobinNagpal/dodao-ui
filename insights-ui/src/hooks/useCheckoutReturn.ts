import { publishCreditBalance } from '@/hooks/useCreditBalance';
import { ConfirmCheckoutRequest, ConfirmCheckoutResponse } from '@/types/credits';
import { callCreditApi } from '@/utils/credits/credit-api-client';
import { consumeCheckoutReturn, notifyCreditsChanged } from '@/utils/credits/credit-return-path';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useEffect, useRef, useState } from 'react';

/** `confirming` while "Adding your credits…" should show; `done` once settled either way. */
export type CheckoutReturnState = 'idle' | 'confirming' | 'done';

const RETRY_INTERVAL_MS = 2000;
const GIVE_UP_AFTER_MS = 30 * 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ConfirmOutcome = ConfirmCheckoutResponse['status'] | 'timeout';

/**
 * Asks the server to confirm the Checkout Session until the credits are on the
 * balance. The webhook normally grants them, but it can land after the user is
 * already back; confirming the session directly closes that gap. Retries
 * quietly (no error toasts) every ~2s for up to ~30s.
 */
async function confirmUntilCredited(sessionId: string): Promise<ConfirmOutcome> {
  const deadline = Date.now() + GIVE_UP_AFTER_MS;
  let lastStatus: ConfirmCheckoutResponse['status'] | null = null;

  for (;;) {
    const result = await callCreditApi<ConfirmCheckoutResponse>('users/credits/confirm-checkout', {
      method: 'POST',
      body: { sessionId } satisfies ConfirmCheckoutRequest,
    });
    if (result.ok) {
      lastStatus = result.data.status;
      if (lastStatus === 'credited' || lastStatus === 'already_credited') {
        publishCreditBalance(result.data.credits, false);
        return lastStatus;
      }
      // Not paid is final: nothing will change by asking again.
      if (lastStatus === 'not_paid') return lastStatus;
    }
    if (Date.now() + RETRY_INTERVAL_MS > deadline) {
      return lastStatus === 'pending' ? 'pending' : 'timeout';
    }
    await sleep(RETRY_INTERVAL_MS);
  }
}

const OUTCOME_MESSAGES: Record<ConfirmOutcome, { type: 'success' | 'info'; message: string }> = {
  credited: { type: 'success', message: 'Payment received. Your credits have been added.' },
  already_credited: { type: 'success', message: 'Payment received. Your credits have been added.' },
  pending: { type: 'info', message: 'Payment received — your credits will appear once the payment clears.' },
  not_paid: { type: 'info', message: 'We could not confirm a payment for this checkout. If you were charged, your credits will appear shortly.' },
  timeout: { type: 'info', message: 'Payment received — your credits will appear shortly.' },
};

/**
 * Handles the return leg of Stripe Checkout on whatever page the user came back
 * to: reads (and clears) the markers from the URL, confirms the session, then
 * tells the user and refreshes every balance on the page. `onReturn` fires
 * once, as soon as a return is detected (e.g. to reopen the regenerate modal).
 * Waits for `enabled` (a signed-in session) before reading the URL.
 */
export function useCheckoutReturn(enabled: boolean, onReturn?: () => void): CheckoutReturnState {
  const { showNotification } = useNotificationContext();
  const [state, setState] = useState<CheckoutReturnState>('idle');
  const onReturnRef = useRef(onReturn);
  onReturnRef.current = onReturn;

  useEffect(() => {
    if (!enabled) return;
    const checkoutReturn = consumeCheckoutReturn();
    if (!checkoutReturn) return;

    onReturnRef.current?.();
    setState('confirming');
    // Deliberately not cancelled on unmount: the URL marker is already gone,
    // so this is the only chance to confirm (React ignores the late setState).
    void (async () => {
      const outcome: ConfirmOutcome = checkoutReturn.sessionId ? await confirmUntilCredited(checkoutReturn.sessionId) : 'timeout';
      showNotification({ ...OUTCOME_MESSAGES[outcome], duration: 6000 });
      // Re-reads the balance in the navbar and the status in the regenerate control.
      notifyCreditsChanged();
      setState('done');
    })();
  }, [enabled, showNotification]);

  return state;
}
