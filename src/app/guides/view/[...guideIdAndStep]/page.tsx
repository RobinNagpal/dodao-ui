import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import GuideInformation from './component/guideInfo';
import type { Metadata } from 'next';
import getApiResponse from '@/utils/api/getApiResponse';
import { GuideFragment } from '@/graphql/generated/generated-types';

type GuideViewProps = {
  params: { guideIdAndStep: string[] };
};

export async function generateMetadata({ params }: GuideViewProps): Promise<Metadata> {
  const guideIdAndStep = params.guideIdAndStep;
  const guideId = Array.isArray(guideIdAndStep) ? guideIdAndStep[0] : (guideIdAndStep as string);
  const space = (await getSpaceServerSide())!;
  const project = await getApiResponse<GuideFragment>(space, `guides/${guideId}`);
  return {
    title: project.name,
    description: project.content,
    keywords: [],
  };
}

const GuideView = ({ params }: GuideViewProps) => {
  const { guideIdAndStep } = params;
  return <GuideInformation guideIdAndStep={guideIdAndStep} />;
};

export default GuideView;
