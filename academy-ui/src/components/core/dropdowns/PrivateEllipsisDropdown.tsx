import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isAdmin } from '@/utils/auth/isAdmin';
import { useSession } from 'next-auth/react';
import React from 'react';

export interface PrivateEllipsisDropdownProps {
  items: EllipsisDropdownItem[];
  className?: string;
  onSelect: (item: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
  space: SpaceWithIntegrationsDto;
}

export default function PrivateEllipsisDropdown(props: PrivateEllipsisDropdownProps) {
  const { data: session } = useSession();

  return props.space && session && isAdmin(session as Session, props.space) ? <EllipsisDropdown {...props} /> : null;
}
