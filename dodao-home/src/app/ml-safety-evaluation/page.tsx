import MlEvaluationPage from '@/components/ml-safety-evaluation/MlEvaluationPage';
import { SITE_URL } from '@/utils/siteConfig';
import { Metadata } from 'next';

const title = 'ML safety evaluation for notified bodies | DoDAO';
const description =
  'DoDAO performs ML technical tasks as a subcontractor to notified bodies under the EU Machinery Regulation (EU) 2023/1230: technical file review, data and model testing, and verification of the Annex III requirements for self-evolving safety functions.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/ml-safety-evaluation` },
  openGraph: { title, description, url: `${SITE_URL}/ml-safety-evaluation`, type: 'website', siteName: 'DoDAO' },
};

export default function MlSafetyEvaluationRoute() {
  return <MlEvaluationPage />;
}
