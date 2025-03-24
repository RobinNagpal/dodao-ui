import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Link from 'next/link';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';

async function getTickersResponse(): Promise<Ticker[]> {
  const response = await fetch(`${getBaseUrl()}/api/tickers`, { cache: 'no-cache' });
  return await response.json();
}

export default async function TickersTableDebug() {
  const tickers: Ticker[] = await getTickersResponse();
  return (
    <PageWrapper>
      <table className="w-full border-collapse border border-gray-300 text-left">
        <thead>
          <tr>
            <th className="p-3 border text-left w-16">Ticker</th>
            <th className="p-3 border text-left">Debug Page</th>
          </tr>
        </thead>
        <tbody>
          {tickers.map((ticker: Ticker) => (
            <tr key={ticker.tickerKey} className="border">
              <td className="p-3 border text-left">{ticker.tickerKey}</td>
              <td className="p-3 border text-left">
                <div className="flex items-center gap-2">
                  <Link href={`/public-equities/debug/tickers/${ticker.tickerKey}`} target="_blank" className="link-color pointer-cursor ">
                    Debug Page
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageWrapper>
  );
}
