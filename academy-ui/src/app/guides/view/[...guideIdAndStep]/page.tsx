import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import GuideInformation from './GuideInformation';
import type { Metadata } from 'next';
import { GuideFragment } from '@/graphql/generated/generated-types';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import axios from 'axios';
import getBaseUrl from '@/utils/api/getBaseURL';

type GuideViewProps = {
  params: { guideIdAndStep: string[] };
};

export async function generateMetadata({ params }: GuideViewProps): Promise<Metadata> {
  const guideIdAndStep = params.guideIdAndStep;
  const response = await axios.get(`${getBaseUrl()}/api/guide/${guideIdAndStep[0]}`);
  const guide = response.data.guide;
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
  const { guideIdAndStep } = params;
  const space = (await getSpaceServerSide())!;

  const response = await axios.get(`${getBaseUrl()}/api/guide/${guideIdAndStep[0]}`);
  const guide: GuideFragment = response.data.guide;

  return (
    <PageWrapper className="pt-12">
      <GuideInformation guideIdAndStep={guideIdAndStep} guide={guide} />
    </PageWrapper>
  );
};

export default GuideView;
