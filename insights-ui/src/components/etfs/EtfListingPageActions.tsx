'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { revalidateEtfListingPageCache } from '@/utils/cache-actions';
import type { EtfListingCacheTag } from '@/utils/etf-cache-utils';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

export interface EtfListingPageActionsProps {
  /**
   * The Next.js Data Cache tag backing this listing surface. Index + group pages
   * pass it; filter-based detail pages (provider / asset-class / category) are
   * uncached in Next and omit it, so only the CloudFront page is purged.
   */
  tag?: EtfListingCacheTag;
}

/**
 * Admin-only 3-dots dropdown for ETF listing pages. Exposes a single
 * "Revalidate This Listing" action that clears both cache layers for the current
 * page only (the matching Next.js tag, if any, plus the CloudFront edge copy of
 * the page the admin is viewing). Mirrors the stocks `StocksGridPageActions`.
 */
export default function EtfListingPageActions({ tag }: EtfListingPageActionsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const actions: EllipsisDropdownItem[] = [{ key: 'revalidate-listing', label: 'Revalidate This Listing' }];

  return (
    <PrivateWrapper>
      <EllipsisDropdown
        items={actions}
        className="px-2 py-2"
        onSelect={async (key) => {
          if (key !== 'revalidate-listing') return;
          await revalidateEtfListingPageCache(pathname, tag);
          router.refresh();
        }}
      />
    </PrivateWrapper>
  );
}
