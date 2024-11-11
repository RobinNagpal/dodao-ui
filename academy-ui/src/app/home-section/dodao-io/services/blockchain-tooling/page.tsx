import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import BlockchainTooling from './blockchain-tooling.mdx';

export default async function BlockchainToolingPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <BlockchainTooling />
      </div>
    </PageWrapper>
  );
}
