import { PropsWithChildren } from 'react';

export default function PageWrapper({ children, className }: PropsWithChildren & { className?: string }) {
  return <div className={`pt-16  ${className}`}>{children}</div>;
}
