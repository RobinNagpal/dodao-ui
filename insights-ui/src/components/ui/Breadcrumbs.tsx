import BreadcrumbsWithChevrons, { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { ReactNode } from 'react';

interface BreadcrumbsProps {
  breadcrumbs: BreadcrumbsOjbect[];
  rightButton?: ReactNode;
}

export default function Breadcrumbs({ breadcrumbs, rightButton }: BreadcrumbsProps) {
  return (
    <div className="my-5 text-color">
      <BreadcrumbsWithChevrons breadcrumbs={breadcrumbs} rightButton={rightButton} />
    </div>
  );
}
