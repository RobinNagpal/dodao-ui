import { TrendingUp, Layers, Clock, Wallet } from 'lucide-react';

const reasons = [
  {
    title: 'Market Volatility',
    description:
      "Interest rates in DeFi change fast. If you're waiting for supply rates to rise or borrowing costs to fall, manual checks aren't enough—you need instant notifications.",
    icon: TrendingUp,
  },
  {
    title: 'Protocol Overload',
    description:
      "Hundreds of pools on Ethereum, Polygon, Base, and more… It's impossible to watch them all. Alerts centralize everything, so you never have to hop between apps.",
    icon: Layers,
  },
  {
    title: 'Opportunity Timing',
    description:
      'The right rate for your position may last only minutes. An alert system tells you exactly when to act—maximizing yield or minimizing your borrowing cost.',
    icon: Clock,
  },
  {
    title: 'Personal Portfolio Tracking',
    description:
      "Your wallet isn't static. Alerts auto–track your positions, so you can adjust supply/borrow limits or rebalance whenever your set thresholds are hit.",
    icon: Wallet,
  },
];

const WhyDefiAlerts = () => {
  return (
    <section id="why-alerts" className="py-20 bg-[#1e202d]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-4 text-[#f1f1f3]">Why DeFi Alerts Matter</h2>
        <p className="text-[#f1f1f3] text-center max-w-2xl mx-auto mb-12">
          DeFi interest rates swing up and down all day long—and new markets launch every week. Without alerts, users can miss the best times to supply or
          borrow. Here’s why every protocol and user needs a real-time alert system:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="bg-[#0D131A] rounded-lg border border-[#d1d5da] p-6 hover:shadow-md transition-shadow">
              <div className="pb-2">
                <div className="h-12 w-12 p-2 rounded-md bg-[#00AD79]/10 text-[#00AD79] mb-2">
                  <reason.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-[#f1f1f3]">{reason.title}</h3>
              </div>
              <div>
                <p className="text-base text-[#f1f1f3]/80">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyDefiAlerts;
