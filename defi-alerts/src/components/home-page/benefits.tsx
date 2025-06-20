import { Shield, BarChart3, ServerOff, Globe } from 'lucide-react';

const benefits = [
  {
    title: 'Instant Alerts',
    description: 'Get notified immediately when your DeFi conditions are met.',
    icon: BarChart3,
    metric: 'Seconds to delivery',
  },
  {
    title: 'Privacy First',
    description: 'Your wallet addresses and settings stay safe and private.',
    icon: Shield,
    metric: 'Encrypted data',
  },
  {
    title: 'Always On',
    description: 'Our service runs 24/7 so you never miss a market move.',
    icon: ServerOff,
    metric: '99.9% uptime',
  },
  {
    title: 'Multi-Chain Support',
    description: 'Works across Ethereum, Polygon, Base, and more.',
    icon: Globe,
    metric: 'All major chains',
  },
];

const successKPIs = [
  { metric: 'Alerts delivered on time', target: '> 99%' },
  { metric: 'Markets monitored', target: 'All Compound markets' },
  { metric: 'Wallets tracked', target: 'Unlimited addresses' },
  { metric: 'Custom alerts created', target: 'Unlimited' },
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-20 bg-[#0D131A]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-4 text-[#f1f1f3]">Key Benefits</h2>
        <p className="text-[#f1f1f3] text-center max-w-2xl mx-auto mb-12">Fast, secure, always on, and multi-chain alerting for everyone.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((b, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 rounded-full bg-[#00AD79]/10">
                <b.icon className="h-8 w-8 text-[#00AD79]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#f1f1f3]">{b.title}</h3>
              <p className="text-[#f1f1f3]/80 mb-2">{b.description}</p>
              <span className="text-sm font-medium bg-[#0D131A] px-3 py-1 rounded-full text-[#00AD79]">{b.metric}</span>
            </div>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-center mb-6 text-[#f1f1f3]">How We Measure Success</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {successKPIs.map((kpi, i) => (
            <div key={i} className="bg-[#1e202d] p-4 rounded-lg border border-[#d1d5da]">
              <div className="font-medium text-[#f1f1f3] mb-1">{kpi.metric}</div>
              <div className="text-sm text-[#00AD79]">{kpi.target}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
