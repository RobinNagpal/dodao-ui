import DoDAOHome from '@/components/home/DoDAOHome/DoDAOHome';
import { SITE_URL } from '@/utils/siteConfig';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: `${SITE_URL}/`,
  },
};

export default function Home() {
  return <DoDAOHome />;
}
