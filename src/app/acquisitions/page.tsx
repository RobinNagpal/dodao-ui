'use client';

import ViewAcquisitionModal from '@/app/acquisitions/ViewAcquisitionModal';
import withSpace, { SpaceProps } from '@/app/withSpace';
import Block from '@/components/app/Block';
import AcquisitionsCard from '@/components/acquisitions/view/AcquisitionsCard';
import { Grid2Cols } from '@/components/core/grids/Grid2Cols';
import RowLoading from '@/components/core/loaders/RowLoading';
import PageWrapper from '@/components/core/page/PageWrapper';
import React from 'react';

function Acquisitions({ space }: SpaceProps) {
  const steps = [
    { name: 'Education', description: 'Tidbit Collections', href: '/tidbits', status: 'complete', id: '1' },
    {
      name: 'Simulations',
      description: 'Show them how',
      href: '/simulations',
      status: 'current',
      id: '2',
    },
    { name: 'Wallet Connect', description: 'Authenticate them', href: '#', status: 'upcoming', id: '3' },
    {
      name: 'Onchain Analysis',
      description: 'Know them if they are relevant',
      href: '#',
      status: 'upcoming',
      id: '4',
    },
    { name: 'Do Action', description: 'Deposit Liquidity', href: '#', status: 'upcoming', id: '5' },
    { name: 'Connect Social Media', description: 'Connect Twitter / Linkedin', href: '#', status: 'upcoming', id: '6' },
    { name: 'Claim Rewards', description: '$50-$100', href: '#', status: 'upcoming', id: '7' },
  ];
  const data = [[steps], [steps], [steps]];
  console.log('data: ', data);
  const loadingData = false;

  const [acquisitionId, setAcquisitionId] = React.useState<string | null>(null);

  const onSelectAcquisition = (acquisitionId: string) => {
    setAcquisitionId(acquisitionId);
  };
  return (
    <PageWrapper>
      {!!data?.length && (
        <Grid2Cols>
          {data?.map((steps, i) => (
            <AcquisitionsCard key={i} onSelectAcquisition={onSelectAcquisition} />
          ))}
        </Grid2Cols>
      )}
      <div style={{ height: '10px', width: '10px', position: 'absolute' }} />
      {loadingData && (
        <Block slim={true}>
          <RowLoading className="my-2" />
        </Block>
      )}

      {acquisitionId && (
        <ViewAcquisitionModal showAcquisitionModal={!!acquisitionId} onClose={() => setAcquisitionId(null)} space={space} acquisitionId={acquisitionId} />
      )}
    </PageWrapper>
  );
}

export default withSpace(Acquisitions);
