import BreadcrumbsWithChevrons, { BreadcrumbsOjbect, BreadcrumbButton } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';

interface BreadcrumbsProps {
  breadcrumbs: BreadcrumbsOjbect[];
  rightButton?: BreadcrumbButton;
}

export default function Breadcrumbs({ breadcrumbs, rightButton }: BreadcrumbsProps) {
  return (
    <div className="my-5 text-color">
      <BreadcrumbsWithChevrons breadcrumbs={breadcrumbs} rightButton={rightButton} />
    </div>
  );
}
