import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import SimulationSetup from './simulation-setup.mdx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Robotics Simulation Setup | DoDAO',
  description:
    'DoDAO sets up Gazebo and Isaac Sim worlds for your robotics project. We model the robot, the bench, the parts and the sensors so your team can start working on the actual problem.',
  keywords: ['Robotics Simulation', 'Simulation Setup', 'Gazebo', 'Isaac Sim', 'Robot World', 'URDF', 'USD', 'DoDAO Robotics'],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/simulation-setup',
  },
  openGraph: {
    title: 'Robotics Simulation Setup | DoDAO',
    description: 'Gazebo and Isaac Sim worlds, modeled from the ground up so your team can focus on the actual robotics work.',
    url: 'https://dodao.io/home-section/dodao-io/services/simulation-setup',
    type: 'website',
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Robotics Simulation Setup | DoDAO',
    description: 'Gazebo and Isaac Sim worlds, modeled from the ground up.',
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function SimulationSetupPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <SimulationSetup />
      </div>
    </PageWrapper>
  );
}

export default SimulationSetupPage;
