import { ReactNode } from 'react';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

interface EtfInvestorPageLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbsOjbect[];
  rightButton?: ReactNode;
  children: ReactNode;
}

function defaultBreadcrumbs(): BreadcrumbsOjbect[] {
  return [
    { name: 'US ETFs', href: '/etfs', current: false },
    { name: 'Investor Goals', href: '/etf-investors', current: true },
  ];
}

export default function EtfInvestorPageLayout({ title, description, breadcrumbs, rightButton, children }: EtfInvestorPageLayoutProps) {
  return (
    <PageWrapper>
      <div className="overflow-x-auto">
        <Breadcrumbs breadcrumbs={breadcrumbs ?? defaultBreadcrumbs()} rightButton={rightButton} />
      </div>

      <div className="w-full mb-8">
        <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
        {description && <p className="text-[#E5E7EB] text-md mb-4">{description}</p>}
      </div>

      {children}
    </PageWrapper>
  );
}
