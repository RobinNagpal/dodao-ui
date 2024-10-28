import MainContainer from '@dodao/web-core/components/main/Container/MainContainer';
import { PropsWithChildren, ReactNode, ReactElement } from 'react';

export default function PageWrapper({ children, className }: (PropsWithChildren | { children?: ReactElement | undefined }) & { className?: string }) {
  return (
    <MainContainer>
      <div className={`pb-6 pt-6 md:pb-8 md:pt-8 lg:pb-12 lg:pt-12 pl-2 pr-2 ${className || ''}`}>{children}</div>
    </MainContainer>
  );
}
