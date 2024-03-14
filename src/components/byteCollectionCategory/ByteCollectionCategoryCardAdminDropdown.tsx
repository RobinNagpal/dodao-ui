'use client';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ByteCollectionCategoryCardAdminDropdownProps {
  categoryId: string;
}
export default function ByteCollectionCategoryCardAdminDropdown({ categoryId }: ByteCollectionCategoryCardAdminDropdownProps) {
  const router = useRouter();

  const baseByteCollectionsCategoryEditUrl = `/tidbit-collection-categories/edit/${categoryId}/`;
  const getThreeDotItems = () => {
    return [{ label: 'Edit', key: 'edit' }];
  };

  return (
    <PrivateEllipsisDropdown
      items={getThreeDotItems()}
      onSelect={async (key) => {
        if (key === 'edit') {
          router.push(baseByteCollectionsCategoryEditUrl);
        }
      }}
    />
  );
}
