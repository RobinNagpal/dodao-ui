import BreadcrumbsWithChevrons, { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';

interface BreadcrumbsProps {
  breadcrumbs: BreadcrumbsOjbect[];
}

export default function Breadcrumbs({ breadcrumbs }: BreadcrumbsProps) {
  return (
    <div className="m-5 text-color">
      <BreadcrumbsWithChevrons breadcrumbs={breadcrumbs} />
    </div>
  );
}
