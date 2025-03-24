'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import DisabledOnLocalhostButton from '@/components/ui/DisabledOnLocalhostButton';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { SecFiling } from '@prisma/client';

interface RepopulateButtonProps {
  tickerKey: string;
}
export default function RepopulateFilingsButton({ tickerKey }: RepopulateButtonProps) {
  const { data, loading, postData, error } = usePostData<SecFiling[], {}>({
    errorMessage: 'Failed to get criteria matching',
  });

  const handleRepopulateFilings = async () => {
    await postData(`${getBaseUrl()}/api/actions/tickers/${tickerKey}/sec-filings/re-populate`, {});
  };

  return (
    <PrivateWrapper>
      <DisabledOnLocalhostButton
        loading={loading}
        primary
        variant="contained"
        onClick={handleRepopulateFilings}
        disabled={loading}
        disabledLabel="Disabled on Localhost"
      >
        Repopulate Filings
      </DisabledOnLocalhostButton>
    </PrivateWrapper>
  );
}
