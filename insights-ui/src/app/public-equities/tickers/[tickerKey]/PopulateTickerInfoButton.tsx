'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';

export interface PopulateTickerInfoButtonProps {
  tickerKey: string;
}

export default function PopulateTickerInfoButton({ tickerKey }: PopulateTickerInfoButtonProps) {
  const { postData, loading } = usePostData<Ticker, {}>({
    errorMessage: 'Failed to populate Ticker Info.',
  });

  const handlePopulateTickerInfo = async () => {
    await postData(`${getBaseUrl()}/api/tickers/${tickerKey}/ticker-info`);
  };

  return (
    <Button primary variant="contained" loading={loading} onClick={() => handlePopulateTickerInfo()}>
      Populate Ticker Info
    </Button>
  );
}
