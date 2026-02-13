import BreadcrumbsWithChevrons, { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { ReactNode } from 'react';

interface BreadcrumbsProps {
  breadcrumbs: BreadcrumbsOjbect[];
  rightButton?: ReactNode;
  hideHomeIcon?: boolean;
}

export default function Breadcrumbs({ breadcrumbs, rightButton, hideHomeIcon }: BreadcrumbsProps) {
  return (
    <div className="px-1 text-gray-600 mb-2">
      <BreadcrumbsWithChevrons breadcrumbs={breadcrumbs} rightButton={rightButton} hideHomeIcon={hideHomeIcon} />
    </div>
  );
}
