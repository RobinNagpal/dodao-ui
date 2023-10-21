import Block from '@/components/app/Block';
import ByteSummaryCard from '@/components/bytes/Summary/ByteSummaryCard';
import NoByte from '@/components/bytes/Summary/NoBytes';
import { Grid4Cols } from '@/components/core/grids/Grid4Colst';
import TidbitsSkeleton from '@/components/core/loaders/TidbitLoader';
import { ByteSummaryFragment, ProjectByteFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export default function BytesGrid({ loading, bytes }: { loading: boolean; bytes?: ByteSummaryFragment[] | ProjectByteFragment[] }) {
  return (
    <>
      {loading ? (
        <Block>
          <TidbitsSkeleton />
        </Block>
      ) : (
        <div className="flex justify-center items-center px-5 sm:px-0">
          {!bytes?.length && <NoByte />}
          {!!bytes?.length && (
            <Grid4Cols>
              {bytes?.map((byte, i) => (
                <ByteSummaryCard key={i} byte={byte} />
              ))}
            </Grid4Cols>
          )}
        </div>
      )}
    </>
  );
}
