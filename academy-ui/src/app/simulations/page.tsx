'use client';

import withSpace, { SpaceProps } from '@/contexts/withSpace';
import Block from '@dodao/web-core/components/app/Block';
import RowLoading from '@dodao/web-core/components/core/loaders/RowLoading';
import SimulationSummaryCard from '@/components/simulations/Simulations/SimulationSummaryCard';
import NoSimulation from '@/components/simulations/Simulations/NoSimulations';
import { Grid4Cols } from '@dodao/web-core/components/core/grids/Grid4Cols';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useSimulationsQuery } from '@/graphql/generated/generated-types';
import React from 'react';

function Simulation({ space }: SpaceProps) {
  const { data, error, loading, refetch: fetchSimulations } = useSimulationsQuery({ variables: { spaceId: space.id } });

  const loadingData = loading || !space;
  return (
    <PageWrapper>
      {!data?.simulations.length && !loadingData && <NoSimulation />}
      {!!data?.simulations?.length && (
        <Grid4Cols>
          {data?.simulations?.map((simulation, i) => (
            <SimulationSummaryCard key={i} simulation={simulation} />
          ))}
        </Grid4Cols>
      )}
      <div style={{ height: '10px', width: '10px', position: 'absolute' }} />
      {loadingData && (
        <Block slim={true}>
          <RowLoading className="my-2" />
        </Block>
      )}
    </PageWrapper>
  );
}

export default withSpace(Simulation);
