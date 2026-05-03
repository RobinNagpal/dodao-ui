import { ReactNode } from 'react';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

interface StockScenarioPageLayoutProps {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbsOjbect[];
  rightButton?: ReactNode;
  children: ReactNode;
}

function defaultBreadcrumbs(): BreadcrumbsOjbect[] {
  return [
    { name: 'Stocks', href: '/stocks', current: false },
    { name: 'Scenarios', href: '/stock-scenarios', current: true },
  ];
}

export default function StockScenarioPageLayout({ title, description, breadcrumbs, rightButton, children }: StockScenarioPageLayoutProps) {
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs ?? defaultBreadcrumbs()} rightButton={rightButton} />

      {title && (
        <div className="w-full mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
          {description && <p className="text-[#E5E7EB] text-md mb-4">{description}</p>}
        </div>
      )}

      {children}
    </PageWrapper>
  );
}
