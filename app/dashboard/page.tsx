"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IconGasStation,
  IconAlertTriangle,
  IconFileDescription,
  IconDroplet,
  IconTruckDelivery,
  IconUsers,
  IconDownload,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getFuelReport, getDefaultDateRange } from "@/lib/api/fuel";
import type { FuelReportItem } from "@/lib/types/fuel";
import { getVehicles } from "@/lib/api/vehicles";
import { getDrivers } from "@/lib/api/drivers";
import { getRoutes } from "@/lib/api/routes";
import { RouteStatus } from "@/lib/types/route";
import type { Route } from "@/lib/types/route";

// Dashboard components
import { AnomalyAlerts } from "@/components/dashboard/anomaly-alerts";
import { TopConsumers } from "@/components/dashboard/top-consumers";
import { ActiveRoutesWidget } from "@/components/dashboard/active-routes-widget";
import { FleetHealthCards } from "@/components/dashboard/fleet-health-cards";
import { EfficiencyScatterChart } from "@/components/dashboard/efficiency-scatter-chart";

export default function DashboardPage() {
  const [fuelReport, setFuelReport] = useState<FuelReportItem[]>([]);
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [activeRoutes, setActiveRoutes] = useState<Route[]>([]);
  const [isLoadingFuel, setIsLoadingFuel] = useState(true);

  // Dashboard stats state
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [availableVehicles, setAvailableVehicles] = useState<number>(0);
  const [activeDrivers, setActiveDrivers] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Date range state - separate "input" and "applied" states
  const { from: defaultFrom, to: defaultTo } = getDefaultDateRange(30);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  // Applied date range - only updates when Apply button is clicked
  const [appliedFromDate, setAppliedFromDate] = useState(defaultFrom);
  const [appliedToDate, setAppliedToDate] = useState(defaultTo);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setIsLoadingFuel(true);

      // Fetch all data in parallel
      const [vehiclesData, driversData, routesData, fuelData] =
        await Promise.all([
          getVehicles(1, 50),
          getDrivers(1, 50),
          getRoutes(1, 100),
          getFuelReport(appliedFromDate, appliedToDate),
        ]);

      // Set vehicle stats
      setTotalVehicles(vehiclesData.total);
      setAvailableVehicles(
        vehiclesData.vehicles.filter((v) => v.available).length
      );

      // Set driver stats
      setActiveDrivers(driversData.total);

      // Set route stats
      setAllRoutes(routesData.routes);
      const inProgressRoutes = routesData.routes.filter(
        (r) => r.status === RouteStatus.IN_PROGRESS
      );
      setActiveRoutes(inProgressRoutes);

      // Set fuel data
      setFuelReport(fuelData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoadingStats(false);
      setIsLoadingFuel(false);
    }
  }, [appliedFromDate, appliedToDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleApplyDateRange = () => {
    if (fromDate > toDate) {
      toast.error("From date must be before To date");
      return;
    }
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
  };

  const handleExportDashboard = async () => {
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { DashboardPDF } = await import("@/lib/pdf/dashboard-pdf");

      const blob = await pdf(
        <DashboardPDF
          fuelReport={fuelReport}
          dateRange={{ from: fromDate, to: toDate }}
          metrics={{
            totalFuelConsumed,
            avgConsumption,
            totalAnomalies,
            potentialFuelLoss,
            anomalyRate,
            fleetAvailability,
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fuel-analytics-${fromDate}-to-${toDate}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  // Calculate fuel statistics
  const totalFuelConsumed = fuelReport.reduce(
    (sum, item) => sum + item.totalLiters,
    0
  );
  const avgConsumption =
    fuelReport.length > 0
      ? fuelReport.reduce((sum, item) => sum + item.avgLitersPerKm, 0) /
        fuelReport.length
      : 0;
  const totalAnomalies = fuelReport.reduce(
    (sum, item) => sum + item.anomaliesDetected,
    0
  );
  const totalRecords = fuelReport.reduce(
    (sum, item) => sum + item.recordsCount,
    0
  );

  // Calculate potential fuel loss from anomalies
  const potentialFuelLoss = fuelReport.reduce((total, item) => {
    if (!item.anomalyRecords) return total;
    const itemLoss = item.anomalyRecords.reduce((acc, record) => {
      const loss = record.liters - record.estimatedFuelL;
      return acc + (loss > 0 ? loss : 0); // Only count excess consumption
    }, 0);
    return total + itemLoss;
  }, 0);

  // Calculate fleet health metrics
  const anomalyRate =
    totalRecords > 0 ? (totalAnomalies / totalRecords) * 100 : 0;
  const fleetAvailability =
    totalVehicles > 0 ? (availableVehicles / totalVehicles) * 100 : 0;
  const completedRoutes = allRoutes.filter(
    (r) => r.status === RouteStatus.COMPLETED
  ).length;
  const routeCompletionRate =
    allRoutes.length > 0 ? (completedRoutes / allRoutes.length) * 100 : 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to the Gas System management dashboard
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Quick Stats - First Row */}
        {isLoadingStats || isLoadingFuel ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Vehicles
                </CardTitle>
                <IconTruckDelivery className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVehicles}</div>
                <p className="text-xs text-muted-foreground">
                  {availableVehicles} available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Drivers
                </CardTitle>
                <IconUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeDrivers}</div>
                <p className="text-xs text-muted-foreground">
                  Total registered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Routes
                </CardTitle>
                <IconTruckDelivery className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeRoutes.length}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card
              className={
                potentialFuelLoss > 0
                  ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                  : ""
              }
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle
                  className={`text-sm font-medium ${
                    potentialFuelLoss > 0
                      ? "text-red-600 dark:text-red-400"
                      : ""
                  }`}
                >
                  Potential Fuel Loss
                </CardTitle>
                <IconAlertTriangle
                  className={`h-4 w-4 ${
                    potentialFuelLoss > 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    potentialFuelLoss > 0
                      ? "text-red-700 dark:text-red-300"
                      : ""
                  }`}
                >
                  {potentialFuelLoss.toFixed(1)} L
                </div>
                <p
                  className={`text-xs ${
                    potentialFuelLoss > 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {potentialFuelLoss > 0
                    ? "Excess consumption detected"
                    : "No excess detected"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Separator />

        {/* Date Range Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Fuel Analytics
              </h2>
              <p className="text-sm text-muted-foreground">
                Filter fuel consumption data by date range
              </p>
            </div>
            {!isLoadingFuel && fuelReport.length > 0 && (
              <Button
                onClick={handleExportDashboard}
                variant="outline"
                disabled={isLoadingFuel}
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Export to PDF
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-from-date">From Date</Label>
              <Input
                id="dashboard-from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dashboard-to-date">To Date</Label>
              <Input
                id="dashboard-to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleApplyDateRange}
                disabled={isLoadingFuel}
                className="w-full"
              >
                {isLoadingFuel ? "Loading..." : "Apply"}
              </Button>
            </div>
          </div>
        </div>

        {/* ROW 2: OPERATIONS VIEW - What's happening now? */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Operations View
            </h2>
            <p className="text-sm text-muted-foreground">
              Current fleet status and active operations
            </p>
          </div>

          {isLoadingStats || isLoadingFuel ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <ActiveRoutesWidget routes={activeRoutes} />
              <div className="grid gap-4">
                <FleetHealthCards
                  anomalyRate={anomalyRate}
                  fleetAvailability={fleetAvailability}
                  routeCompletionRate={routeCompletionRate}
                />
              </div>
            </div>
          )}
        </div>

        {/* ROW 3: ANALYSIS VIEW - How are we performing? */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Performance Analysis
            </h2>
            <p className="text-sm text-muted-foreground">
              Fuel consumption metrics and top consumers
            </p>
          </div>

          {isLoadingFuel ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Fuel Consumed
                  </CardTitle>
                  <IconDroplet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalFuelConsumed.toFixed(2)}L
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In selected period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg Consumption
                  </CardTitle>
                  <IconGasStation className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {avgConsumption.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Liters per km</p>
                </CardContent>
              </Card>

              <Card
                className={
                  totalAnomalies > 0
                    ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950"
                    : ""
                }
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle
                    className={`text-sm font-medium ${
                      totalAnomalies > 0
                        ? "text-yellow-600 dark:text-yellow-400"
                        : ""
                    }`}
                  >
                    Anomalies Detected
                  </CardTitle>
                  <IconAlertTriangle
                    className={`h-4 w-4 ${
                      totalAnomalies > 0
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      totalAnomalies > 0
                        ? "text-yellow-700 dark:text-yellow-300"
                        : ""
                    }`}
                  >
                    {totalAnomalies}
                  </div>
                  <p
                    className={`text-xs ${
                      totalAnomalies > 0
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {totalAnomalies > 0
                      ? "Requires attention"
                      : "No anomalies found"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Records
                  </CardTitle>
                  <IconFileDescription className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRecords}</div>
                  <p className="text-xs text-muted-foreground">
                    Fuel records logged
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {isLoadingFuel ? (
            <Skeleton className="h-[500px] w-full" />
          ) : (
            <TopConsumers fuelData={fuelReport} />
          )}
        </div>

        {/* ROW 4: ACTION ITEMS - What needs fixing? */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Action Items
            </h2>
            <p className="text-sm text-muted-foreground">
              Anomalies requiring attention and efficiency patterns
            </p>
          </div>

          {isLoadingFuel ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <AnomalyAlerts fuelData={fuelReport} />
              <EfficiencyScatterChart data={fuelReport} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
