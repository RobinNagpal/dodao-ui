'use client';

import { ByteSummaryType } from '@/components/bytes/Summary/ByteSummaryCard';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ByteCardAdminDropdownProps {
  byte: ByteSummaryType;
}
export default function ByteCardAdminDropdown({ byte }: ByteCardAdminDropdownProps) {
  const router = useRouter();
  const baseBytesEditUrl = '/tidbits/edit';
  const getThreeDotItems = (byte: ByteSummaryType) => {
    if (byte.hasOwnProperty('archived')) {
      return [{ label: 'Edit', key: 'edit' }];
    }

    return [
      { label: 'Edit', key: 'edit' },
      { label: 'Edit SEO', key: 'editSeo' },
    ];
  };

  return (
    <>
      <PrivateEllipsisDropdown
        items={getThreeDotItems(byte)}
        onSelect={async (key, e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          e.stopPropagation();
          if (key === 'edit') {
            router.push(`${baseBytesEditUrl}/${byte.id}`);
          }
        }}
      />
    </>
  );
}
