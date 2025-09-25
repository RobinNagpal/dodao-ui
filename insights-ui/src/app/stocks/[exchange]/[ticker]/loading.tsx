import { themeColors } from '@/util/theme-colors';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default function Loading() {
  return (
    <div style={{ ...themeColors, backgroundColor: 'var(--bg-color)' }}>
      <PageWrapper>
        <FullPageLoader />
      </PageWrapper>
    </div>
  );
}
