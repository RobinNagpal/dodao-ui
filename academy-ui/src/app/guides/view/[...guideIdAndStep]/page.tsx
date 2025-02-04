import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import GuideInformation from './GuideInformation';
import type { Metadata } from 'next';
import { GuideFragment } from '@/graphql/generated/generated-types';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

type GuideViewProps = {
  params: Promise<{ guideIdAndStep: string[] }>;
};

export async function generateMetadata({ params }: GuideViewProps): Promise<Metadata> {
  const guideIdAndStep = (await params).guideIdAndStep;
  console.log('generateMetadata - guideIdAndStep', guideIdAndStep);
  const response = await fetch(`${getBaseUrl()}/api/guide/${guideIdAndStep[0]}`);
  const guide = (await response.json()).guide;
  console.log('generateMetadata - guide', guide);
  let stepOrder = 0;
  if (Array.isArray(guideIdAndStep)) {
    stepOrder = parseInt(guideIdAndStep[1]);
  }
  const guideStep = guide.steps[stepOrder];

  const description = `\n\n${guide.guideName}\n\n${guide.content}\n\n${guideStep?.name}\n\n${guideStep?.content}`;
  return {
    title: guide.guideName,
    description: description,
    keywords: [guide.guideName, guideStep?.name],
  };
}

const GuideView = async ({ params }: GuideViewProps) => {
  const { guideIdAndStep } = await params;
  console.log('GuideView - guideIdAndStep', guideIdAndStep);
  const response = await fetch(`${getBaseUrl()}/api/guide/${guideIdAndStep[0]}`);
  const guide: GuideFragment = (await response.json()).guide;
  console.log('GuideView - guide', guide);
  return (
    <PageWrapper className="pt-12">
      <GuideInformation guideIdAndStep={guideIdAndStep} guide={guide} />
    </PageWrapper>
  );
};

export default GuideView;
