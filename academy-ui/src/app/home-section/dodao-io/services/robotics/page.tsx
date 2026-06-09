import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import RoboticsServicesContent from './robotics';

export const metadata: Metadata = {
  title: 'Robotics Services | DoDAO',
  description: 'DoDAO robotics services: simulation setup in Gazebo and Isaac Sim, and synthetic data generation for vision models like YOLO.',
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/robotics',
  },
  openGraph: {
    title: 'Robotics Services | DoDAO',
    description: 'Simulation setup and synthetic data generation for robotics projects.',
    url: 'https://dodao.io/home-section/dodao-io/services/robotics',
    type: 'website',
    siteName: 'DoDAO',
  },
};

export default function RoboticsServicesPage() {
  return (
    <PageWrapper>
      <div className="mx-auto max-w-5xl px-6 py-2 lg:py-4">
        <RoboticsServicesContent />
      </div>
    </PageWrapper>
  );
}
