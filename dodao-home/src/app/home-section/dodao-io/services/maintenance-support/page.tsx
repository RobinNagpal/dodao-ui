import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import MaintenanceSupport from './maintenance-support';

export const metadata: Metadata = {
  title: 'AI Agent Maintenance & Support | DoDAO',
  description:
    'Ongoing monitoring, troubleshooting, fine-tuning, and quarterly upgrades for AI agents in production — so the agent you ship today is still the best version of itself a year from now.',
  keywords: ['AI Agent Maintenance', 'AI Agent Support', 'LLM Maintenance', 'AI Production Monitoring', 'Agent Fine-tuning', 'AI SLA', 'DoDAO AI Services'],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/maintenance-support',
  },
  openGraph: {
    title: 'AI Agent Maintenance & Support | DoDAO',
    description: 'Always-on monitoring, same-day triage, and quarterly upgrades for the AI agents running your business.',
    url: 'https://dodao.io/home-section/dodao-io/services/maintenance-support',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agent Maintenance & Support | DoDAO',
    description: 'Always-on monitoring, same-day triage, and quarterly upgrades for AI agents in production.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

export default function MaintenanceSupportPage() {
  return (
    <PageWrapper>
      <MaintenanceSupport />
    </PageWrapper>
  );
}
