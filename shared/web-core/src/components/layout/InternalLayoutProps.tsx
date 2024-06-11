import { SpaceWithIntegrationsFragment } from '@dodao/web-core/types/space';
import { Session } from '@dodao/web-core/types/auth/Session';

export interface InternalLayoutProps {
  children: React.ReactNode;
  session: Session | null;
  space?: SpaceWithIntegrationsFragment | null;
  spaceError: boolean;
}
