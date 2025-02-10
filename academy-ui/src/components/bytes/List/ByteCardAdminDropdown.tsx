'use client';

import { ByteSummaryType } from '@/components/bytes/Summary/ByteSummaryCard';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ByteCardAdminDropdownProps {
  space: SpaceWithIntegrationsDto;
  byte: ByteSummaryType;
}
export default function ByteCardAdminDropdown({ byte, space }: ByteCardAdminDropdownProps) {
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
        space={space}
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
