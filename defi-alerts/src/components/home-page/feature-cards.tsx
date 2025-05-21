import { Bell, Sliders, Send, Code } from 'lucide-react';

const features = [
  {
    title: 'Flexible Alert Configuration',
    description: 'Define custom thresholds with decimal precision and complex conditions using our intuitive alert wizard.',
    icon: Sliders,
    details: ['Decimal precision (0.01%)', 'Equality operators (>, <, ≥, ≤)', 'Custom templates & presets', 'Multi-wallet portfolio groups'],
  },
  {
    title: 'Multi-Channel Delivery',
    description: 'Choose how you receive alerts: Email, SMS, Push, Telegram, Discord, Slack, PagerDuty, or custom webhooks.',
    icon: Send,
    details: ['Frequency controls', 'Severity levels (Info/Warning/Critical)', 'Batched digest options', 'Alert snoozing'],
  },
  {
    title: 'Advanced Portfolio Discovery',
    description: 'Automatic position detection across all chains via wallet connection, with manual position addition option.',
    icon: Bell,
    details: ['Cross-chain address aliasing', 'Historical backtest preview', 'Position-specific suggestions', 'Idle funds detection'],
  },
  {
    title: 'Developer-Friendly API',
    description: 'Build custom integrations with our REST/GraphQL API, webhooks, and SDKs for TypeScript, Python and Rust.',
    icon: Code,
    details: ['HMAC-signed webhooks', 'Bulk import/export', 'Sample recipes & bots', 'Rate limiting & auth controls'],
  },
];

const FeatureCards = () => {
  return (
    <section id="features" className="py-24 bg-[#0D131A]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-[#f1f1f3]">User Configuration & Delivery</h2>
        <p className="text-[#f1f1f3] text-center max-w-2xl mx-auto mb-12">
          Our platform offers extensive customization options for alerts, ensuring you receive exactly the information you need, when and how you want it.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-[#1e202d] rounded-lg border border-[#d1d5da] hover:shadow-md transition-shadow">
              <div className="p-6">
                <feature.icon className="h-12 w-12 p-2 rounded-md bg-[#00AD79]/10 text-[#00AD79] mb-2" />
                <h3 className="text-xl font-semibold text-[#f1f1f3] mb-3">{feature.title}</h3>
                <p className="text-base text-[#f1f1f3]/80 mb-4">{feature.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {feature.details.map((detail, i) => (
                    <div key={i} className="text-xs bg-[#0D131A] text-[#f1f1f3]/90 p-2 rounded">
                      ✓ {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
