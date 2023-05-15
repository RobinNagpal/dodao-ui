'use client';

import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import Dropdown from '@/components/app/Dropdown';

import Icon from '@/components/app/Icon';
import PageLoading from '@/components/app/PageLoading';
import ByteStepper from '@/components/byte/View/ByteStepper';
import { useViewByte } from '@/components/byte/View/useViewByte';
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

const ThreeDotWrapper = styled.div`
  padding-right: 0.75rem;
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
  const threeDotItems = [{ text: 'Edit', action: 'edit' }];

  const byte = viewByteHelper.byteRef;
  const router = useRouter();

  function selectFromThreedotDropdown(e: string) {
    if (e === 'edit') {
      console.log('got to edit byte', byte.id);
      router.push(`/tidbits/edit/${byteId}`);
    }
  }

  return (
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
                  {isAdmin && (
                    <Dropdown top="2.5rem" right="1.3rem" className="float-right mr-2" items={threeDotItems} onSelect={selectFromThreedotDropdown}>
                      <ThreeDotWrapper className="pr-3">{byte && <Icon name="threedots" size="25" />}</ThreeDotWrapper>
                    </Dropdown>
                  )}
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
  );
};

export default withSpace(ByteView);
