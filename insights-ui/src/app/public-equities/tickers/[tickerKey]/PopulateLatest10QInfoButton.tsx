'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';

export interface PopulateLatest10QInfoButtonProps {
  tickerKey: string;
}

export default function PopulateLatest10QInfoButton({ tickerKey }: PopulateLatest10QInfoButtonProps) {
  const { postData, loading } = usePostData<Ticker, {}>({
    errorMessage: 'Failed to populate latest 10Q Info.',
  });

  const handlePopulateLatest10QInfo = async () => {
    await postData(`${getBaseUrl()}/api/tickers/${tickerKey}/latest-10q-info`);
  };

  return (
    <Button primary variant="contained" loading={loading} onClick={() => handlePopulateLatest10QInfo()}>
      Populate Latest 10Q Info
    </Button>
  );
}
