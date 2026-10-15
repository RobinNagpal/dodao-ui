import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import ComputerVision from './computer-vision.mdx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Computer Vision and Perception Services | DoDAO',
  description:
    'DoDAO builds robotics perception pipelines that combine classical computer vision, deep models, and modern foundation models. Pose estimation, segmentation, SLAM, depth fusion, and grasp planning for real-world cells.',
  keywords: [
    'Robotics Perception',
    'Computer Vision',
    '6-DoF Pose Estimation',
    'FoundationPose',
    'SAM 2',
    'Instance Segmentation',
    'SLAM',
    'Grasp Estimation',
    'RealSense',
    'DoDAO Robotics',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/computer-vision',
  },
  openGraph: {
    title: 'Computer Vision and Perception Services | DoDAO',
    description:
      'Robotics perception pipelines for 6-DoF pose, segmentation, SLAM, depth fusion, and grasp planning. Built on classical CV and modern foundation models.',
    url: 'https://dodao.io/home-section/dodao-io/services/computer-vision',
    type: 'website',
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Computer Vision and Perception Services | DoDAO',
    description: 'Pose, segmentation, SLAM, depth fusion, and grasp planning for arms and mobile robots.',
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function ComputerVisionPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <ComputerVision />
      </div>
    </PageWrapper>
  );
}

export default ComputerVisionPage;
