'use client';

import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import PageLoading from '@/components/core/loaders/PageLoading';
import ByteStepper from '@/components/bytes/View/ByteStepper';
import { useViewByte } from '@/components/bytes/View/useViewByte';
import EllipsisDropdown from '@/components/core/dropdowns/EllipsisDropdown';
import PageWrapper from '@/components/core/page/PageWrapper';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styled from 'styled-components';

const ByteContainer = styled.div`
  height: calc(100vh - 200px);
`;

const StyledByteCard = styled.div`
  @media screen and (min-width: 767px) {
    min-width: 647px;
    max-width: 647px;
  }
`;

const ByteView = ({ params, space }: { params: { byteIdAndStep: string[] }; space: SpaceWithIntegrationsFragment }) => {
  const { byteIdAndStep } = params;

  const byteId = Array.isArray(byteIdAndStep) ? byteIdAndStep[0] : (byteIdAndStep as string);
  const { isAdmin } = { isAdmin: true };

  let stepOrder = 0;
  if (Array.isArray(byteIdAndStep)) {
    stepOrder = parseInt(byteIdAndStep[1]);
  }

  const viewByteHelper = useViewByte(space, byteId, stepOrder);

  useEffect(() => {
    viewByteHelper.initialize();
  }, [byteId]);

  const threeDotItems = [{ label: 'Edit', key: 'edit' }];

  const byte = viewByteHelper.byteRef;
  const router = useRouter();

  return (
    <PageWrapper>
      <ByteContainer className="pt-4 flex flex-col justify-center items-center byte-container w-full">
        <StyledByteCard className="card integration-main-card">
          <div className="integration-content">
            <div className="split-content integration-card-content">
              {byte && (
                <div className="px-4 md:px-0 mb-3 flex justify-between">
                  <Link href="/tidbits" className="text-color">
                    <span className="mr-1 font-bold">&#8592;</span>
                    All Tidbits
                  </Link>
                  <div className="ml-3">
                    <EllipsisDropdown
                      items={threeDotItems}
                      onSelect={(key) => {
                        router.push(`/tidbits/edit/${byteId}`);
                      }}
                    />
                  </div>
                </div>
              )}

              {byte && byte && (
                <div className="px-4 md:px-0">
                  <Block className="mt-4" slim>
                    <div className="mt-4">
                      <ByteStepper viewByteHelper={viewByteHelper} byte={byte} setAccountModalOpen={() => {}} space={space} />
                    </div>
                  </Block>
                </div>
              )}

              {!byte && <PageLoading />}
            </div>
          </div>
        </StyledByteCard>
      </ByteContainer>
    </PageWrapper>
  );
};

export default withSpace(ByteView);
