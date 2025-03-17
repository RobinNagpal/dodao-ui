'use client';

import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Link from 'next/link';

export default function DebugPublicEquitiesPage() {
  return (
    <PageWrapper>
      <div className="flex">
        <div>
          <h1 className="text-3xl">Criteria</h1>
          <ul>
            <ol>
              <Link href="/public-equities/industry-group-criteria" className="link-color underline text-xl" target="_blank">
                Criteria Table
              </Link>
            </ol>
            <ol>
              <Link
                href="/public-equities/industry-group-criteria/real-estate/equity-real-estate-investment-trusts-reits/create"
                className="link-color underline text-xl"
                target="_blank"
              >
                REIT Custom Criteria
              </Link>
            </ol>
          </ul>
        </div>
        <div>
          <h1 className="text-3xl">Ticker</h1>
          <ul>
            <ol>
              <Link href="/public-equities/debug/ticker-reports" className="link-color underline text-xl" target="_blank">
                Tickers Table
              </Link>
            </ol>
            <ol>
              <Link href="/public-equities/debug/ticker-reports/FVR" className="link-color underline text-xl" target="_blank">
                FVR Debug Page
              </Link>
            </ol>
            <ol>
              <Link href="/public-equities/debug/ticker-reports/PECO" className="link-color underline text-xl" target="_blank">
                PECO Debug Page
              </Link>
            </ol>
            <ol>
              <Link href="/public-equities/debug/ticker-reports/ELS" className="link-color underline text-xl" target="_blank">
                ELS Debug Page
              </Link>
            </ol>
            <ol>
              <Link href="/public-equities/debug/ticker-reports/AMH" className="link-color underline text-xl" target="_blank">
                AMH Debug Page
              </Link>
            </ol>
            <ol>
              <Link href="/public-equities/debug/ticker-reports/AMT" className="link-color underline text-xl" target="_blank">
                AMT Debug Page
              </Link>
            </ol>
            <ol>
              <Link href="/public-equities/debug/ticker-reports/AVB" className="link-color underline text-xl" target="_blank">
                AVB Debug Page
              </Link>
            </ol>
            <ol>
              <Link href="/public-equities/debug/ticker-reports/EQR" className="link-color underline text-xl" target="_blank">
                EQR Debug Page
              </Link>
            </ol>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}
