import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { ReactNode } from 'react';

interface AlertPageWrapperProps {
  session?: DoDAOSession | null;
  children: (session: DoDAOSession) => ReactNode;
  loginMessage?: string;
}

export default function AlertPageWrapper({ session, children, loginMessage = 'Please log in to create an alert.' }: AlertPageWrapperProps) {
  if (!session) {
    return <div>{loginMessage}</div>;
  }

  return <>{children(session)}</>;
}
