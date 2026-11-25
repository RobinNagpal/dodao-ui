import RobotSafetyPage from '@/components/robot-safety/RobotSafetyPage';
import { SITE_URL } from '@/utils/siteConfig';
import { Metadata } from 'next';

const title = 'Robot safety & security readiness | DoDAO';
const description =
  'DoDAO prepares robot makers, AI robotics startups and integrators for safety and security checks: ISO 10218 risk assessments, AI behaviour testing in simulation, product cybersecurity and SOC 2 readiness.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/robot-safety` },
  openGraph: { title, description, url: `${SITE_URL}/robot-safety`, type: 'website', siteName: 'DoDAO' },
};

export default function RobotSafetyRoute() {
  return <RobotSafetyPage />;
}
