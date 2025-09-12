import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { permanentRedirect } from 'next/navigation';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

export default async function TickerDetailsPage({ params }: { params: Promise<{ tickerKey: string }> }) {
  const { tickerKey } = await params;

  // Fetch exchange information for the ticker to redirect to new URL format
  try {
    const exchangeResponse = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${tickerKey}/get-exchange-name`, { cache: 'no-cache' });

    if (exchangeResponse.ok) {
      const exchangeData = await exchangeResponse.json();
      const exchange = exchangeData.exchange;

      if (exchange) {
        permanentRedirect(`/stocks/${exchange}/${tickerKey}`);
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Error fetching ticker exchange info:', error);
    // If API call fails, continue with current page logic as fallback
  }
}
