import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import GuideInformation from './GuideInformation';
import type { Metadata } from 'next';
import getApiResponse from '@/utils/api/getApiResponse';
import { GuideFragment } from '@/graphql/generated/generated-types';
import PageWrapper from '@/components/core/page/PageWrapper';

type GuideViewProps = {
  params: { guideIdAndStep: string[] };
};

export async function generateMetadata({ params }: GuideViewProps): Promise<Metadata> {
  const guideIdAndStep = params.guideIdAndStep;
  const guideId = Array.isArray(guideIdAndStep) ? guideIdAndStep[0] : (guideIdAndStep as string);
  const space = (await getSpaceServerSide())!;
  const guide = await getApiResponse<GuideFragment>(space, `guides/${guideId}`);
  // let stepOrder = 0;
  // if (Array.isArray(guideIdAndStep)) {
  //   stepOrder = parseInt(guideIdAndStep[1]);
  // }
  return {
    title: guide.name,
    description: guide.content,
    keywords: [],
  };
}

const GuideView = ({ params }: GuideViewProps) => {
  const { guideIdAndStep } = params;
  return (
    <PageWrapper className="pt-12">
      <GuideInformation guideIdAndStep={guideIdAndStep} />;
    </PageWrapper>
  );
};

export default GuideView;
