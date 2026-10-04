'use client';

import { CreditReceiptResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export interface ReceiptButtonProps {
  /** The purchase row in the credit history. */
  transactionId: string;
}

/** Opens the Stripe receipt for one credit purchase in a new tab. */
export default function ReceiptButton({ transactionId }: ReceiptButtonProps): JSX.Element {
  const { loading, reFetchData } = useFetchData<CreditReceiptResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/credits/receipt?transactionId=${encodeURIComponent(transactionId)}`,
    { skipInitialFetch: true },
    'Could not open the receipt. Please try again.'
  );

  const openReceipt = async () => {
    // Open the tab inside the click itself; a tab opened after the request
    // finishes would be blocked as a popup.
    const tab = window.open('', '_blank');
    const receiptUrl = (await reFetchData())?.receiptUrl;

    if (!receiptUrl) {
      // useFetchData has already shown the error toast.
      tab?.close();
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
