import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import DecenReviews from './decen-reviews.mdx';

export default async function RiskAnalysisPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <DecenReviews />
      </div>
    </PageWrapper>
  );
}
