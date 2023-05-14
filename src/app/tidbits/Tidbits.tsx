import Block from '@/components/app/Block';
import Icon from '@/components/app/Icon';
import RowLoading from '@/components/app/RowLoading';
import ByteSummaryCard from '@/components/byte/Bytes/ByteSummaryCard';
import NoByte from '@/components/byte/Bytes/NoBytes';
import { useSpace } from '@/contexts/SpaceContext';
import { useQueryBytesQuery } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React, { useEffect } from 'react';

function Byte() {
  const { space } = useSpace();

  const { data, error, loading, refetch: fetchBytes } = useQueryBytesQuery({ skip: true });

  useEffect(() => {
    if (space) {
      fetchBytes({
        spaceId: space.id,
      });
    }
  }, [space]);

  const loadingData = loading || !space;

  return (
    <div>
      <Link href="/" className="text-color">
        <Icon name="back" size="22" className="!align-middle" />
        Academy Home
      </Link>
      <div className="mt-6">
        {!data?.bytes.length && !loadingData && <NoByte />}
        {!!data?.bytes?.length && (
          <div className="_4-column-grid features-grid">
            {data?.bytes?.map((byte, i) => (
              <ByteSummaryCard key={i} byte={byte} />
            ))}
          </div>
        )}
        <div style={{ height: '10px', width: '10px', position: 'absolute' }} />
        {loadingData && (
          <Block slim={true}>
            <RowLoading className="my-2" />
          </Block>
        )}
      </div>
    </div>
  );
}

export default Byte;
