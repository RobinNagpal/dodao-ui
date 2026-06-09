import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import KetchupHplcWorkflowCaseStudy from './ketchup-hplc-workflow';

export const metadata: Metadata = {
  title: 'Ketchup HPLC Workflow — Simulation Case Study | DoDAO',
  description:
    'DoDAO built a Gazebo simulation of the HPLC sample prep workflow for ketchup, a much harder usecase than the standard paracetamol case. Five of the eight workflow steps are running in simulation today, with the Isaac Sim port coming next.',
  keywords: [
    'Robotics',
    'HPLC',
    'Sample Prep',
    'Ketchup',
    'Paracetamol',
    'Gazebo Harmonic',
    'Isaac Sim',
    'ROS 2',
    'MoveIt 2',
    'Simulation Setup',
    '5-HMF',
    'DoDAO Robotics',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/products/ketchup-hplc-workflow',
  },
  openGraph: {
    title: 'Ketchup HPLC Workflow — Simulation Case Study | DoDAO',
    description: 'Gazebo simulation of HPLC sample prep for the harder ketchup usecase. Five of the eight workflow steps are running today.',
    url: 'https://dodao.io/home-section/dodao-io/products/ketchup-hplc-workflow',
    type: 'website',
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ketchup HPLC Workflow — Simulation Case Study | DoDAO',
    description: 'Gazebo simulation of the HPLC sample prep workflow for ketchup.',
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

export default function KetchupHplcWorkflowPage() {
  return (
    <PageWrapper>
      <KetchupHplcWorkflowCaseStudy />
    </PageWrapper>
  );
}
