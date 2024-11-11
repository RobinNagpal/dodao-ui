import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import BlockchainBootcamp from './blockchain-bootcamp.mdx';

export default async function BlockchainBootcampPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <BlockchainBootcamp />
      </div>
    </PageWrapper>
  );
}
