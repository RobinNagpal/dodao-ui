'use client';

import { CreditReceiptResponse } from '@/types/credits';
import { callCreditApi } from '@/utils/credits/credit-api-client';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useState } from 'react';

export interface ReceiptButtonProps {
  /** The purchase row in the credit history. */
  transactionId: string;
}

/** Opens the Stripe receipt for one credit purchase in a new tab. */
export default function ReceiptButton({ transactionId }: ReceiptButtonProps): JSX.Element {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotificationContext();

  const openReceipt = async () => {
    // Open the tab inside the click itself; a tab opened after the request
    // finishes would be blocked as a popup.
    const tab = window.open('', '_blank');
    setLoading(true);
    const result = await callCreditApi<CreditReceiptResponse>(`users/credits/receipt?transactionId=${encodeURIComponent(transactionId)}`);
    setLoading(false);
    const receiptUrl = result.ok ? result.data.receiptUrl : null;

    if (!receiptUrl) {
      // Any failure, including a non-2xx answer, gets a visible error: the
      // blank tab closing on its own would otherwise look like nothing happened.
      tab?.close();
      showNotification({ type: 'error', message: 'Could not open the receipt. Please try again.' });
      return;
    }

    if (tab) {
      tab.opener = null;
      tab.location.href = receiptUrl;
    } else {
      // Popups are blocked: open it in this tab instead.
      window.location.href = receiptUrl;
    }
  };

  return (
    <Button size="sm" variant="text" removeBorder loading={loading} disabled={loading} onClick={openReceipt}>
      Receipt
    </Button>
  );
}
