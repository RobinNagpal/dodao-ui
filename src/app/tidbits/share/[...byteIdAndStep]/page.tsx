'use client';

import withSpace from '@/app/withSpace';
import PageWrapper from '@/components/core/page/PageWrapper';
import HorizontalStepperWithPanels, { HorizontalStepperItem } from '@/components/core/stepper/HorizontalStepperWithPanels';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';

enum StepIds {
  SelectSocial = 'select-social',
  ReviewContents = 'review-contents',
  Preview = 'preview',
}

const SharePage = ({ params, space }: { params: { byteIdAndStep: string[] }; space: SpaceWithIntegrationsFragment }) => {
  const { byteIdAndStep } = params;

  const byteId = Array.isArray(byteIdAndStep) ? byteIdAndStep[0] : (byteIdAndStep as string);

  const steps: HorizontalStepperItem[] = [
    {
      id: StepIds.SelectSocial,
      number: '01',
      name: 'Select Social',
      description: 'Where do you want to publish?',
      href: `/tidbits/share/${byteId}/${StepIds.SelectSocial}`,
      status: 'complete',
    },
    {
      id: StepIds.ReviewContents,
      number: '02',
      name: 'Review Contents',
      description: 'Review the contents of pdf/image',
      href: `/tidbits/share/${byteId}/${StepIds.ReviewContents}`,
      status: 'current',
    },
    {
      id: StepIds.Preview,
      number: '03',
      name: 'Preview',
      description: 'Cross check the final asset',
      href: `/tidbits/share/${byteId}/${StepIds.Preview}`,
      status: 'upcoming',
    },
  ];

  let stepName = StepIds.ReviewContents;
  if (Array.isArray(byteIdAndStep)) {
    const stepId = byteIdAndStep[1] as StepIds;
    const currentStep = steps.find((s) => s.id === stepName);
    if (currentStep) {
      stepName = stepId;
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
  }

  console.log('steps', steps);

  return (
    <PageWrapper>
      <HorizontalStepperWithPanels steps={steps} />
    </PageWrapper>
  );
};

export default withSpace(SharePage);
