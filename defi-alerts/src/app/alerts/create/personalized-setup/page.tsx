"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  Bell,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotificationContext } from "@dodao/web-core/ui/contexts/NotificationContext";
import { utils } from "ethers";

export default function PersonalizedSetupPage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState("");
  const { showNotification } = useNotificationContext();

  const handleNext = () => {
    if (!walletAddress) {
      showNotification({
        type: "error",
        heading: "Missing Address",
        message: "Please enter your wallet address before moving on.",
      });
      return;
    }

    if (!utils.isAddress(walletAddress.trim())) {
      showNotification({
        type: "error",
        heading: "Invalid Address",
        message: "That doesn't look like a valid ETH address.",
      });
      return;
    }

    // stash for downstream
    localStorage.setItem("walletAddress", walletAddress);

    // route based on earlier choice
    const alertType =
      localStorage.getItem("selectedPersonalizedAlertType") || "compound";

    if (alertType === "compound") {
      router.push("/alerts/create/personalized-market");
    } else {
      router.push("/alerts/create/personalized-comparison");
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm mb-6">
        <Link
          href="/"
          className="text-theme-muted hover-text-primary flex items-center gap-1"
        >
          <Home size={14} />
          <span>Home</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-theme-muted" />
        <Link
          href="/alerts"
          className="text-theme-muted hover-text-primary flex items-center gap-1"
        >
          <Bell size={14} />
          <span>Alerts</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-theme-muted" />
        <Link
          href="/alerts/create"
          className="text-theme-muted hover-text-primary flex items-center gap-1"
        >
          <TrendingUp size={14} />
          <span>Create Alert</span>
        </Link>
        <ChevronRight size={14} className="mx-2 text-theme-muted" />
        <span className="text-theme-primary font-medium">
          Personalized Setup
        </span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-theme-primary">
          Set Up Personalized Alerts
        </h1>
        <p className="text-theme-muted">
          Configure alerts based on your wallet activity.
        </p>
      </div>

      <Card className="mb-6 border-theme-primary bg-block">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-theme-primary">
            Enter Your Wallet Address
          </CardTitle>
          <CardDescription className="text-theme-muted">
            Write your wallet address to see your active positions and set up
            personalized alerts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="walletAddress" className="text-theme-primary">
                Wallet Address
              </Label>
              <div className="flex items-center">
                <Wallet className="mr-2 h-4 w-4 text-primary-color" />
                <Input
                  id="walletAddress"
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="border-theme-primary focus-border-primary"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={() => router.push("/alerts/create")}
          className="border hover-border-primary"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <Button
          onClick={handleNext}
          className="border text-primary-color hover-border-body"
        >
          Next <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
