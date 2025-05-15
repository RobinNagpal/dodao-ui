// defi-alerts/src/components/home-page/why-defi-alerts.tsx
import { TrendingUp, Layers, Clock, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const BG_MUTED = 'hsl(240_4.8%_95.9%/0.5)'; // --muted/50
const FG_MUTED = 'hsl(240_3.8%_46.1%)'; // --muted-foreground
const PRIMARY = 'hsl(270_50%_40%)'; // --primary
const PRIMARY_10 = 'hsl(270_50%_40%/0.1)';
const BORDER = 'hsl(240_5.9%_90%)';

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
      "Your wallet isn't static. Alerts auto-track your positions, so you can adjust supply/borrow limits or rebalance whenever your thresholds are hit.",
    icon: Wallet,
  },
];

const WhyDefiAlerts = () => (
  <section id="why-alerts" className={`py-24 bg-[${BG_MUTED}]`}>
    <div className="container mx-auto px-4">
      <h2 className="mb-4 text-center text-3xl font-bold">Why DeFi Alerts Matter</h2>

      <p className={`mx-auto mb-12 max-w-2xl text-center text-[${FG_MUTED}]`}>
        DeFi interest rates swing up and down all day long—and new markets launch every week. Without alerts, users can miss the best times to supply or borrow.
        Here’s why every protocol and user needs a real-time alert system:
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {reasons.map(({ title, description, icon: Icon }, i) => (
          <Card key={i} className={`transition-shadow hover:shadow-md border border-[${BORDER}]`}>
            <CardHeader className="pb-2">
              <Icon className={`mb-2 h-12 w-12 rounded-md p-2 bg-[${PRIMARY_10}] text-[${PRIMARY}]`} />
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default WhyDefiAlerts;
