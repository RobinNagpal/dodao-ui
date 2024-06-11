import { useSpace } from '@dodao/web-core/ui/contexts/SpaceContext';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isAdmin } from '@/utils/auth/isAdmin';
import { useSession } from 'next-auth/react';
import { PropsWithChildren } from 'react';

export default function PrivateComponent(props: PropsWithChildren) {
  const { space } = useSpace();
  const { data: session } = useSession();

  return space && session && isAdmin(session as Session, space) ? <>{props.children}</> : null;
}
