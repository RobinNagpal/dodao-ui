import {
  ArrowPathRoundedSquareIcon,
  ChartBarSquareIcon,
  ClipboardDocumentCheckIcon,
  CpuChipIcon,
  DocumentChartBarIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import ProductPage, { ProductPageContent } from '@/components/home/DoDAOHome/products/ProductPage';
import Chatbot from '@/images/DoDAOHomePage/koala_gains.gif';

const benefits = [
  {
    name: 'Better Investment Choices',
    description: 'KoalaGains turns raw filings and market data into clear facts, so you can see where the best chances are and act on them.',
    icon: ScaleIcon,
  },
  {
    name: 'Less Risk',
    description: 'Each report flags weaknesses, red flags and unresolved questions up front, so you avoid the deals that look good only at first glance.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Complete Analysis',
    description: 'Company performance, financials, team and market signals all show up in one place, so nothing important slips through.',
    icon: ClipboardDocumentCheckIcon,
  },
];

const features = [
  {
    name: 'All-in-One Reports',
    description: 'Cash flow, debt, market standing and team data are pulled together into a single report that shows the full picture of a project.',
    icon: DocumentChartBarIcon,
  },
  {
    name: 'Risk Checks',
    description: 'Strong and weak signals are tagged side by side, so you can see the good and the bad of a crowdfunded project or REIT at a glance.',
    icon: ShieldExclamationIcon,
  },
  {
    name: 'Team Performance',
    description: 'The team’s background and track record are scored, so you know whether they can actually deliver what the deck promises.',
    icon: UserGroupIcon,
  },
  {
    name: 'Up-to-Date Filings',
    description: 'KoalaGains continuously pulls in the latest SEC filings, so the view of any investment is current, not months out of date.',
    icon: ArrowPathRoundedSquareIcon,
  },
  {
    name: 'AI-Powered Insights',
    description: 'Our AI agents read large volumes of filings and summarise them into short, focused notes tailored to what you care about.',
    icon: CpuChipIcon,
  },
  {
    name: 'Side-by-Side Comparison',
    description: 'Compare projects on the same dimensions in one view, so the strongest opportunities stand out without spreadsheet juggling.',
    icon: ChartBarSquareIcon,
  },
];

const incentives = [
  {
    name: 'Goal and Objectives',
    description:
      'Crowdfunded projects and REITs are risky to invest in without full information. KoalaGains exists to close that information gap and surface the data that actually matters before you commit capital.',
    icon: SparklesIcon,
  },
  {
    name: 'The Solution',
    description:
      'Our AI agents read each project’s filings, market signals and team details and turn that raw data into easy-to-read reports. You get strong points, risks and growth potential in one place, so decisions are faster and more confident.',
    icon: CpuChipIcon,
  },
];

const content: ProductPageContent = {
  kind: 'AI agents',
  name: 'KoalaGains',
  lead: 'An AI-powered platform that takes the slow, manual side of investment research off your plate. It reads filings on stocks and REITs, scores risks and opportunities, and shows the strengths and weaknesses of every deal in plain language.',
  highlights: ['Auto-parsed filings', 'Risk and opportunity scoring', 'Stocks and REITs'],
  primaryCta: { label: 'Get started', href: 'mailto:info@dodao.com?subject=KoalaGains' },
  secondaryCta: { label: 'Open KoalaGains', href: 'https://koalagains.com/' },
  preview: { image: Chatbot, alt: 'KoalaGains AI investment platform preview', url: 'koalagains.com' },
  story: {
    title: 'Why we built KoalaGains',
    lead: 'The problem and the answer, so you know what the platform is for before you dig into the features.',
    items: incentives,
  },
  features: {
    title: 'Features',
    lead: 'Each feature helps you understand the key points of a stock or REIT in minutes, not days.',
    items: features,
  },
  benefits: {
    title: 'Why KoalaGains helps you',
    lead: 'The platform sifts through large data sets, finds what matters and shows it clearly, so you can move with confidence instead of guesswork.',
    items: benefits,
  },
};

function KoalaGainsComponent() {
  return <ProductPage content={content} />;
}

export default KoalaGainsComponent;
