import TickerTableActions from '@/app/public-equities/debug/tickers/TickerTableActions';
import gicsData from '@/gicsData/gicsData.json';
import { GicsSector } from '@/types/public-equity/gicsSector';
import { Ticker } from '@prisma/client';

export default function TickersTable({ tickers }: { tickers: Ticker[] }) {
  return (
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
          tickers.map((ticker) => {
            const sectors: GicsSector[] = Object.values(gicsData);
            const sector = sectors.find((sector) => sector.id === ticker.sectorId)!;
            const industryGroup = Object.values(sector?.industryGroups).find((group) => group.id === ticker.industryGroupId)!;
            return (
              <tr key={ticker.tickerKey} className="border">
                <td className="p-3 border text-left">{ticker.tickerKey}</td>
                <td className="p-3 border text-left">{sector.name}</td>
                <td className="p-3 border text-left">{industryGroup.name}</td>
                <td className="p-3 border text-left flex gap-2">
                  <TickerTableActions ticker={ticker} />
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
