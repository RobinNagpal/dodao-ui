import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import SimulationDigitalTwins from './simulation-digital-twins.mdx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Robotics Simulation and Digital Twins | DoDAO',
  description:
    'DoDAO builds high-fidelity robotics simulations in Gazebo Harmonic and Isaac Sim, plus synthetic data generation, Sim2Real transfer, and digital twins of customer cells.',
  keywords: [
    'Robotics Simulation',
    'Digital Twins',
    'Gazebo Harmonic',
    'Isaac Sim',
    'Isaac Lab',
    'Sim2Real',
    'Synthetic Data',
    'Domain Randomization',
    'Reinforcement Learning',
    'DoDAO Robotics',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/simulation-digital-twins',
  },
  openGraph: {
    title: 'Robotics Simulation and Digital Twins | DoDAO',
    description: 'High-fidelity Gazebo and Isaac Sim worlds, synthetic data, Sim2Real transfer, and digital twins of customer cells.',
    url: 'https://dodao.io/home-section/dodao-io/services/simulation-digital-twins',
    type: 'website',
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Robotics Simulation and Digital Twins | DoDAO',
    description: 'Gazebo, Isaac Sim, synthetic data, and Sim2Real bring-up for robot cells.',
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function SimulationDigitalTwinsPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <SimulationDigitalTwins />
      </div>
    </PageWrapper>
  );
}

export default SimulationDigitalTwinsPage;
