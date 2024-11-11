import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import RealWorldAssets from './real-world-assets.mdx';

export default async function RealWorldAssetsPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <RealWorldAssets />
      </div>
    </PageWrapper>
  );
}
