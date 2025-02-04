import EditProjectView from '@/components/projects/EditProjectView';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ProjectDetails } from '@/types/project/project';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}/edit`);
  const data: { projectDetails: ProjectDetails } = await res.json();
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: projectId,
      href: `/crowd-funding/projects/${projectId}`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <SingleCardLayout>
        <EditProjectView projectId={projectId} projectDetails={data.projectDetails} />
      </SingleCardLayout>
    </PageWrapper>
  );
}
