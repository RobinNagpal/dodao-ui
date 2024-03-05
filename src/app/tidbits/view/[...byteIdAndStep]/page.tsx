'use client';

import withSpace from '@/app/withSpace';
import ByteStepper from '@/components/bytes/View/ByteStepper';
import { useGenericViewByte } from '@/components/bytes/View/useGenericViewByte';
import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import PageLoading from '@/components/core/loaders/PageLoading';
import PageWrapper from '@/components/core/page/PageWrapper';
import { SpaceWithIntegrationsFragment, useQueryByteDetailsQuery } from '@/graphql/generated/generated-types';
import { TidbitShareSteps } from '@/types/deprecated/models/enums';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './ByteView.module.scss';

const ByteView = ({ params, space }: { params: { byteIdAndStep: string[] }; space: SpaceWithIntegrationsFragment }) => {
  const { byteIdAndStep } = params;

  const byteId = Array.isArray(byteIdAndStep) ? byteIdAndStep[0] : (byteIdAndStep as string);

  let stepOrder = 0;
  if (Array.isArray(byteIdAndStep)) {
    stepOrder = parseInt(byteIdAndStep[1]);
  }

  const { refetch: fetchByteDetails } = useQueryByteDetailsQuery({ skip: true });

  const viewByteHelper = useGenericViewByte({
    space,
    fetchByte: async () => {
      const result = await fetchByteDetails({ spaceId: space.id, byteId: byteId });

      return result.data.byte;
    },
    byteDetailsUrl: `/tidbits/view`,
    byteId,
    stepOrder,
  });

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
      <div className={`pt-4 flex flex-col items-center byte-container w-full ${styles.byteContainer}`}>
        <div className="w-full flex justify-between items-center px-2 lg:px-8 mb-3">
          <Link href="/tidbits" className="text-color hidden sm:block">
            <div className="flex items-center font-bold">
              <span className="mr-1">&#8592;</span>All Tidbits
            </div>
          </Link>
          <PrivateEllipsisDropdown
            items={threeDotItems}
            onSelect={(key) => {
              if (key === 'edit') {
                router.push(`/tidbits/edit/${byteId}`);
              } else if (key === 'generate-pdf') {
                router.push(`/tidbits/share/${byteId}/${TidbitShareSteps.SelectSocial}`);
              }
            }}
          />
        </div>

        <div className={`sm:shadow-md p-2 lg:p-8 w-full max-w-4xl ${styles.styledCarouselByteCard}`}>
          <div className="integration-card-content">
            {byte && (
              <div className="h-max">
                <ByteStepper viewByteHelper={viewByteHelper} byte={byte} space={space} />
              </div>
            )}
            {!byte && <PageLoading />}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default withSpace(ByteView);
