'use client';

import ShareBytePage from '@/components/bytes/Share/ShareBytePage';
import ByteStepper from '@/components/bytes/View/ByteStepper';
import ContinuousStepIndicatorProgress from '@/components/bytes/View/ByteStepperItem/Progress/ContinuousStepIndicatorProgress';
import { useViewByteInModal } from '@/components/bytes/View/useViewByteInModal';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import EditProjectByte from '@/components/projects/projectByte/Edit/EditProjectByte';
import { ByteDetailsFragment, ProjectByteFragment, ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import styles from './ViewByteModal.module.scss';
import RatingByteView from '@/components/bytes/View/RatingByteView';
import FullScreenByteModal from '@/components/bytes/View/FullScreenByteModal';

const EditByteView: React.ComponentType<any> = dynamic(() => import('@/components/bytes/Edit/EditByteView'), {
  ssr: false, // Disable server-side rendering for this component
});

export interface ViewByteModalProps {
  space: SpaceWithIntegrationsFragment;
  project?: ProjectFragment;
  byteCollectionType: 'byteCollection' | 'projectByteCollection';
  selectedByteId: string;
  viewByteModalClosedUrl: string;
  afterUpsertByteModalClosedUrl: string;
}

export default function ViewByteModal({
  space,
  project,
  byteCollectionType,
  selectedByteId,
  viewByteModalClosedUrl,
  afterUpsertByteModalClosedUrl,
}: ViewByteModalProps) {
  const fetchByteFn = async (byteId: string): Promise<ByteDetailsFragment | ProjectByteFragment> => {
    if (byteCollectionType === 'projectByteCollection') {
      return await getApiResponse<ByteDetailsFragment>(space, `projects/${project?.id}/bytes/${byteId}`);
    }

    const byteDetails = await getApiResponse<ByteDetailsFragment>(space, `bytes/${byteId}`);
    return byteDetails;
  };

  const viewByteHelper = useViewByteInModal({ space: space, byteId: selectedByteId, stepOrder: 0, fetchByteFn: fetchByteFn });

  useEffect(() => {
    viewByteHelper.initialize();
  }, [selectedByteId]);

  const [editByteModalOpen, setEditByteModalOpen] = React.useState(false);
  const [shareByteModalOpen, setShareByteModalOpen] = React.useState(false);
  const [ratingByteModalOpen, setRatingByteModalOpen] = React.useState(false);

  const { activeStepOrder } = viewByteHelper;

  const router = useRouter();

  function onClose() {
    router.push(viewByteModalClosedUrl);
  }

  const threeDotItems: EllipsisDropdownItem[] = [
    { label: 'Edit', key: 'edit' },
    { label: 'Generate Pdf', key: 'generate-pdf' },
    { label: 'Rating', key: 'rating' },
  ];

  if (editByteModalOpen && viewByteHelper.byteRef && byteCollectionType === 'byteCollection') {
    return (
      <FullScreenModal open={true} onClose={onClose} title={viewByteHelper.byteRef?.name || 'Tidbit Details'}>
        <div className="text-left">
          <EditByteView
            space={space}
            byteId={viewByteHelper.byteRef.id}
            onUpsert={async () => {
              setEditByteModalOpen(false);
              router.push(`${afterUpsertByteModalClosedUrl}/${viewByteHelper.byteRef.id}`);
            }}
          />
        </div>
      </FullScreenModal>
    );
  }

  if (editByteModalOpen && viewByteHelper.byteRef && project && byteCollectionType === 'projectByteCollection') {
    return (
      <FullScreenModal open={true} onClose={onClose} title={viewByteHelper.byteRef?.name || 'Tidbit Details'}>
        <div className="text-left">
          <EditProjectByte space={space} project={project} byteId={viewByteHelper.byteRef.id} />
        </div>
      </FullScreenModal>
    );
  }

  if (shareByteModalOpen && viewByteHelper.byteRef) {
    return (
      <FullScreenModal open={true} onClose={onClose} title={viewByteHelper.byteRef?.name || 'Tidbit Details'}>
        <div className="text-left">
          <ShareBytePage byteId={viewByteHelper.byteRef.id} space={space} />
        </div>
      </FullScreenModal>
    );
  }

  if (ratingByteModalOpen && viewByteHelper.byteRef) {
    return (
      <FullScreenModal open={true} onClose={onClose} title={'Ratings'}>
        <div className="text-left">
          <RatingByteView byteId={viewByteHelper.byteRef.id} space={space} />
        </div>
      </FullScreenModal>
    );
  }

  return (
    <FullScreenByteModal open={true} onClose={onClose} title={viewByteHelper.byteRef?.name || 'Tidbit Details'}>
      <div id="byte-container" className={`flex flex-col items-center w-full relative inset-0`}>
        <ContinuousStepIndicatorProgress steps={viewByteHelper.byteRef?.steps?.length || 2} currentStep={activeStepOrder + 1} />
        <div className={`${styles.styledByteCard} overflow-x-hidden h-full overflow-y-auto w-full`}>
          {viewByteHelper.byteRef ? (
            <>
              <div className="absolute top-4 right-4">
                <PrivateEllipsisDropdown
                  items={threeDotItems}
                  onSelect={(key) => {
                    if (key === 'edit') {
                      setEditByteModalOpen(true);
                    } else if (key === 'generate-pdf') {
                      setShareByteModalOpen(true);
                    } else if (key === 'rating') {
                      setRatingByteModalOpen(true);
                    }
                  }}
                />
              </div>
              <ByteStepper viewByteHelper={viewByteHelper} byte={viewByteHelper.byteRef} space={space} />
            </>
          ) : (
            <PageLoading />
          )}
        </div>
      </div>
    </FullScreenByteModal>
  );
}