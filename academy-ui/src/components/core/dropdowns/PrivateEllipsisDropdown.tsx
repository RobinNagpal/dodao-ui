import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useSpace } from '@dodao/web-core/ui/contexts/SpaceContext';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isAdmin } from '@/utils/auth/isAdmin';
import { useSession } from 'next-auth/react';
import React from 'react';

export interface PrivateEllipsisDropdownProps {
  items: EllipsisDropdownItem[];
  className?: string;
  onSelect: (item: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function PrivateEllipsisDropdown(props: PrivateEllipsisDropdownProps) {
  const { space } = useSpace();
  const { data: session } = useSession();

  return space && session && isAdmin(session as Session, space) ? <EllipsisDropdown {...props} /> : null;
}
