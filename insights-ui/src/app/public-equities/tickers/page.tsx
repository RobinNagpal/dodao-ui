import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';
import Link from 'next/link';
import TickerTableActions from './TickerTableActions';

export default async function AllTickersPage() {
  const response = await fetch(`${getBaseUrl()}//api/tickers`);
  const tickers: Ticker[] = (await response.json()) as Ticker[];
  return (
    <PageWrapper>
      <div className="flex justify-between">
        <div></div>
        <Link href={'/public-equities/tickers/create'} className="link-color underline">
          Create Ticker
        </Link>
      </div>
      <table className="w-full border-collapse border border-gray-300 text-left mt-6">
        <thead>
          <tr>
            <th className="p-3 border text-left">Ticker</th>
            <th className="p-3 border text-left">Sector</th>
            <th className="p-3 border text-left">Industry Group</th>
            <th className="p-3 border text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickers.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-3 border text-center italic">
                No tickers found.
              </td>
            </tr>
          ) : (
            tickers.map((ticker) => (
              <tr key={ticker.tickerKey} className="border">
                <td className="p-3 border text-left">{ticker.tickerKey}</td>
                <td className="p-3 border text-left">{ticker.sectorId}</td>
                <td className="p-3 border text-left">{ticker.industryGroupId}</td>
                <td className="p-3 border text-left flex gap-2">
                  <TickerTableActions ticker={ticker} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </PageWrapper>
  );
}
