import { redirect } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

export default async function CriterionDetailsPage({ params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }) {
  let { tickerKey, criterionKey } = await params;

  // Decode the URL parameters and check if they contain '}' character
  const decodedTickerKey = decodeURIComponent(tickerKey);
  const decodedCriterionKey = decodeURIComponent(criterionKey);

  if (decodedTickerKey.includes('}') || decodedCriterionKey.includes('}')) {
    const cleanedTickerKey = decodedTickerKey.replace(/\}/g, '');
    tickerKey = cleanedTickerKey;
  }

  // Fetch exchange information for the ticker to redirect to new URL format
  try {
    const exchangeResponse = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${tickerKey}/get-exchange-name`, { cache: 'no-cache' });

    if (exchangeResponse.ok) {
      const exchangeData = await exchangeResponse.json();
      const exchange = exchangeData.exchange;

      if (exchange) {
        redirect(`/stocks/${exchange}/${tickerKey}`);
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Error fetching ticker exchange info:', error);
  }
}
