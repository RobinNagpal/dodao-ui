import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

export async function generateMetadata({ params }: { params: Promise<{ tickerKey: string }> }): Promise<Metadata> {
  const { tickerKey } = await params;

  const referer = (await headers())?.get('referer') ?? ''; // previous URL, if the browser sent it
  const qs = new URLSearchParams({ page: 'tickerDetailsPage' });
  if (referer) qs.set('from', referer);

  const tickerResponse = await fetch(`${getBaseUrl()}/api/tickers/${tickerKey}?${qs.toString()}`, { cache: 'no-cache' });

  let tickerData: FullNestedTickerReport | null = null;

  if (tickerResponse.ok) {
    tickerData = await tickerResponse.json();
  }

  const companyName = tickerData?.companyName ?? tickerKey;
  const shortDescription = `Financial analysis and reports for ${companyName} (${tickerKey}). Explore key metrics, insights, and AI-driven evaluations to make informed investment decisions.`;
  const canonicalUrl = `https://koalagains.com/public-equities/tickers/${tickerKey}`;
  const dynamicKeywords = [
    companyName,
    `Analysis on ${companyName}`,
    `Financial Analysis on ${companyName}`,
    `Reports on ${companyName}`,
    `${companyName} REIT analysis`,
    'investment insights',
    'public equities',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${tickerKey}) | KoalaGains`,
    description: shortDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${companyName} (${tickerKey}) | KoalaGains`,
      description: shortDescription,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${tickerKey}) | KoalaGains`,
      description: shortDescription,
    },
    keywords: dynamicKeywords,
  };
}

export default async function TickerDetailsPage({ params }: { params: Promise<{ tickerKey: string }> }) {
  const { tickerKey } = await params;

  // Fetch exchange information for the ticker to redirect to new URL format
  try {
    const exchangeResponse = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${tickerKey}/get-exchange-name`, { cache: 'no-cache' });

    if (exchangeResponse.ok) {
      const exchangeData = await exchangeResponse.json();
      const exchange = exchangeData.exchange;

      if (exchange) {
        redirect(`/public-equities-v1/${exchange}/${tickerKey}`);
      }
    }
  } catch (error) {
    console.error('Error fetching ticker exchange info:', error);
    // If API call fails, continue with current page logic as fallback
  }
}
