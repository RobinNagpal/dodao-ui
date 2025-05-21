import { Shield, BarChart3, Rocket, ServerOff, Globe } from 'lucide-react';

const benefits = [
  {
    title: 'Enterprise-Grade Performance',
    description: 'Process 10,000+ events/sec with < 300ms latency and 99.9% delivery success rate.',
    icon: BarChart3,
    metric: 'Up to 100M active alerts',
  },
  {
    title: 'Bulletproof Security',
    description: 'SOC 2 Type II compliant with HSM-stored secrets and encrypted sensitive data.',
    icon: Shield,
    metric: 'GDPR & privacy ready',
  },
  {
    title: 'High Resilience',
    description: 'Zero data loss during provider outages with auto-failover and distributed architecture.',
    icon: ServerOff,
    metric: '99.99% uptime SLA',
  },
  {
    title: 'Global Accessibility',
    description: 'Fully internationalized with support for locale-specific number formats and dates.',
    icon: Globe,
    metric: 'i18n/Unicode ready',
  },
];

const successKPIs = [
  { metric: '% positions improved within 24h of alert', target: 'Track & maximize' },
  { metric: 'Avg. increase in effective APY after optimization', target: 'Measure ROI' },
  { metric: '# integrations built via webhook/API', target: 'Ecosystem growth' },
  { metric: 'Alert delivery success rate', target: '> 99% guaranteed' },
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-24 bg-[#0D131A]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-4 text-[#f1f1f3]">Enterprise-Grade Reliability</h2>
        <p className="text-[#f1f1f3] text-center max-w-2xl mx-auto mb-12">
          Our platform is built to meet the demanding requirements of institutional users while remaining accessible to individuals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 rounded-full bg-[#00AD79]/10">
                <benefit.icon className="h-8 w-8 text-[#00AD79]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#f1f1f3]">{benefit.title}</h3>
              <p className="text-[#f1f1f3]/80 mb-2">{benefit.description}</p>
              <span className="text-sm font-medium bg-[#0D131A] px-3 py-1 rounded-full text-[#00AD79]">{benefit.metric}</span>
            </div>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-center mb-6 text-[#f1f1f3]">Success Metrics We Track</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {successKPIs.map((kpi, index) => (
            <div key={index} className="bg-[#1e202d] p-4 rounded-lg border border-[#d1d5da]">
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
