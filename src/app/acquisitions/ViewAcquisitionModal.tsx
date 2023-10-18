import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';

export interface ViewAcquisitionModalProps {
  showAcquisitionModal: boolean;
  onClose: () => void;
  space: SpaceWithIntegrationsFragment;
  acquisitionId: string;
}
export default function ViewAcquisitionModal(props: ViewAcquisitionModalProps) {
  return (
    <FullScreenModal open={props.showAcquisitionModal} onClose={props.onClose} title={<div className="mt-4 text-2xl"> {'Acquisition Details'}</div>}>
      <div>
        <p>Hello</p>
      </div>
    </FullScreenModal>
  );
}
