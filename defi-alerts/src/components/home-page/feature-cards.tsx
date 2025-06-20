import { Bell, Sliders, Send, Wrench } from 'lucide-react';

const features = [
  {
    title: 'Flexible Alert Configuration',
    description: 'Set up custom alerts with precise thresholds and conditions using our simple alert builder.',
    icon: Sliders,
    details: ['Precise percentage settings', 'Above, below, or range alerts', 'Custom templates & presets', 'Portfolio groups'],
  },
  {
    title: 'Multi-Channel Delivery',
    description: 'Get alerts delivered exactly how you want: Email, Telegram, Discord, Slack, or custom webhooks.',
    icon: Send,
    details: ['Control alert frequency', 'Severity levels (Low/Medium/High)', 'Edit, delete, or pause alerts', 'Email notifications'],
  },
  {
    title: 'Smart Portfolio Tracking',
    description: 'Simply add your wallet addresses to automatically discover all your DeFi positions across multiple protocols and chains.',
    icon: Bell,
    details: ['No wallet connection required', 'Track multiple wallet addresses', 'Supply & borrow monitoring', 'Monitor competitors for better rates'],
  },
  {
    title: 'Custom Platform Development',
    description: 'Need alerts for your specific protocol? We build custom alert systems tailored to your unique DeFi requirements.',
    icon: Wrench,
    details: ['Protocol-specific alerts', 'Custom monitoring solutions', 'Tailored notification systems', 'Enterprise integrations'],
  },
];

const FeatureCards = () => {
  return (
    <section id="features" className="py-20 bg-[#0D131A]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-4 text-[#f1f1f3]">Smart Alerts Made Simple</h2>
        <p className="text-[#f1f1f3] text-center max-w-2xl mx-auto mb-12">
          We offer a complete DeFi alert platform with flexible customization options, ensuring you get exactly the information you need, when and how you want
          it.
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
