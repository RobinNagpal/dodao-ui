"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ArrowRight,
  Home,
  Bell,
  TrendingUp,
  BarChart3,
  Wallet,
  LineChart,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CreateAlertPage() {
  const router = useRouter();

  const handleSelectAlertType = (type: string, subtype: string) => {
    if (type === "general" && subtype === "compound") {
      router.push("/alerts/create/compound-market");
    } else if (type === "general" && subtype === "outperforms") {
      router.push("/alerts/create/compare-compound");
    } else if (type === "personalized") {
      // Store the selected personalized alert type for later use
      localStorage.setItem("selectedPersonalizedAlertType", subtype);
      router.push("/alerts/create/personalized-setup");
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm mb-6">
        <Link
          href="/"
          className="text-theme-muted hover-text-slate-900 flex items-center gap-1"
        >
          <Home size={14} />
          <span>Home</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-slate-400" />
        <Link
          href="/alerts"
          className="text-theme-muted hover-text-slate-900 flex items-center gap-1"
        >
          <Bell size={14} />
          <span>Alerts</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-slate-400" />
        <span className="text-theme-primary font-medium">Create Alert</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-theme-primary">
          Create Alert
        </h1>
        <p className="text-theme-muted">
          Choose the type of alert you want to create for DeFi markets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* General Market Alerts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="text-theme-secondary" />
            <h2 className="text-xl font-bold text-theme-primary">
              General Market Alerts
            </h2>
          </div>
          <p className="text-theme-muted mb-4">
            Monitor any market or chain on Compound
          </p>

          <Card className="overflow-hidden border-theme-primary transition-all hover:shadow-md">
            <CardHeader className="bg-theme-bg-secondary pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-theme-primary">
                <TrendingUp size={18} className="text-theme-secondary" />
                Compound Alerts
              </CardTitle>
              <CardDescription className="text-theme-muted">
                Get notified when market rates change
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-theme-secondary mb-2">
                <Badge variant="outline" className="bg-theme-bg-primary">
                  Supply APY
                </Badge>
                <Badge variant="outline" className="bg-theme-bg-primary">
                  Borrow APY
                </Badge>
              </div>
              <p className="text-sm text-theme-muted">
                Track specific metrics for any Compound market and get alerts
                when they cross your thresholds.
              </p>
            </CardContent>
            <CardFooter className="border-t border-theme-border-primary bg-theme-bg-secondary flex justify-end py-3">
              <Button
                variant="ghost"
                className="text-theme-secondary hover-text-slate-900 hover-bg-slate-100 gap-1"
                onClick={() => handleSelectAlertType("general", "compound")}
              >
                Select <ArrowRight size={16} />
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden border-theme-primary transition-all hover:shadow-md">
            <CardHeader className="bg-theme-bg-secondary pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-theme-primary">
                <ArrowUpRight size={18} className="text-theme-secondary" />
                When Compound Outperforms
              </CardTitle>
              <CardDescription className="text-theme-muted">
                Get notified when Compound offers better rates than other
                protocols
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-theme-secondary mb-2">
                <Badge variant="outline" className="bg-theme-bg-primary">
                  Aave
                </Badge>
                <Badge variant="outline" className="bg-theme-bg-primary">
                  Morpho
                </Badge>
                <Badge variant="outline" className="bg-theme-bg-primary">
                  Spark
                </Badge>
              </div>
              <p className="text-sm text-theme-muted">
                Compare Compound with other DeFi protocols and get alerts when
                Compound offers better rates.
              </p>
            </CardContent>
            <CardFooter className="border-t border-theme-border-primary bg-theme-bg-secondary flex justify-end py-3">
              <Button
                variant="ghost"
                className="text-theme-secondary hover-text-slate-900 hover-bg-slate-100 gap-1"
                onClick={() => handleSelectAlertType("general", "outperforms")}
              >
                Select <ArrowRight size={16} />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Your Personalized Alerts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="text-theme-secondary" />
            <h2 className="text-xl font-bold text-theme-primary">
              Your Personalized Alerts
            </h2>
          </div>
          <p className="text-theme-muted mb-4">
            Monitor markets based on your wallet activity and positions
          </p>

          <Card className="overflow-hidden border-theme-primary transition-all hover:shadow-md">
            <CardHeader className="bg-theme-bg-secondary pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-theme-primary">
                <LineChart size={18} className="text-theme-secondary" />
                Compound Alerts
              </CardTitle>
              <CardDescription className="text-theme-muted">
                Get notified when market rates change for your positions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-theme-secondary mb-2">
                <Badge variant="outline" className="bg-theme-bg-primary">
                  Your Supplies
                </Badge>
                <Badge variant="outline" className="bg-theme-bg-primary">
                  Your Borrows
                </Badge>
              </div>
              <p className="text-sm text-theme-muted">
                Track metrics for markets where you have active positions and
                get personalized alerts.
              </p>
            </CardContent>
            <CardFooter className="border-t border-theme-border-primary bg-theme-bg-secondary flex justify-end py-3">
              <Button
                variant="ghost"
                className="text-theme-secondary hover-text-slate-900 hover-bg-slate-100 gap-1"
                onClick={() =>
                  handleSelectAlertType("personalized", "compound")
                }
              >
                Select <ArrowRight size={16} />
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden border-theme-primary transition-all hover:shadow-md">
            <CardHeader className="bg-theme-bg-secondary pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-theme-primary">
                <TrendingUp size={18} className="text-theme-secondary" />
                When Compound Outperforms
              </CardTitle>
              <CardDescription className="text-theme-muted">
                Get notified when you can earn more or save more using Compound
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-theme-secondary mb-2">
                <Badge variant="outline" className="bg-theme-bg-primary">
                  Better Rates
                </Badge>
                <Badge variant="outline" className="bg-theme-bg-primary">
                  Lower Fees
                </Badge>
              </div>
              <p className="text-sm text-theme-muted">
                Compare your current positions with Compound and get alerts when
                you could benefit from switching.
              </p>
            </CardContent>
            <CardFooter className="border-t border-theme-border-primary bg-theme-bg-secondary flex justify-end py-3">
              <Button
                variant="ghost"
                className="text-theme-secondary hover-text-slate-900 hover-bg-slate-100 gap-1"
                onClick={() =>
                  handleSelectAlertType("personalized", "outperforms")
                }
              >
                Select <ArrowRight size={16} />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
