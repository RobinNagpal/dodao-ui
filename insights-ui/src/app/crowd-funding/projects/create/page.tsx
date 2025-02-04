import EditProjectView from '@/components/projects/EditProjectView';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: `New Project`,
      href: `/crowd-funding/projects/${projectId}`,
      current: true,
    },
  ];
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <SingleCardLayout>
        <EditProjectView projectId={projectId} />
      </SingleCardLayout>
    </PageWrapper>
  );
}
