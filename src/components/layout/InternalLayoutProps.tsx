import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@/types/auth/Session';

export interface InternalLayoutProps {
  children: React.ReactNode;
  session: Session | null;
  space?: SpaceWithIntegrationsFragment | null;
  spaceError: boolean;
}
