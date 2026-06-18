import BreadcrumbsWithChevrons, { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { ReactNode } from 'react';

interface BreadcrumbsProps {
  breadcrumbs: BreadcrumbsOjbect[];
  rightButton?: ReactNode;
  hideHomeIcon?: boolean;
  mobileBackOnly?: boolean;
}

export default function Breadcrumbs({ breadcrumbs, rightButton, hideHomeIcon, mobileBackOnly }: BreadcrumbsProps) {
  return (
    <div className="my-4 text-color">
      <BreadcrumbsWithChevrons breadcrumbs={breadcrumbs} rightButton={rightButton} hideHomeIcon={hideHomeIcon} mobileBackOnly={mobileBackOnly} />
    </div>
  );
}
