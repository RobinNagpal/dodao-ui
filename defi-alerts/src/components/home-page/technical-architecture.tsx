import { Database, Cpu, Send, BarChart, Clock } from 'lucide-react';

const steps = [
  {
    title: 'Event Ingest Layer',
    description: 'Indexers, RPC, subgraphs, APIs',
    icon: Database,
    detail:
      'Collects data from multiple sources including on-chain RPC nodes, The Graph subgraphs, third-party indexers, and off-chain APIs for maximum coverage.',
    metrics: '< 60 sec evaluation time',
  },
  {
    title: 'Real-Time Rule Engine',
    description: 'User rules, templates, conditions',
    icon: Cpu,
    detail: 'Advanced rule processing system evaluates complex conditions with boolean logic, decimal precision thresholds, and comparison operators.',
    metrics: '< 300ms p95 rule evaluation',
  },
  {
    title: 'Notification Dispatcher',
    description: 'Multi-channel delivery, retry logic',
    icon: Send,
    detail: 'Routes alerts to user-specified channels (Email, SMS, Push, Telegram, Discord, Slack, Webhook) with configurable frequency and severity levels.',
    metrics: '99.9% delivery success',
  },
  {
    title: 'Alert Router & User Database',
    description: 'Configuration management, portfolios',
    icon: Clock,
    detail: 'Central system for managing user preferences, alert configurations, and portfolio tracking across multiple wallets and chains.',
    metrics: 'Support for 1M+ active users',
  },
  {
    title: 'Analytics & Monitoring',
    description: 'Delivery logs, performance metrics',
    icon: BarChart,
    detail: 'Comprehensive observability with structured logs, Prometheus metrics, and OpenTelemetry traces for system health monitoring and user insights.',
    metrics: 'Actionable KPIs & SLO tracking',
  },
];

const TechnicalArchitecture = () => {
  return (
    <section id="architecture" className="py-24 bg-[#1e202d]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-[#f1f1f3]">System Architecture</h2>
        <p className="text-[#f1f1f3] text-center max-w-2xl mx-auto mb-6">
          Our stateless microservice architecture is built for horizontal scaling, high availability, and real-time performance.
        </p>
        <p className="text-[#00AD79] text-center text-sm font-mono mb-12">
          Redis pub/sub • Postgres • BigQuery/Snowflake • Kubernetes • Prometheus • OpenTelemetry
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
