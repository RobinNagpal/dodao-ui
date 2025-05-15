import { Bell, Layers, Zap, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'Real-Time Rate Alerts',
    description: 'Thresholds, ranges, instant or scheduled.',
    icon: Bell,
  },
  {
    title: 'Multi-Chain & Asset Support',
    description: 'Ethereum, Polygon, Base… any ERC-20.',
    icon: Layers,
  },
  {
    title: 'Flexible Delivery',
    description: 'Email, webhooks, and in-platform notifications.',
    icon: Zap,
  },
  {
    title: 'Auto-Wallet Tracking',
    description: 'Connect your wallet; auto-generate alerts.',
    icon: Wallet,
  },
];

const FeatureCards = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">What We Built</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Our platform provides comprehensive DeFi alerting solutions with enterprise-grade reliability and flexibility.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <feature.icon className="h-12 w-12 p-2 rounded-md bg-primary/10 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
