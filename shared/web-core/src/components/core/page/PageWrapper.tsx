import MainContainer from '@dodao/web-core/components/main/Container/MainContainer';
import { PropsWithChildren, ReactElement } from 'react';

export default function PageWrapper({ children, className }: (PropsWithChildren | { children?: ReactElement | undefined }) & { className?: string }) {
  return (
    <MainContainer>
      <div className={`py-6 md:py-8 lg:py-12 pl-2 pr-2 ${className || ''}`}>{children}</div>
    </MainContainer>
  );
}
