'use client';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ClickableDemo, ProjectByteFragment, ProjectFragment, useUpdateArchivedStatusOfProjectByteMutation } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ClickableDemoAdminDropdownProps {
  clickableDemo: ClickableDemo;
}
export default function ClickableDemoAdminDropdown({ clickableDemo }: ClickableDemoAdminDropdownProps) {
  const router = useRouter();
  const getThreeDotItems = [{ label: 'Edit', key: 'edit' }];

  return (
    <>
      <PrivateEllipsisDropdown
        items={getThreeDotItems}
        onSelect={async (key, e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          e.stopPropagation();
          if (key === 'edit') {
            router.push(`clickable-demos/edit/${clickableDemo.id}`);
          }
        }}
      />
    </>
  );
}
