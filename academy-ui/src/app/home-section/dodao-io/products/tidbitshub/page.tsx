import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import TidBitsHubMdx from './tidbitshub.mdx';

export default async function TidbitsHubPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <TidBitsHubMdx />
      </div>
    </PageWrapper>
  );
}
