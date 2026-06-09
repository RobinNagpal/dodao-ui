import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import SyntheticData from './synthetic-data.mdx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Synthetic Data for Robotics and Vision | DoDAO',
  description:
    'DoDAO generates labeled synthetic data from simulation for object detection, segmentation, pose estimation and other vision models. Useful when real data is scarce or hard to label.',
  keywords: ['Synthetic Data', 'YOLO', 'Vision Model Training', 'Isaac Sim', 'NVIDIA Replicator', 'Gazebo', 'Domain Randomization', 'DoDAO Robotics'],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/synthetic-data',
  },
  openGraph: {
    title: 'Synthetic Data for Robotics and Vision | DoDAO',
    description: 'Labeled synthetic data from your simulation for YOLO and other vision models.',
    url: 'https://dodao.io/home-section/dodao-io/services/synthetic-data',
    type: 'website',
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synthetic Data for Robotics and Vision | DoDAO',
    description: 'Labeled synthetic data from simulation for vision models.',
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function SyntheticDataPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <SyntheticData />
      </div>
    </PageWrapper>
  );
}

export default SyntheticDataPage;
