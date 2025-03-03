'use client';

import ViewTickerReportJsonModal from '@/components/ticker-reports/ViewTickerReportJsonModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Link from 'next/link';
import { useState } from 'react';

export default function TickersTableDebug() {
  const [showTickerReportModal, setShowTickerReportModal] = useState(false);
  const reitTickers = ['SEGXF', 'VNORP', 'FVR', 'OHI'];
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
          {reitTickers.map((ticker: string) => (
            <tr key={ticker} className="border">
              <td className="p-3 border text-left">{ticker}</td>
              <td className="p-3 border text-left">
                <div className="flex items-center gap-2">
                  <Link href={`/public-equities/debug/ticker-reports/${ticker}`} target="_blank" className="link-color pointer-cursor ">
                    Debug Page
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showTickerReportModal && (
        <ViewTickerReportJsonModal
          open={showTickerReportModal}
          onClose={() => setShowTickerReportModal(false)}
          title={'Ticker Report JSON'}
          url={'https://google.com'}
        />
      )}
    </PageWrapper>
  );
}
