import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import RoboticsServicesContent from './robotics';

export const metadata: Metadata = {
  title: 'Robotics Services | DoDAO',
  description:
    'DoDAO robotics services across four layers: robotics software engineering, computer vision & perception, simulation & digital twins, and robotics hardware bring-up.',
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/robotics',
  },
  openGraph: {
    title: 'Robotics Services | DoDAO',
    description: 'Software, perception, simulation, and hardware services for robotic arm and mobile-robot projects — simulation-first.',
    url: 'https://dodao.io/home-section/dodao-io/services/robotics',
    type: 'website',
    siteName: 'DoDAO',
  },
};

export default function RoboticsServicesPage() {
  return (
    <PageWrapper>
      <div className="mx-auto max-w-5xl px-6 py-10 lg:py-14">
        <RoboticsServicesContent />
      </div>
    </PageWrapper>
  );
}
