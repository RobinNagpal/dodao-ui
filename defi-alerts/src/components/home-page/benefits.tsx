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
    <section id="benefits" className="py-24 bg-[#0D131A]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-[#f1f1f3]">Why Partner With Us</h2>
        <p className="text-[#f1f1f3] text-center max-w-2xl mx-auto mb-12">We bring technical excellence and deep DeFi knowledge to every partnership.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 rounded-full bg-[#00AD79]/10">
                <benefit.icon className="h-8 w-8 text-[#00AD79]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#f1f1f3]">{benefit.title}</h3>
              <p className="text-[#f1f1f3]/80">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
