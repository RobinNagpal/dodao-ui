'use client';

import ByteStepper from '@/components/bytes/View/ByteStepper';
import StepIndicatorProgress from '@/components/bytes/View/NewByteStyles/Progress/StepIndicatorProgress';
import { useViewByteInModal } from '@/components/bytes/View/useViewByteInModal';
import PageLoading from '@/components/core/loaders/PageLoading';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import {
  ByteDetailsFragment,
  ByteStepFragment,
  ProjectByteFragment,
  ProjectFragment,
  SpaceWithIntegrationsFragment,
} from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import styles from './ViewByteModal.module.scss';

export interface ViewByteModalProps {
  space: SpaceWithIntegrationsFragment;
  project?: ProjectFragment;
  byteCollectionType: 'byteCollection' | 'projectByteCollection';
  selectedByteCollectionId: string;
  selectedByteId: string;
}
export default function ViewByteModal({ space, project, byteCollectionType, selectedByteCollectionId, selectedByteId }: ViewByteModalProps) {
  const router = useRouter();
  const fetchByteFn = async (byteId: string): Promise<ByteDetailsFragment | ProjectByteFragment> => {
    if (byteCollectionType === 'projectByteCollection') {
      return await getApiResponse<ByteDetailsFragment>(space, `projects/${project?.id}/bytes/${byteId}`);
    }

    const byteDetails = await getApiResponse<ByteDetailsFragment>(space, `bytes/${byteId}`);
    console.log('byteDetails', byteDetails);
    return byteDetails;
  };

  const viewByteHelper = useViewByteInModal({ space: space, byteId: selectedByteId, stepOrder: 0, fetchByteFn: fetchByteFn });

  const onClose = () => {
    const byteViewUrl = byteCollectionType === 'byteCollection' ? `/tidbit-collections` : `/projects/view/${project?.id}/tidbit-collections`;
    router.push(byteViewUrl);
  };

  useEffect(() => {
    viewByteHelper.initialize();
  }, [selectedByteId]);

  const { activeStepOrder } = viewByteHelper;

  return (
    <FullScreenModal open={true} onClose={onClose} title={viewByteHelper.byteRef?.name || 'Tidbit Details'}>
      <div className="py-4 pt-8">
        <StepIndicatorProgress steps={viewByteHelper.byteRef?.steps?.length || 2} currentStep={activeStepOrder} />
      </div>
      <div className={`pt-4 flex flex-col justify-center items-center byte-container w-full ${styles.byteContainer}`}>
        <div className={`sm:border sm:border-gray-200 rounded-xl sm:shadow-md p-2 lg:p-8 ${styles.styledByteCard} ${styles.styledCarouselByteCard}`}>
          <div className="split-content integration-card-content">
            {viewByteHelper.byteRef ? (
              <div className="px-2 lg:px-4 md:px-0 h-max text-left">
                <div className="mt-4">
                  <ByteStepper viewByteHelper={viewByteHelper} byte={viewByteHelper.byteRef} space={space} />
                </div>
              </div>
            ) : (
              <PageLoading />
            )}
          </div>
        </div>
      </div>
    </FullScreenModal>
  );
}
