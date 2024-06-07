import ShareByteView from '@/components/bytes/Share/ShareByteView';
import PageWrapper from '@/components/core/page/PageWrapper';
import HorizontalStepperWithPanels, { HorizontalStepperItem } from '@/components/core/stepper/HorizontalStepperWithPanels';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { TidbitShareSteps } from '@/types/deprecated/models/enums';

export default function ShareBytePage({ space, byteId }: { byteId: string; space: SpaceWithIntegrationsFragment }) {
  const steps: HorizontalStepperItem[] = [
    {
      id: TidbitShareSteps.SelectSocial,
      number: '01',
      name: 'Select Social',
      description: 'Where do you want to publish?',
      href: `/tidbits/share/${byteId}/${TidbitShareSteps.SelectSocial}`,
      status: 'complete',
    },
    {
      id: TidbitShareSteps.ReviewContents,
      number: '02',
      name: 'Review Contents',
      description: 'Review the contents of pdf/image',
      href: `/tidbits/share/${byteId}/${TidbitShareSteps.ReviewContents}`,
      status: 'current',
    },
    {
      id: TidbitShareSteps.Preview,
      number: '03',
      name: 'Preview',
      description: 'Cross check the final asset',
      href: `/tidbits/share/${byteId}/${TidbitShareSteps.Preview}`,
      status: 'upcoming',
    },
  ];

  let currentStepId = TidbitShareSteps.ReviewContents;

  const byteIdAndStep = [byteId, TidbitShareSteps.ReviewContents];

  const stepId = byteIdAndStep[1] as TidbitShareSteps;
  const currentStep = steps.find((s) => s.id.toString() === stepId);

  if (currentStep) {
    currentStepId = stepId;
    steps.forEach((s) => {
      if (parseInt(s.number) < parseInt(currentStep.number)) {
        s.status = 'complete';
      } else if (parseInt(s.number) > parseInt(currentStep.number)) {
        s.status = 'upcoming';
      } else {
        s.status = 'current';
      }
    });
  }

  return (
    <PageWrapper>
      <HorizontalStepperWithPanels steps={steps} />
      <ShareByteView byteId={byteId} currentStep={currentStepId} space={space} />
    </PageWrapper>
  );
}
