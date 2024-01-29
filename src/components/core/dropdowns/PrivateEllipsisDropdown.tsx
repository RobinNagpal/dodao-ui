import EllipsisDropdown, { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import { useSpace } from '@/contexts/SpaceContext';
import { Session } from '@/types/auth/Session';
import { isAdmin } from '@/utils/auth/isAdmin';
import { useSession } from 'next-auth/react';
import React from 'react';

export interface PrivateEllipsisDropdownProps {
  items: EllipsisDropdownItem[];
  className?: string;
  onSelect: (item: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
  blockMenuColor?: boolean;
}

export default function PrivateEllipsisDropdown(props: PrivateEllipsisDropdownProps) {
  const { space } = useSpace();
  const { data: session } = useSession();

  return space && session && isAdmin(session as Session, space) ? <EllipsisDropdown {...props} /> : null;
}
