import EditProjectView from '@/components/projects/EditProjectView';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Crowdfunding Project | KoalaGains',
  description: 'Add and configure details for a new crowdfunding project, including name, images, filing links, and more, powered by KoalaGains.',
  alternates: {
    canonical: 'https://koalagains.com/crowd-funding/projects/create',
  },
};

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
