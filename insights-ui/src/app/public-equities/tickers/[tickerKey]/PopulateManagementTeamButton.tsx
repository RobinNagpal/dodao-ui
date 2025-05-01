'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';

export interface PopulateManagementTeamButtonProps {
  tickerKey: string;
}

export default function PopulateManagementTeamButton({ tickerKey }: PopulateManagementTeamButtonProps) {
  const { postData, loading } = usePostData<Ticker, {}>({
    errorMessage: 'Failed to populate management team.',
  });

  const handlePopulateManagementTeam = async () => {
    await postData(`${getBaseUrl()}/api/actions/tickers/${tickerKey}/get-linkedIn-profile`);
  };

  return (
    <Button primary variant="contained" loading={loading} onClick={() => handlePopulateManagementTeam()}>
      Populate Management Team
    </Button>
  );
}
