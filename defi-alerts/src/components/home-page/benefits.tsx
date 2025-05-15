// defi-alerts/src/components/home-page/benefits.tsx
import { Shield, Puzzle, Rocket, Clock } from 'lucide-react';

const benefits = [
  {
    title: 'Built for Scale',
    description: 'Handle millions of alerts per day without breaking a sweat.',
    icon: Shield,
  },
  {
    title: 'Plug-and-Play',
    description: 'Integrate in days—extensible to any on-chain data source.',
    icon: Puzzle,
  },
  {
    title: 'Fast Onboarding',
    description: 'Get live alerts in under 1 month, with full hand-holding.',
    icon: Rocket,
  },
  {
    title: 'Always On',
    description: 'Dedicated support team available around the clock.',
    icon: Clock,
  },
];

const Benefits = () => {
  return (
    /* bg-background → hsl(0 0% 100%) */
    <section id="benefits" className="py-24 bg-[hsl(0_0%_100%)]">
      <div className="container mx-auto px-4">
        <h2 className="mb-4 text-center text-3xl font-bold">Why Partner With Us</h2>

        {/* muted-foreground → hsl(240 3.8% 46.1%) */}
        <p className="mx-auto mb-12 max-w-2xl text-center text-[hsl(240_3.8%_46.1%)]">
          We bring technical excellence and deep DeFi knowledge to every partnership.
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ title, description, icon: Icon }, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              {/* bg-primary/10 → primary with 10 % opacity */}
              <div className="mb-4 rounded-full p-3 bg-[hsl(270_50%_40%/0.1)]">
                {/* text-primary → primary */}
                <Icon className="h-8 w-8 text-[hsl(270_50%_40%)]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{title}</h3>
              <p className="text-[hsl(240_3.8%_46.1%)]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
