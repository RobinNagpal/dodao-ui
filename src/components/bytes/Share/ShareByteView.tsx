import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { TidbitShareSteps } from '@/types/deprecated/models/enums';

export interface ShareByteViewProps {
  byteId: string;
  currentStep: TidbitShareSteps;
  space: SpaceWithIntegrationsFragment;
}

export default function ShareByteView(props: ShareByteViewProps) {
  return (
    <div>
      <h1>ShareByteView</h1>
    </div>
  );
}
