import RoboticsPageWrapper from '@/components/robotics-page/RoboticsPageWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Robotics Services | DoDAO',
  description:
    'DoDAO builds the two pieces of infrastructure that come before robot training and testing: a clean simulation world for your robot, and the labeled synthetic data your vision and policy models learn from.',
  keywords: [
    'Robotics Services',
    'Robot Simulation',
    'Synthetic Data',
    'Gazebo',
    'Isaac Sim',
    'NVIDIA Replicator',
    'YOLO Training Data',
    'Sim-to-Real',
    'Domain Randomization',
    'Behaviour Cloning',
    'Robotics Vision',
    'DoDAO Robotics',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://dodao.io/robotics' },
  openGraph: {
    title: 'Robotics Services | DoDAO',
    description: 'Simulation setup and synthetic data for robotics teams. Gazebo and Isaac Sim worlds. Labeled training data in your format.',
    url: 'https://dodao.io/robotics',
    type: 'website',
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Robotics Services | DoDAO',
    description: 'Simulation setup and synthetic data for robotics teams.',
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

export default function RoboticsPage() {
  return <RoboticsPageWrapper />;
}
