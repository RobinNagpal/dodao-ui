import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import RoboticsHardware from './robotics-hardware.mdx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Robotics Hardware Selection and Bring-Up | DoDAO',
  description:
    'DoDAO helps you pick and integrate the right arm, gripper, sensors, compute, and power for your robotics task, and brings the cell up to a working production setup.',
  keywords: [
    'Robotics Hardware',
    'Cobot Selection',
    'myCobot 280',
    'Universal Robots',
    'Franka',
    'RealSense',
    'NVIDIA Jetson',
    'Robot Cell Bring-Up',
    'Robot Gripper Selection',
    'DoDAO Robotics',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/robotics-hardware',
  },
  openGraph: {
    title: 'Robotics Hardware Selection and Bring-Up | DoDAO',
    description: 'Arm, gripper, sensor, and compute selection plus mechanical mounting, power, and bring-up of a working robot cell.',
    url: 'https://dodao.io/home-section/dodao-io/services/robotics-hardware',
    type: 'website',
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Robotics Hardware Selection and Bring-Up | DoDAO',
    description: 'Picking the right arm, gripper, sensors, and compute, and bringing the cell up to a working setup.',
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function RoboticsHardwarePage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <RoboticsHardware />
      </div>
    </PageWrapper>
  );
}

export default RoboticsHardwarePage;
