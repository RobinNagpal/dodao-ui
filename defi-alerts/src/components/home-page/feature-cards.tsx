import { Bell, Layers, Zap, Wallet } from 'lucide-react';

const features = [
  {
    title: 'Real-Time Rate Alerts',
    description: 'Thresholds, ranges, instant or scheduled.',
    icon: Bell,
  },
  {
    title: 'Multi-Chain & Asset Support',
    description: 'Ethereum, Polygon, Base… any ERC-20.',
    icon: Layers,
  },
  {
    title: 'Flexible Delivery',
    description: 'Email, webhooks, and in-platform notifications.',
    icon: Zap,
  },
  {
    title: 'Auto-Wallet Tracking',
    description: 'Connect your wallet; auto-generate alerts.',
    icon: Wallet,
  },
];

const FeatureCards = () => {
  return (
    <section id="features" className="py-24 bg-[#0D131A]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-[#f1f1f3]">What We Built</h2>
        <p className="text-[#f1f1f3] text-center max-w-2xl mx-auto mb-12">
          Our platform provides comprehensive DeFi alerting solutions with enterprise-grade reliability and flexibility.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-[#1e202d] rounded-lg border border-[#d1d5da] hover:shadow-md transition-shadow">
              <div className="p-6 pb-2">
                <feature.icon className="h-12 w-12 p-2 rounded-md bg-[#00AD79]/10 text-[#00AD79] mb-2" />
                <h3 className="text-xl font-semibold text-[#f1f1f3]">{feature.title}</h3>
              </div>
              <div className="px-6 pb-6">
                <p className="text-base text-[#f1f1f3]/80">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
