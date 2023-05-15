import { PropsWithChildren } from 'react';

export default function PageWrapper({ children, className }: PropsWithChildren & { className?: string }) {
  return <div className={`pb-12  pt-12 ${className}`}>{children}</div>;
}
