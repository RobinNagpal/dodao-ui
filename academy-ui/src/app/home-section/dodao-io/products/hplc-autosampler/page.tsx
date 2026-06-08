import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import HplcAutosamplerCaseStudy from './hplc-autosampler';

export const metadata: Metadata = {
  title: 'HPLC Autosampler — Robotics Case Study | DoDAO',
  description:
    'DoDAO is building a simulation-first robotic arm that loads sample vials into HPLC autosampler trays — picking from a rack, reading barcodes, and placing each vial in the correct slot with a full audit log.',
  keywords: ['Robotics', 'HPLC Autosampler', 'ROS 2', 'Gazebo', 'MoveIt 2', 'myCobot 280', 'Lab Automation', 'DoDAO'],
  authors: [{ name: 'DoDAO' }],
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/products/hplc-autosampler',
  },
  openGraph: {
    title: 'HPLC Autosampler — Robotics Case Study | DoDAO',
    description: 'A simulation-first robotic arm that loads sample vials into HPLC autosampler trays for chemistry labs.',
    url: 'https://dodao.io/home-section/dodao-io/products/hplc-autosampler',
    type: 'website',
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HPLC Autosampler — Robotics Case Study | DoDAO',
    description: 'A simulation-first robotic arm that loads sample vials into HPLC autosampler trays for chemistry labs.',
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

export default function HplcAutosamplerPage() {
  return (
    <PageWrapper>
      <HplcAutosamplerCaseStudy />
    </PageWrapper>
  );
}
