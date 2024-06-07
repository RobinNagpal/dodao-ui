import ReviewShareContent from '@/components/bytes/Share/Review/ReviewShareContent';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { TidbitShareSteps } from '@dodao/web-core/types/deprecated/models/enums';

export interface ShareByteViewProps {
  byteId: string;
  currentStep: TidbitShareSteps;
  space: SpaceWithIntegrationsFragment;
}

export default function ShareByteView(props: ShareByteViewProps) {
  if (props.currentStep === TidbitShareSteps.ReviewContents) {
    return <ReviewShareContent space={props.space} byteId={props.byteId} />;
  }

  return null;
}
