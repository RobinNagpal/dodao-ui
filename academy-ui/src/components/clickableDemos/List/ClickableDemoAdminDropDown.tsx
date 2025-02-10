'use client';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ClickableDemo } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ClickableDemoAdminDropdownProps {
  clickableDemo: ClickableDemo;
  space: SpaceWithIntegrationsDto;
}
export default function ClickableDemoAdminDropdown({ clickableDemo, space }: ClickableDemoAdminDropdownProps) {
  const router = useRouter();
  const getThreeDotItems = [{ label: 'Edit', key: 'edit' }];

  return (
    <PrivateEllipsisDropdown
      space={space}
      items={getThreeDotItems}
      onSelect={async (key, e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (key === 'edit') {
          router.push(`clickable-demos/edit/${clickableDemo.id}`);
        }
      }}
    />
  );
}
