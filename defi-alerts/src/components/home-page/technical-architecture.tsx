// defi-alerts/src/components/home-page/technical-architecture.tsx
import { Database, Cpu, Send, BarChart } from 'lucide-react';

const BG_MUTED = 'hsl(240_4.8%_95.9%/0.5)'; // --muted/50
const FG_MUTED = 'hsl(240_3.8%_46.1%)'; // --muted-foreground
const BG_CARD = 'hsl(0_0%_100%)'; // --background
const BORDER_BR = 'hsl(240_5.9%_90%)'; // --border
const PRIMARY = 'hsl(270_50%_40%)'; // --primary
const PRIMARY_20 = 'hsl(270_50%_40%/0.2)';
const PRIMARY_10 = 'hsl(270_50%_40%/0.1)';

const steps = [
  { title: 'Data Ingestion', description: 'On-chain RPC or third-party indexers.', icon: Database },
  { title: 'Condition Engine', description: 'Customizable rules, severity levels.', icon: Cpu },
  { title: 'Delivery Pipeline', description: 'Queueing, retries, multi-channel.', icon: Send },
  { title: 'Dashboard & Reporting', description: 'Audit logs, historical alerts.', icon: BarChart },
];

const TechnicalArchitecture = () => (
  <section id="architecture" className={`py-24 bg-[${BG_MUTED}]`}>
    <div className="container mx-auto px-4">
      <h2 className="mb-4 text-center text-3xl font-bold">Technical Architecture</h2>

      <p className={`mx-auto mb-12 max-w-2xl text-center text-[${FG_MUTED}]`}>
        Our platform is built with scalability and reliability at its core, designed to handle the unique challenges of DeFi data.
      </p>

      <div className="relative mx-auto max-w-4xl">
        {/* dotted line */}
        <div className={`absolute left-1/2 top-0 bottom-0 hidden w-0.5 -translate-x-1/2 bg-[${PRIMARY_20}] md:block`} />

        <div className="relative space-y-12">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-6 md:flex-row">
              {/* left / right text */}
              <div className={`md:w-1/2 ${idx % 2 === 0 ? 'md:text-right md:order-first' : 'md:order-last'}`}>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className={`text-[${FG_MUTED}]`}>{step.description}</p>
              </div>

              {/* center icon */}
              <div
                className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full
                            bg-[${BG_CARD}] border-4 border-[${PRIMARY_20}]`}
              >
                <step.icon className={`h-8 w-8 text-[${PRIMARY}]`} />
              </div>

              {/* explanatory prose */}
              <div className={`md:w-1/2 ${idx % 2 === 0 ? 'md:order-last' : 'md:order-first md:text-right'}`}>
                {idx === 0 && (
                  <p className="prose-sm max-w-none">
                    Our system continuously monitors on-chain data across multiple blockchains, processing millions of data points in real-time.
                  </p>
                )}
                {idx === 1 && (
                  <p className="prose-sm max-w-none">
                    Advanced rule engine allows for complex conditions with boolean logic, thresholds, and time-based triggers.
                  </p>
                )}
                {idx === 2 && (
                  <p className="prose-sm max-w-none">Reliable delivery system that ensures notifications reach users through their preferred channels.</p>
                )}
                {idx === 3 && (
                  <p className="prose-sm max-w-none">
                    Users can manage their alerts through the dashboard—viewing, editing, deleting, and tracking alert history with ease.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TechnicalArchitecture;
