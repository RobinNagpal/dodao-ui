import ReviewShareContent from '@/components/bytes/Share/Review/ReviewShareContent';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { TidbitShareSteps } from '@dodao/web-core/types/deprecated/models/enums';

export interface ShareByteViewProps {
  byteId: string;
  currentStep: TidbitShareSteps;
  space: SpaceWithIntegrationsDto;
}

export default function ShareByteView(props: ShareByteViewProps) {
  if (props.currentStep === TidbitShareSteps.ReviewContents) {
    return <ReviewShareContent space={props.space} byteId={props.byteId} />;
  }

  return null;
}
