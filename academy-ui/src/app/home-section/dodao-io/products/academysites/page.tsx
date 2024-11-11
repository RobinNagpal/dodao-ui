import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import AcademySites from './academysites.mdx';

export default async function AcademySitesPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <AcademySites />
      </div>
    </PageWrapper>
  );
}
