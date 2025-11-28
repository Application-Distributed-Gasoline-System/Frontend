"use client";

import { useState, useEffect } from "react";
import { IconGasStation, IconAlertTriangle, IconFileDescription, IconDroplet } from "@tabler/icons-react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { getFuelReport, getDefaultDateRange } from "@/lib/api/fuel";
import type { FuelReportItem } from "@/lib/types/fuel";
import { getVehicles } from "@/lib/api/vehicles";
import { getDrivers } from "@/lib/api/drivers";
import { getRoutes } from "@/lib/api/routes";
import { RouteStatus } from "@/lib/types/route";

export default function DashboardPage() {
  const [fuelReport, setFuelReport] = useState<FuelReportItem[]>([]);
  const [isLoadingFuel, setIsLoadingFuel] = useState(true);

  // Dashboard stats state
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [activeDrivers, setActiveDrivers] = useState<number>(0);
  const [activeRoutes, setActiveRoutes] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Date range state
  const { from: defaultFrom, to: defaultTo } = getDefaultDateRange(30);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);

  // Fetch dashboard stats and fuel report on mount
  useEffect(() => {
    fetchDashboardStats();
    fetchFuelReport();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoadingStats(true);

      // Fetch all data in parallel
      const [vehiclesData, driversData, routesData] = await Promise.all([
        getVehicles(1, 1), // Only need total count, so fetch 1 item
        getDrivers(1, 1),
        getRoutes(1, 100), // Need to filter by status, so fetch more
      ]);

      setTotalVehicles(vehiclesData.total);

      // Count only available drivers
      const availableDriversCount = driversData.total;
      setActiveDrivers(availableDriversCount);

      // Count only routes with IN_PROGRESS status
      const activeRoutesCount = routesData.routes.filter(
        (r) => r.status === RouteStatus.IN_PROGRESS
      ).length;
      setActiveRoutes(activeRoutesCount);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setIsLoadingStats(false);
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to the Gas System management dashboard
        </p>
      </div>
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Dashboard Stats Cards */}
        {isLoadingStats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Vehicles
              </h3>
              <p className="mt-2 text-3xl font-bold">{totalVehicles}</p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                Active Drivers
              </h3>
              <p className="mt-2 text-3xl font-bold">{activeDrivers}</p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                Active Routes
              </h3>
              <p className="mt-2 text-3xl font-bold">{activeRoutes}</p>
            </div>
          </div>
        )}

        <Separator />

        {/* Fuel Statistics Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Fuel Statistics
              </h2>
              <p className="text-sm text-muted-foreground">
                Fuel consumption and anomaly data for the selected period
              </p>
            </div>
          </div>

          {/* Date Range Selector */}
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

          {/* Fuel Metrics */}
          {isLoadingFuel ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-6">
                <div className="flex items-center gap-2">
                  <IconDroplet className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Fuel Consumed
                  </h3>
                </div>
                <p className="mt-2 text-3xl font-bold">
                  {totalFuelConsumed.toFixed(2)}
                  <span className="ml-1 text-lg font-normal text-muted-foreground">
                    L
                  </span>
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <div className="flex items-center gap-2">
                  <IconGasStation className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Avg Consumption
                  </h3>
                </div>
                <p className="mt-2 text-3xl font-bold">
                  {avgConsumption.toFixed(2)}
                  <span className="ml-1 text-lg font-normal text-muted-foreground">
                    L/km
                  </span>
                </p>
              </div>
              <div
                className={`rounded-lg border p-6 ${
                  totalAnomalies > 0
                    ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconAlertTriangle
                    className={`h-4 w-4 ${
                      totalAnomalies > 0
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                  <h3
                    className={`text-sm font-medium ${
                      totalAnomalies > 0
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    Anomalies Detected
                  </h3>
                </div>
                <p
                  className={`mt-2 text-3xl font-bold ${
                    totalAnomalies > 0
                      ? "text-yellow-700 dark:text-yellow-300"
                      : ""
                  }`}
                >
                  {totalAnomalies}
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <div className="flex items-center gap-2">
                  <IconFileDescription className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Records
                  </h3>
                </div>
                <p className="mt-2 text-3xl font-bold">{totalRecords}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
