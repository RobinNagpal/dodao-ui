import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import RoboticsSoftware from './robotics-software.mdx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Robotics Software Engineering Services | DoDAO',
  description:
    'DoDAO builds the software that turns a robot into a useful product. We design ROS 2 stacks, motion planning on MoveIt 2, behavior trees, controls, and full system integration for arms and mobile robots.',
  keywords: [
    'Robotics Software',
    'ROS 2',
    'MoveIt 2',
    'Motion Planning',
    'Behavior Trees',
    'ros2_control',
    'Robot SDK Integration',
    'Robotics Services',
    'DoDAO Robotics',
    'Lab Automation Software',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/robotics-software',
  },
  openGraph: {
    title: 'Robotics Software Engineering Services | DoDAO',
    description: 'DoDAO designs and ships robot software stacks on ROS 2, MoveIt 2, and behavior trees for arms and mobile robots.',
    url: 'https://dodao.io/home-section/dodao-io/services/robotics-software',
    type: 'website',
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Robotics Software Engineering Services | DoDAO',
    description: 'ROS 2 stacks, motion planning, behavior trees, controls, and full system integration for arms and mobile robots.',
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function RoboticsSoftwarePage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <RoboticsSoftware />
      </div>
    </PageWrapper>
  );
}

export default RoboticsSoftwarePage;
