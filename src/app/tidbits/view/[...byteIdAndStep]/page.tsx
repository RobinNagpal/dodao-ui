'use client';

import withSpace from '@/app/withSpace';
import ByteStepper from '@/components/bytes/View/ByteStepper';
import useGenerateByteSocialContent from '@/components/bytes/View/useGenerateByteSocialContent';
import { useViewByte } from '@/components/bytes/View/useViewByte';
import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import PageLoading from '@/components/core/loaders/PageLoading';
import PageWrapper from '@/components/core/page/PageWrapper';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styled from 'styled-components';

const ByteContainer = styled.div`
  min-height: calc(100vh - 200px);
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

  let stepOrder = 0;
  if (Array.isArray(byteIdAndStep)) {
    stepOrder = parseInt(byteIdAndStep[1]);
  }

  const viewByteHelper = useViewByte(space, byteId, stepOrder);
  const { generatePdf } = useGenerateByteSocialContent(space.id, byteId);

  useEffect(() => {
    viewByteHelper.initialize();
  }, [byteId]);

  const threeDotItems: EllipsisDropdownItem[] = [
    { label: 'Edit', key: 'edit' },
    { label: 'Generate Pdf', key: 'generate-pdf' },
  ];

  const byte = viewByteHelper.byteRef;
  const router = useRouter();

  return (
    <PageWrapper>
      <ByteContainer className="pt-4 flex flex-col justify-center items-center byte-container w-full">
        <StyledByteCard className="sm:border sm:border-gray-200 rounded-xl sm:shadow-md p-2 lg:p-8">
          <div className="split-content integration-card-content">
            {byte && (
              <div className="px-4 md:px-0 mb-3 flex justify-between">
                <Link href="/tidbits" className="text-color">
                  <span className="mr-1 font-bold">&#8592;</span>
                  All Tidbits
                </Link>
                <div className="ml-3">
                  <PrivateEllipsisDropdown
                    items={threeDotItems}
                    onSelect={(key) => {
                      if (key === 'edit') {
                        router.push(`/tidbits/edit/${byteId}`);
                      } else if (key === 'generate-pdf') {
                        generatePdf();
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {byte && byte && (
              <div className="px-2 lg:px-4 md:px-0 h-max">
                <div className="mt-4">
                  <ByteStepper viewByteHelper={viewByteHelper} byte={byte} setAccountModalOpen={() => {}} space={space} />
                </div>
              </div>
            )}

            {!byte && <PageLoading />}
          </div>
        </StyledByteCard>
      </ByteContainer>
    </PageWrapper>
  );
};

export default withSpace(ByteView);
