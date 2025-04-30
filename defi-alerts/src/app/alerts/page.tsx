"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type Alert,
  type Condition,
  type Channel,
  severityOptions,
  frequencyOptions,
} from "@/types/alerts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  ChevronDown,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

// Alert summary component
const AlertSummaryCard = ({
  title,
  count,
  marketAlerts,
  icon,
  className,
}: {
  title: string;
  count: number;
  marketAlerts: number;
  icon: React.ReactNode;
  className?: string;
}) => (
  <Card className={`border-theme-border-primary ${className}`}>
    <CardContent className="p-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-theme-primary flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <span className="text-2xl font-bold text-theme-primary">{count}</span>
      </div>
      <div className="text-sm text-theme-muted">
        {marketAlerts} market alerts
      </div>
    </CardContent>
  </Card>
);

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const [chainFilter, setChainFilter] = useState("all");

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/alerts?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        // Filter out comparison alerts
        const nonComparisonAlerts = data.filter(
          (alert: Alert) => !alert.isComparison
        );
        setAlerts(nonComparisonAlerts);
        setFilteredAlerts(nonComparisonAlerts);
      });
  }, [userId]);

  useEffect(() => {
    let result = [...alerts];

    // Apply category filter
    if (activeTab !== "all") {
      result = result.filter((alert) =>
        activeTab === "general"
          ? alert.category === "GENERAL"
          : alert.category === "PERSONALIZED"
      );
    }

    // Apply action type filter
    if (actionTypeFilter !== "all") {
      result = result.filter(
        (alert) => alert.actionType === actionTypeFilter.toUpperCase()
      );
    }

    // Apply chain filter
    if (chainFilter !== "all") {
      result = result.filter((alert) =>
        alert.selectedChains.some(
          (chain) => chain.toLowerCase() === chainFilter.toLowerCase()
        )
      );
    }

    setFilteredAlerts(result);
  }, [activeTab, actionTypeFilter, chainFilter, alerts]);

  const severityLabel = (s: Condition) =>
    severityOptions.find((o) => o.value === s.severity)?.label || "-";

  const freqLabel = (f: string) =>
    frequencyOptions.find((o) => o.value === f)?.label || f;

  // Calculate summary counts
  const totalAlerts = filteredAlerts.length;
  const supplyAlerts = filteredAlerts.filter(
    (a) => a.actionType === "SUPPLY"
  ).length;
  const borrowAlerts = filteredAlerts.filter(
    (a) => a.actionType === "BORROW"
  ).length;
  const personalizedAlerts = filteredAlerts.filter(
    (a) => a.category === "PERSONALIZED"
  ).length;

  // Get unique chains for filter
  const uniqueChains = Array.from(
    new Set(alerts.flatMap((alert) => alert.selectedChains))
  );

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "LOW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-theme-primary">
            Market Alerts
          </h1>
          <p className="text-theme-muted">
            Monitor market rates and get notified when conditions are met.
          </p>
        </div>
        <Button
          onClick={() => router.push("/alerts/create")}
          className="mt-4 md:mt-0 bg-primary text-white hover-bg-slate-800"
        >
          <Plus size={16} className="mr-2" /> Create Alert
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Tabs
          defaultValue="all"
          className="w-full md:w-auto"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="all">All Alerts</TabsTrigger>
            <TabsTrigger value="general">General Alerts</TabsTrigger>
            <TabsTrigger value="personalized">Personalized Alerts</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="flex gap-2">
            <Button
              variant={actionTypeFilter === "borrow" ? "default" : "outline"}
              onClick={() =>
                setActionTypeFilter((prev) =>
                  prev === "borrow" ? "all" : "borrow"
                )
              }
              className={
                actionTypeFilter === "borrow"
                  ? "bg-primary text-white"
                  : "border-theme-border-primary text-theme-primary"
              }
            >
              <TrendingDown size={16} className="mr-2" /> Borrow Alerts
            </Button>
            <Button
              variant={actionTypeFilter === "supply" ? "default" : "outline"}
              onClick={() =>
                setActionTypeFilter((prev) =>
                  prev === "supply" ? "all" : "supply"
                )
              }
              className={
                actionTypeFilter === "supply"
                  ? "bg-primary text-white"
                  : "border-theme-border-primary text-theme-primary"
              }
            >
              <TrendingUp size={16} className="mr-2" /> Supply Alerts
            </Button>
          </div>

          <Select onValueChange={setChainFilter} defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px] border-theme-border-primary">
              <SelectValue placeholder="All Chains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chains</SelectItem>
              {uniqueChains.map((chain) => (
                <SelectItem key={chain} value={chain.toLowerCase()}>
                  {chain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AlertSummaryCard
          title="Total Alerts"
          count={totalAlerts}
          marketAlerts={totalAlerts}
          icon={<Bell size={18} />}
          className="border-l-4 border-l-theme-primary"
        />
        <AlertSummaryCard
          title="Supply Alerts"
          count={supplyAlerts}
          marketAlerts={supplyAlerts}
          icon={<TrendingUp size={18} />}
          className="border-l-4 border-l-green-500"
        />
        <AlertSummaryCard
          title="Borrow Alerts"
          count={borrowAlerts}
          marketAlerts={borrowAlerts}
          icon={<TrendingDown size={18} />}
          className="border-l-4 border-l-red-500"
        />
        <AlertSummaryCard
          title="Personalized Alerts"
          count={personalizedAlerts}
          marketAlerts={personalizedAlerts}
          icon={<Bell size={18} />}
          className="border-l-4 border-l-purple-500"
        />
      </div>

      {/* Alerts table */}
      <div className="bg-white rounded-md border border-theme-border-primary overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Alert Type</TableHead>
                <TableHead className="w-[200px]">Chain/Market</TableHead>
                <TableHead className="w-[180px]">Conditions</TableHead>
                <TableHead className="w-[150px]">Frequency</TableHead>
                <TableHead className="w-[200px]">Delivery Channel</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => {
                  // For simplicity pick first condition & channel
                  const cond = alert.conditions[0] as Condition | undefined;
                  const chan = alert.deliveryChannels[0] as Channel | undefined;

                  return (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-theme-primary">
                            {alert.actionType.charAt(0) +
                              alert.actionType.slice(1).toLowerCase()}
                          </span>
                          {alert.category === "PERSONALIZED" && (
                            <span className="text-xs text-purple-600">
                              Personalized
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex flex-wrap gap-1">
                            {alert.selectedChains.map((chain) => (
                              <Badge
                                key={chain}
                                variant="outline"
                                className="bg-theme-bg-muted"
                              >
                                {chain}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {alert.selectedMarkets.map((market) => (
                              <span
                                key={market}
                                className="text-xs text-theme-primary font-medium"
                              >
                                {market}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {cond ? (
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${getSeverityColor(cond.severity)}`}
                            >
                              {severityLabel(cond)}
                            </Badge>
                            <span className="text-xs text-theme-muted">
                              {cond.thresholdValue
                                ? `${cond.thresholdValue}%`
                                : cond.thresholdLow && cond.thresholdHigh
                                ? `${cond.thresholdLow}–${cond.thresholdHigh}%`
                                : "-"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-theme-muted">None</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="text-theme-primary">
                          {freqLabel(alert.notificationFrequency)}
                        </span>
                      </TableCell>

                      <TableCell>
                        {chan ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-theme-primary">
                              {chan.channelType}
                            </span>
                            <span className="text-xs text-theme-muted truncate max-w-[180px]">
                              {chan.channelType === "EMAIL"
                                ? chan.email
                                : chan.webhookUrl}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-theme-muted">
                            Not set
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            alert.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }
                        >
                          {alert.status.charAt(0) +
                            alert.status.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-theme-primary cursor-pointer"
                              onClick={() =>
                                router.push(`/alerts/edit/${alert.id}`)
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-theme-primary cursor-pointer"
                              onClick={() =>
                                router.push(`/alerts/history/${alert.id}`)
                              }
                            >
                              History
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Are you sure you want to delete this alert?"
                                  )
                                ) {
                                  // Delete logic here
                                  console.log("Deleting alert", alert.id);
                                }
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-theme-muted">
                      <Bell size={24} className="mb-2" />
                      <p>No alerts found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 border-theme-border-primary text-theme-primary"
                        onClick={() => router.push("/alerts/create")}
                      >
                        Create your first alert
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
