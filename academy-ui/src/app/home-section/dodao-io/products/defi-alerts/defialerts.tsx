import {
  BellIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  EyeIcon,
  LinkIcon,
  ScaleIcon,
  ShieldCheckIcon,
  UserIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import ProductPage, { ProductPageContent } from '@/components/home/DoDAOHome/products/ProductPage';
import DefiGif from '@/images/DoDAOHomePage/defi_alerts.gif';

const benefits = [
  {
    name: 'Never Miss Opportunities',
    description: 'Get instant alerts when supply or borrow rates cross your target across Compound and the protocols you compare it with.',
    icon: BellIcon,
  },
  {
    name: 'Maximize Your Yields',
    description: 'Compare rates across Compound, Aave, Spark and Morpho in real time, so you always know where your assets earn the most.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Protect Your Positions',
    description: 'Monitor every active position across protocols with personalised health alerts and early liquidation warnings.',
    icon: ShieldCheckIcon,
  },
];

const features = [
  {
    name: 'Compound Market Monitoring',
    description: 'Track supply and borrow APR on any Compound market. Set multiple thresholds and get notified the moment a rate moves in your favor.',
    icon: EyeIcon,
  },
  {
    name: 'Custom Alert Thresholds',
    description: 'Define precise thresholds for supply rates, borrow rates and position health. Multiple alerts per market with different severity levels.',
    icon: ScaleIcon,
  },
  {
    name: 'Multi-Channel Delivery',
    description: 'Receive alerts via email or webhook endpoints. Route different types of alerts through different channels based on urgency.',
    icon: EnvelopeIcon,
  },
  {
    name: 'Personalized Position Tracking',
    description: 'Pass a wallet address and we automatically fetch and monitor your active positions across Compound, Aave, Spark and Morpho.',
    icon: UserIcon,
  },
  {
    name: 'Cross-Protocol Rate Comparison',
    description: 'Compare Compound rates with Aave, Spark and Morpho in real time. Get notified when one protocol is meaningfully ahead of another.',
    icon: ChartBarIcon,
  },
  {
    name: 'Flexible Notification Frequency',
    description: 'Choose anything from instant alerts to daily summaries, so you stay informed without notification fatigue.',
    icon: ClockIcon,
  },
];

const protocols = [
  {
    name: 'Built for Compound',
    description: 'DeFi Alerts was first built and battle-tested for Compound. We monitor every Compound market with deep integration and real-time data feeds.',
  },
  {
    name: 'Extended to Major Protocols',
    description: 'Coverage has expanded to Aave, Spark and Morpho. Compare rates, track positions and get unified alerts across the lending ecosystem.',
  },
];

const useCases = [
  {
    title: 'For Yield Farmers',
    description: 'Maximise returns by getting instant alerts the moment a better rate becomes available across protocols.',
    icon: CurrencyDollarIcon,
  },
  {
    title: 'For Position Managers',
    description: 'Keep leveraged positions safe with continuous health monitoring and early liquidation warnings.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'For Protocol Teams',
    description: 'Monitor your protocol’s competitive position and user activity with our developer API.',
    icon: LinkIcon,
  },
  {
    title: 'For Wallet Providers',
    description: 'Integrate DeFi alerts into your wallet so users get proactive position management out of the box.',
    icon: WalletIcon,
  },
];

const content: ProductPageContent = {
  kind: 'DeFi tooling',
  name: 'DeFi Alerts',
  lead: 'Monitor Compound rates, compare them with Aave, Spark and Morpho, and get personalised alerts on every active position. Built first for Compound, it extends cleanly to the major DeFi lending protocols.',
  highlights: ['Compound, Aave, Spark, Morpho', 'Real-time rate alerts', 'Email and webhook delivery'],
  primaryCta: { label: 'Get started', href: 'mailto:info@dodao.com?subject=DeFi%20Alerts' },
  secondaryCta: { label: 'Open DeFi Alerts', href: 'https://compound.defialerts.xyz/' },
  preview: { image: DefiGif, alt: 'DeFi Alerts platform preview', url: 'compound.defialerts.xyz' },
  story: {
    title: 'From one protocol to a whole ecosystem',
    lead: 'Compound is where DeFi Alerts started. Today it watches the largest lending protocols and surfaces the best rate at any moment.',
    items: protocols,
  },
  features: {
    title: 'Comprehensive DeFi monitoring',
    lead: 'From rate monitoring to position management, everything you need to stay ahead of fast-moving lending markets.',
    items: features,
  },
  audiences: {
    title: 'Who it is for',
    lead: 'Whether you are optimising yields, managing positions or building DeFi products, the alerts keep you ahead of the market.',
    items: useCases.map((useCase) => ({ name: useCase.title, description: useCase.description, icon: useCase.icon })),
  },
  benefits: {
    title: 'Stay ahead of DeFi markets',
    lead: 'Rates change by the minute and positions can turn unhealthy quickly. Let the alerts keep watch instead of checking by hand.',
    items: benefits,
  },
};

function DeFiAlertsComponent() {
  return <ProductPage content={content} />;
}

export default DeFiAlertsComponent;
