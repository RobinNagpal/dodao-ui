import BreadcrumbsWithChevrons, { BreadcrumbsOjbect } from '@/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import { CategoryWithByteCollection } from '@/graphql/generated/generated-types';

export default async function DashboardLayout(props: { params: { categoryId?: string }; children: React.ReactNode }) {
  const space = (await getSpaceServerSide())!;

  const categoryWithByteCollection = await getApiResponse<CategoryWithByteCollection>(space, `byte-collection-categories/${props.params.categoryId}`);
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: categoryWithByteCollection.name,
      href: `/tidbit-collection-categories/view/${props.params.categoryId}/tidbit-collections`,
      current: true,
    },
  ];

  return (
    <section>
      <BreadcrumbsWithChevrons breadcrumbs={breadcrumbs} />
      {props.children}
    </section>
  );
}
