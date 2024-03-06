'use client';

import ByteStepper from '@/components/bytes/View/ByteStepper';
import ContinuousStepIndicatorProgress from '@/components/bytes/View/NewByteStyles/Progress/ContinuousStepIndicatorProgress';
import { useViewByteInModal } from '@/components/bytes/View/useViewByteInModal';
import PageLoading from '@/components/core/loaders/PageLoading';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { ByteDetailsFragment, ProjectByteFragment, ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
      <div className={`flex flex-col justify-center items-center w-full ${styles.byteContainer}`}>
        <ContinuousStepIndicatorProgress steps={viewByteHelper.byteRef?.steps?.length || 2} currentStep={activeStepOrder + 1} />
        <div className={`${styles.styledByteCard} ${styles.styledCarouselByteCard}`}>
          {viewByteHelper.byteRef ? <ByteStepper viewByteHelper={viewByteHelper} byte={viewByteHelper.byteRef} space={space} /> : <PageLoading />}
        </div>
      </div>
    </FullScreenModal>
  );
}
