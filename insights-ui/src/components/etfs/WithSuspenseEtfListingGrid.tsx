import { Suspense } from 'react';
import { EtfListingResponse } from '@/app/api/[spaceId]/etfs-v1/listing/route';
import EtfListingGrid from './EtfListingGrid';
import EtfListingLoadingSkeleton from './EtfListingLoadingSkeleton';

interface WithSuspenseEtfListingGridProps {
  dataPromise: Promise<EtfListingResponse>;
}

export default function WithSuspenseEtfListingGrid({ dataPromise }: WithSuspenseEtfListingGridProps) {
  return (
    <Suspense fallback={<EtfListingLoadingSkeleton />}>
      <EtfListingGrid dataPromise={dataPromise} />
    </Suspense>
  );
}
