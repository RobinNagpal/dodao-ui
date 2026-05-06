'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { revalidateTariffReportsListingCache } from '@/utils/cache-actions';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';

export default function TariffReportsPageActions() {
  const router = useRouter();

  const actions: EllipsisDropdownItem[] = [{ key: 'revalidate-listing-tag', label: 'Invalidate Cache' }];

  return (
    <PrivateWrapper>
      <EllipsisDropdown
        items={actions}
        className="px-2 py-2"
        onSelect={async (key) => {
          if (key === 'revalidate-listing-tag') {
            await revalidateTariffReportsListingCache();
            router.refresh();
            return;
          }
        }}
      />
    </PrivateWrapper>
  );
}
