import { Database, Cpu, Send, BarChart } from 'lucide-react';

const steps = [
  {
    title: 'Data Ingestion',
    description: 'On-chain RPC or third-party indexers.',
    icon: Database,
    detail: 'Our system continuously monitors on-chain data across multiple blockchains, processing millions of data points in real-time.',
  },
  {
    title: 'Condition Engine',
    description: 'Customizable rules, severity levels.',
    icon: Cpu,
    detail: 'Advanced rule engine allows for complex conditions with boolean logic, thresholds, and time-based triggers.',
  },
  {
    title: 'Delivery Pipeline',
    description: 'Queueing, retries, multi-channel.',
    icon: Send,
    detail: 'Reliable delivery system that ensures notifications reach users through their preferred channels.',
  },
  {
    title: 'Dashboard & Reporting',
    description: 'Audit logs, historical alerts.',
    icon: BarChart,
    detail: 'Users can manage their alerts through the dashboard—viewing, editing, deleting, and tracking alert history with ease.',
  },
];

const TechnicalArchitecture = () => {
  return (
    <section id="architecture" className="py-24 bg-[#1e202d]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-4 text-[#f1f1f3]">Technical Architecture</h2>
        <p className="text-[#f1f1f3] text-center max-w-2xl mx-auto mb-12">
          Our platform is built with scalability and reliability at its core, designed to handle the unique challenges of DeFi data.
        </p>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#00AD79]/20 -translate-x-1/2 hidden md:block" />

          <div className="space-y-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center gap-6">
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:text-right md:order-first' : 'md:order-last'}`}>
                  <h3 className="text-xl font-semibold mb-2 text-[#f1f1f3]">{step.title}</h3>
                  <p className="text-[#f1f1f3]/80">{step.description}</p>
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
