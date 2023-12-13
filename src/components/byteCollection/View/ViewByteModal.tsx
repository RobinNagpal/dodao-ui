import ByteStepper from '@/components/bytes/View/ByteStepper';
import { useViewByteInModal } from '@/components/bytes/View/useViewByteInModal';
import PageLoading from '@/components/core/loaders/PageLoading';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { ByteDetailsFragment, ProjectByteFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useEffect } from 'react';
import styles from 'src/components/byteCollection/View/ViewByteModal.module.scss';

export interface ViewByteModalProps {
  showByteModal: boolean;
  onClose: () => void;
  space: SpaceWithIntegrationsFragment;
  byteId: string;
  fetchByteFn: (byteId: string) => Promise<ByteDetailsFragment | ProjectByteFragment>;
}
export default function ViewByteModal(props: ViewByteModalProps) {
  const viewByteHelper = useViewByteInModal({ space: props.space, byteId: props.byteId, stepOrder: 0, fetchByteFn: props.fetchByteFn });

  useEffect(() => {
    viewByteHelper.initialize();
  }, [props.byteId]);

  return (
    <FullScreenModal open={props.showByteModal} onClose={props.onClose} title={viewByteHelper.byteRef?.name || 'Tidbit Details'}>
      <div className={`pt-4 flex flex-col justify-center items-center byte-container w-full ${styles.byteContainer}`}>
        <div className={`sm:border sm:border-gray-200 rounded-xl sm:shadow-md p-2 lg:p-8 ${styles.styledByteCard}`}>
          <div className="split-content integration-card-content">
            {viewByteHelper.byteRef ? (
              <div className="px-2 lg:px-4 md:px-0 h-max text-left">
                <div className="mt-4">
                  <ByteStepper viewByteHelper={viewByteHelper} byte={viewByteHelper.byteRef} space={props.space} />
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
