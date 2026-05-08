import Breadcrumbs from '@/components/ui/Breadcrumbs';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { ReactNode } from 'react';

const BASE_URL = 'https://koalagains.com';

interface BreadcrumbsWithJsonLdProps {
  breadcrumbs: BreadcrumbsOjbect[];
  rightButton?: ReactNode;
  hideHomeIcon?: boolean;
}

export default function BreadcrumbsWithJsonLd({ breadcrumbs, rightButton, hideHomeIcon }: BreadcrumbsWithJsonLdProps) {
  const itemListElement = [
    { '@type': 'ListItem' as const, position: 1, name: 'Home', item: `${BASE_URL}/` },
    ...breadcrumbs.map((b, i) => ({
      '@type': 'ListItem' as const,
      position: i + 2,
      name: b.name,
      item: `${BASE_URL}${b.href}`,
    })),
  ];

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Breadcrumbs breadcrumbs={breadcrumbs} rightButton={rightButton} hideHomeIcon={hideHomeIcon} />
    </>
  );
}
