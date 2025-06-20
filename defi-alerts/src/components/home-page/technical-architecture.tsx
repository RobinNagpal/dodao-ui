import { Database, Cpu, Send, BarChart, Clock } from 'lucide-react';

const steps = [
  {
    title: 'Data Collection Layer',
    description: 'RPC, The Graph, and APIs',
    icon: Database,
    detail: 'Pulls data from on-chain RPC nodes, The Graph subgraphs, and other APIs to give you full market coverage.',
    metrics: 'Real-time data collection',
  },
  {
    title: 'Smart Alert Engine',
    description: 'Condition checking and processing',
    icon: Cpu,
    detail: 'Continuously evaluates your custom alert conditions and thresholds to determine when to send you notifications.',
    metrics: 'Instant condition checking',
  },
  {
    title: 'Notification Delivery',
    description: 'Email, Telegram, Discord, Webhooks',
    icon: Send,
    detail: 'Sends your alerts exactly where you want them, with configurable frequency, severity (Low/Medium/High), and retry logic.',
    metrics: 'Reliable delivery',
  },
  {
    title: 'User Management System',
    description: 'User settings & portfolios',
    icon: Clock,
    detail: 'Manages your alert configurations, wallet addresses, and preferences across all supported protocols and chains.',
    metrics: 'Secure & organized',
  },
  {
    title: 'Dashboard & History',
    description: 'Alert tracking and insights',
    icon: BarChart,
    detail: 'Provides a complete dashboard to view all your active alerts, detailed history of triggered notifications, and performance insights.',
    metrics: 'Complete visibility',
  },
];

const TechnicalArchitecture = () => {
  return (
    <section id="architecture" className="py-20 bg-[#1e202d]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-[#f1f1f3]">How Our Platform Works</h2>
        <p className="text-[#f1f1f3] text-center max-w-2xl mx-auto mb-12">
          Our platform is built for reliability and speed, ensuring you never miss important DeFi opportunities or risks.
        </p>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#00AD79]/20 -translate-x-1/2 hidden md:block" />

          <div className="space-y-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center gap-6">
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:text-right md:order-first' : 'md:order-last'}`}>
                  <h3 className="text-xl font-semibold mb-2 text-[#f1f1f3]">{step.title}</h3>
                  <p className="text-[#f1f1f3]/80 mb-2">{step.description}</p>
                  <span className="inline-block bg-[#00AD79]/10 text-[#00AD79] text-xs px-2 py-1 rounded-full">{step.metrics}</span>
                </div>

                <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-[#0D131A] border-4 border-[#00AD79]/20">
                  <step.icon className="h-8 w-8 text-[#00AD79]" />
                </div>

                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:order-last' : 'md:order-first md:text-right'}`}>
                  <p className="text-[#f1f1f3]/80">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnicalArchitecture;
