import { PropsWithChildren } from 'react';

export default function PageWrapper({ children }: PropsWithChildren) {
  return <div className="pt-16">{children}</div>;
}
