import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export interface LoadingOrErrorProps {
  error: string | undefined;
  loading: boolean;
}
export default function LoadingOrError({ loading, error }: LoadingOrErrorProps) {
  if (loading) {
    return (
      <PageWrapper>
        <FullPageLoader />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="text-red-500">{error}</div>
      </PageWrapper>
    );
  }

  return null;
}
