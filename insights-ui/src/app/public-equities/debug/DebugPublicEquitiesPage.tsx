'use client';

import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Link from 'next/link';

export default function DebugPublicEquitiesPage() {
  return (
    <PageWrapper>
      <div className="flex justify-center">
        <div>
          <h1>Debug Pages</h1>
          <ul>
            <ol>
              <Link href="/public-equities/industry-group-criteria" className="link-color underline" target="_blank">
                Criteria Table
              </Link>
            </ol>
            <ol>
              <Link href="/public-equities/debug/ticker-reports" className="link-color underline" target="_blank">
                Ticker Reports
              </Link>
            </ol>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}
