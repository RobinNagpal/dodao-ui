import { redirect } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

export default async function CriterionDetailsPage({ params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }) {
  const { tickerKey, criterionKey } = await params;

  // Fetch exchange information for the ticker to redirect to new URL format
  try {
    const exchangeResponse = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${tickerKey}/get-exchange-name`, { cache: 'no-cache' });

    if (exchangeResponse.ok) {
      const exchangeData = await exchangeResponse.json();
      const exchange = exchangeData.exchange;

      if (exchange) {
        redirect(`/public-equities-v1/${exchange}/${tickerKey}/criteria/${criterionKey}`);
      }
    }
  } catch (error) {
    console.error('Error fetching ticker exchange info:', error);
  }
}
