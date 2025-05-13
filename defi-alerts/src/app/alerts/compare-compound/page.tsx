"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type Alert,
  type Condition,
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
  ArrowLeftRight,
} from "lucide-react";

// Alert summary component
const AlertSummaryCard = ({
  title,
  count,
  comparisonAlerts,
  icon,
  className,
}: {
  title: string;
  count: number;
  comparisonAlerts: number;
  icon: React.ReactNode;
  className?: string;
}) => (
  <Card
    className={`border-theme-border-primary bg-theme-bg-secondary ${className}`}
  >
    <CardContent className="p-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-theme-primary flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <span className="text-2xl font-bold text-theme-primary">{count}</span>
      </div>
      <div className="text-sm text-theme-muted">
        {comparisonAlerts} comparison alerts
      </div>
    </CardContent>
  </Card>
);

export default function CompareCompoundPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const [chainFilter, setChainFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`/api/alerts?userId=${userId}`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Error fetching alerts: ${r.status}`);
        }
        return r.json();
      })
      .then((data) => {
        // Filter to only show comparison alerts
        const comparisonAlerts = data.filter(
          (alert: Alert) => alert.isComparison
        );

        // Ensure every alert has the required properties
        const processedAlerts = comparisonAlerts.map((alert: Alert) => ({
          ...alert,
          selectedChains: alert.selectedChains || [],
          selectedAssets: alert.selectedAssets || [],
          compareProtocols: alert.compareProtocols || [],
          conditions: alert.conditions || [],
          deliveryChannels: alert.deliveryChannels || [],
        }));

        setAlerts(processedAlerts);
        setFilteredAlerts(processedAlerts);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching alerts:", err);
        setError("Failed to load comparison alerts. Please try again later.");
      })
      .finally(() => {
        setIsLoading(false);
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
        (alert.selectedChains || []).some(
          (chain) => chain.name.toLowerCase() === chainFilter.toLowerCase()
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
    new Set(
      alerts
        .flatMap((alert) =>
          (alert.selectedChains || []).map((chain) => chain.name)
        )
        .filter(Boolean)
    )
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
        return "bg-theme-bg-muted text-theme-muted border-theme-border-primary";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-theme-primary">
            Comparison Alerts
          </h1>
          <p className="text-theme-muted">
            Monitor when Compound outperforms other DeFi platforms.
          </p>
        </div>
        <Button
          onClick={() => router.push("/alerts/create/compare-compound")}
          className="mt-4 md:mt-0 bg-primary-color text-primary-text hover-border-body"
        >
          <Plus size={16} className="mr-2" /> Create Comparison Alert
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Tabs
          defaultValue="all"
          value={activeTab}
          className="w-full md:w-auto"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 w-full md:w-[400px] bg-theme-bg-secondary">
            <TabsTrigger
              value="all"
              className={
                activeTab === "all"
                  ? "bg-primary-color text-primary-text data-[state=active]:bg-primary-color data-[state=active]:text-primary-text"
                  : ""
              }
            >
              All Comparisons
            </TabsTrigger>
            <TabsTrigger
              value="general"
              className={
                activeTab === "general"
                  ? "bg-primary-color text-primary-text data-[state=active]:bg-primary-color data-[state=active]:text-primary-text"
                  : ""
              }
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="personalized"
              className={
                activeTab === "personalized"
                  ? "bg-primary-color text-primary-text data-[state=active]:bg-primary-color data-[state=active]:text-primary-text"
                  : ""
              }
            >
              Personalized
            </TabsTrigger>
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
                  ? "bg-primary-color text-primary-text"
                  : "border-theme-border-primary text-theme-primary hover-border-primary"
              }
            >
              <TrendingDown size={16} className="mr-2" /> Borrow Rates
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
                  ? "bg-primary-color text-primary-text"
                  : "border-theme-border-primary text-theme-primary hover-border-primary"
              }
            >
              <TrendingUp size={16} className="mr-2" /> Supply Rates
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
          title="Total Comparisons"
          count={totalAlerts}
          comparisonAlerts={totalAlerts}
          icon={<ArrowLeftRight size={18} />}
          className="border-l-4 border-l-primary-color"
        />
        <AlertSummaryCard
          title="Supply Comparisons"
          count={supplyAlerts}
          comparisonAlerts={supplyAlerts}
          icon={<TrendingUp size={18} />}
          className="border-l-4 border-l-primary-color"
        />
        <AlertSummaryCard
          title="Borrow Comparisons"
          count={borrowAlerts}
          comparisonAlerts={borrowAlerts}
          icon={<TrendingDown size={18} />}
          className="border-l-4 border-l-primary-color"
        />
        <AlertSummaryCard
          title="Personalized"
          count={personalizedAlerts}
          comparisonAlerts={personalizedAlerts}
          icon={<Bell size={18} />}
          className="border-l-4 border-l-primary-color"
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="text-theme-muted">Loading comparison alerts...</div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex justify-center items-center h-40">
          <div className="text-red-500">{error}</div>
        </div>
      )}

      {/* Alerts table */}
      {!isLoading && !error && (
        <div className="bg-theme-bg-secondary rounded-md border border-theme-border-primary overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Alert Type</TableHead>
                  <TableHead className="w-[180px]">Chain/Market</TableHead>
                  <TableHead className="w-[180px]">Compare With</TableHead>
                  <TableHead className="w-[150px]">Conditions</TableHead>
                  <TableHead className="w-[150px]">Frequency</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => {
                    // For simplicity pick first condition & channel
                    const cond = alert.conditions[0] as Condition | undefined;

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
                              {(alert.selectedChains || []).map((chain) => (
                                <Badge
                                  key={chain.chainId}
                                  variant="outline"
                                  className="bg-theme-bg-muted"
                                >
                                  {chain.name}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(alert.selectedAssets || []).map((asset) => (
                                <span
                                  key={asset.chainId_address}
                                  className="text-xs text-theme-primary font-medium"
                                >
                                  {asset.symbol}
                                </span>
                              ))}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(alert.compareProtocols || []).map(
                              (protocol, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-theme-bg-muted text-theme-primary"
                                >
                                  {protocol}
                                </Badge>
                              )
                            )}
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
                            <span className="text-xs text-theme-muted">
                              None
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <span className="text-theme-primary">
                            {freqLabel(alert.notificationFrequency)}
                          </span>
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
                        <ArrowLeftRight size={24} className="mb-2" />
                        <p>No comparison alerts found</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 border-theme-border-primary text-theme-primary hover-border-primary"
                          onClick={() =>
                            router.push("/alerts/create/compare-compound")
                          }
                        >
                          Create your first comparison alert
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
