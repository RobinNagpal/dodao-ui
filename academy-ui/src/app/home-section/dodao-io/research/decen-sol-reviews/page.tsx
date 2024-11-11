import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import DecentralizedReviewSolution from './decen-sol-reviews.mdx';

export default async function DecentralizedSolutionReviewsPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <DecentralizedReviewSolution />
      </div>
    </PageWrapper>
  );
}
