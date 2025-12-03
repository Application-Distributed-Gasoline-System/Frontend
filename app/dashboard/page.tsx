"use client";

import { useState, useEffect } from "react";
import {
  IconGasStation,
  IconAlertTriangle,
  IconFileDescription,
  IconDroplet,
  IconTruckDelivery,
  IconUsers,
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
import { FuelTrendChart } from "@/components/dashboard/fuel-trend-chart";
import { RouteStatusChart } from "@/components/dashboard/route-status-chart";
import { AnomalyAlerts } from "@/components/dashboard/anomaly-alerts";
import { TopConsumers } from "@/components/dashboard/top-consumers";
import { ActiveRoutesWidget } from "@/components/dashboard/active-routes-widget";
import { FleetHealthCards } from "@/components/dashboard/fleet-health-cards";

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

  // Date range state
  const { from: defaultFrom, to: defaultTo } = getDefaultDateRange(30);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoadingStats(true);
      setIsLoadingFuel(true);

      // Fetch all data in parallel
      const [vehiclesData, driversData, routesData, fuelData] =
        await Promise.all([
          getVehicles(1, 100),
          getDrivers(1, 100),
          getRoutes(1, 1000),
          getFuelReport(fromDate, toDate),
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
  };

  const fetchFuelReport = async () => {
    try {
      setIsLoadingFuel(true);
      const report = await getFuelReport(fromDate, toDate);
      setFuelReport(report);
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch fuel report";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoadingFuel(false);
    }
  };

  const handleApplyDateRange = () => {
    if (fromDate > toDate) {
      toast.error("From date must be before To date");
      return;
    }
    fetchFuelReport();
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

  // Calculate fleet health metrics
  const anomalyRate = totalRecords > 0 ? (totalAnomalies / totalRecords) * 100 : 0;
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
        {isLoadingStats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <p className="text-xs text-muted-foreground">Total registered</p>
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
          </div>
        )}

        {/* Fleet Health Metrics */}
        {!isLoadingStats && !isLoadingFuel && (
          <div className="grid gap-4 md:grid-cols-3">
            <FleetHealthCards
              anomalyRate={anomalyRate}
              fleetAvailability={fleetAvailability}
              routeCompletionRate={routeCompletionRate}
            />
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
                Fuel consumption and performance metrics
              </p>
            </div>
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

        {/* Fuel Metrics Cards */}
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

        {/* Anomaly Alerts */}
        {!isLoadingFuel && totalAnomalies > 0 && (
          <AnomalyAlerts fuelData={fuelReport} />
        )}

        {/* Charts Row */}
        {isLoadingFuel ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <FuelTrendChart
              data={fuelReport}
              dateRange={{ from: fromDate, to: toDate }}
            />
            <RouteStatusChart routes={allRoutes} />
          </div>
        )}

        {/* Bottom Widgets Row */}
        {isLoadingFuel ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[500px] w-full" />
            <Skeleton className="h-[500px] w-full" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <TopConsumers fuelData={fuelReport} />
            <ActiveRoutesWidget routes={activeRoutes} />
          </div>
        )}
      </div>
    </div>
  );
}
