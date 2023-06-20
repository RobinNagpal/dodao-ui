import MainContainer from '@/components/main/Container/MainContainer';
import { PropsWithChildren } from 'react';

export default function PageWrapper({ children, className }: PropsWithChildren & { className?: string }) {
  return (
    <MainContainer>
      <div className={`pb-12  pt-12 ${className}`}>{children}</div>{' '}
    </MainContainer>
  );
}
