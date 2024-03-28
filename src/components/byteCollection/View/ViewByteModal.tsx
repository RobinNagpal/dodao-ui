'use client';

import ByteStepper from '@/components/bytes/View/ByteStepper';
import ContinuousStepIndicatorProgress from '@/components/bytes/View/ByteStepperItem/Progress/ContinuousStepIndicatorProgress';
import { useViewByteInModal } from '@/components/bytes/View/useViewByteInModal';
import PageLoading from '@/components/core/loaders/PageLoading';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { ByteDetailsFragment, ProjectByteFragment, ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { useEffect } from 'react';
import styles from './ViewByteModal.module.scss';
import { useRouter } from 'next/navigation';

export interface ViewByteModalProps {
  space: SpaceWithIntegrationsFragment;
  project?: ProjectFragment;
  byteCollectionType: 'byteCollection' | 'projectByteCollection';
  selectedByteCollectionId: string;
  selectedByteId: string;
  byteCollectionsPageUrl: string;
}
export default function ViewByteModal({
  space,
  project,
  byteCollectionType,
  selectedByteCollectionId,
  selectedByteId,
  byteCollectionsPageUrl,
}: ViewByteModalProps) {
  const fetchByteFn = async (byteId: string): Promise<ByteDetailsFragment | ProjectByteFragment> => {
    if (byteCollectionType === 'projectByteCollection') {
      return await getApiResponse<ByteDetailsFragment>(space, `projects/${project?.id}/bytes/${byteId}`);
    }

    const byteDetails = await getApiResponse<ByteDetailsFragment>(space, `bytes/${byteId}`);
    console.log('byteDetails', byteDetails);
    return byteDetails;
  };

  const viewByteHelper = useViewByteInModal({ space: space, byteId: selectedByteId, stepOrder: 0, fetchByteFn: fetchByteFn });

  useEffect(() => {
    viewByteHelper.initialize();
  }, [selectedByteId]);

  const { activeStepOrder } = viewByteHelper;

  const router = useRouter();

  function onClose() {
    console.log('byteCollectionsPageUrl', byteCollectionsPageUrl);
    router.push(byteCollectionsPageUrl);
  }

  return (
    <FullScreenModal open={true} onClose={onClose} title={viewByteHelper.byteRef?.name || 'Tidbit Details'}>
      <div id="byte-container" className={`flex flex-col  items-center w-full relative inset-0 ${styles.byteContainer} `}>
        <ContinuousStepIndicatorProgress steps={viewByteHelper.byteRef?.steps?.length || 2} currentStep={activeStepOrder + 1} />
        <div className={`${styles.styledByteCard} relative my-4 rounded-lg h-full overflow-y-auto`}>
          {viewByteHelper.byteRef ? <ByteStepper viewByteHelper={viewByteHelper} byte={viewByteHelper.byteRef} space={space} /> : <PageLoading />}
        </div>
      </div>
    </FullScreenModal>
  );
}
