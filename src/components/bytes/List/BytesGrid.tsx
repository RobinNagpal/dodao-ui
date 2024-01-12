import ByteSummaryCard from '@/components/bytes/Summary/ByteSummaryCard';
import NoByte from '@/components/bytes/Summary/NoBytes';
import { Grid4Cols } from '@/components/core/grids/Grid4Cols';
import { ByteSummaryFragment, ProjectByteFragment, ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export default function BytesGrid({
  bytes,
  baseByteViewUrl,
  byteType,
  project,
  space,
}: {
  space: SpaceWithIntegrationsFragment;
  bytes?: ByteSummaryFragment[] | ProjectByteFragment[];
  baseByteViewUrl: string;
  byteType: 'byte' | 'projectByte';
  project?: ProjectFragment;
}) {
  return (
    <div className="flex justify-center items-center px-5 sm:px-0">
      {!bytes?.length && <NoByte space={space} />}
      {!!bytes?.length && (
        <Grid4Cols>
          {bytes?.map((byte, i) => (
            <ByteSummaryCard key={i} byte={byte} baseByteViewUrl={baseByteViewUrl} byteType={byteType} project={project} />
          ))}
        </Grid4Cols>
      )}
    </div>
  );
}
