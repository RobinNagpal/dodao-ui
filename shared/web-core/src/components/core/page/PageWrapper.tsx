import MainContainer from '@dodao/web-core/components/main/Container/MainContainer';
import { PropsWithChildren, ReactElement } from 'react';

export default function PageWrapper({ children, className }: (PropsWithChildren | { children?: ReactElement | undefined }) & { className?: string }) {
  return (
    <MainContainer>
      <div className={`py-4 md:py-6 lg:py-10 px-1 sm:px-2 ${className || ''}`}>{children}</div>
    </MainContainer>
  );
}
