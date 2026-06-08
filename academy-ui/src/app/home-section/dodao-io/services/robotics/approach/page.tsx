import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import RoboticsApproachContent from './approach';

export const metadata: Metadata = {
  title: 'How We Build a Robot Cell | DoDAO Robotics',
  description:
    'DoDAO walks every robotics project through the same four phases. Finalize the requirements, select the hardware, build the software stack, and bring up the cell on real hardware.',
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/robotics/approach',
  },
  openGraph: {
    title: 'How We Build a Robot Cell | DoDAO Robotics',
    description: 'Requirements first, then hardware, then software, then bring-up. The four-phase process behind every DoDAO robotics project.',
    url: 'https://dodao.io/home-section/dodao-io/services/robotics/approach',
    type: 'website',
    siteName: 'DoDAO',
  },
};

export default function RoboticsApproachPage() {
  return (
    <PageWrapper>
      <RoboticsApproachContent />
    </PageWrapper>
  );
}
