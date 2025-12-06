"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { IconUser, IconAlertTriangle, IconDownload } from "@tabler/icons-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { FuelRecordsTable } from "./fuel-records-table";

import type { Driver } from "@/lib/types/driver";
import type { DriverFuelHistory } from "@/lib/types/fuel";
import { getDrivers } from "@/lib/api/drivers";
import { getDriverFuelHistory, getDefaultDateRange } from "@/lib/api/fuel";

interface DriverFuelHistoryProps {
  autoFilterUserId?: string; // If provided, hide driver selector and auto-filter
}

export function DriverFuelHistory({ autoFilterUserId }: DriverFuelHistoryProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(
    autoFilterUserId || null
  );
  const [fuelHistory, setFuelHistory] = useState<DriverFuelHistory | null>(
    null
  );
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Date range state
  const { from: defaultFrom, to: defaultTo } = getDefaultDateRange(30);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);

  // Auto-fetch if autoFilterUserId provided, otherwise fetch drivers list
  useEffect(() => {
    if (autoFilterUserId) {
      setLoadingDrivers(false);
      fetchHistory();
    } else {
      fetchDrivers();
    }
  }, [autoFilterUserId]);

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const response = await getDrivers(1, 100);
      setDrivers(response.drivers);
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch drivers";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchHistory = async () => {
    if (!selectedDriverId) {
      toast.error("Please select a driver");
      return;
    }

    try {
      setLoadingHistory(true);
      const history = await getDriverFuelHistory(
        selectedDriverId,
        fromDate,
        toDate
      );
      setFuelHistory(history);
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch fuel history";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDriverChange = (driverId: string) => {
    setSelectedDriverId(driverId);
    setFuelHistory(null);
  };

  const handleApplyFilters = () => {
    if (fromDate > toDate) {
      toast.error("From date must be before To date");
      return;
    }
    fetchHistory();
  };

  const handleExportDriver = async () => {
    if (!fuelHistory) return;

    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { DriverFuelPDF } = await import("@/lib/pdf/driver-fuel-pdf");

      // Get driver name for the PDF
      const driverName = selectedDriver?.name || selectedDriverId || "Driver";

      const blob = await pdf(
        <DriverFuelPDF
          fuelHistory={fuelHistory}
          dateRange={{ from: fromDate, to: toDate }}
          driverName={driverName}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `driver-${driverName.replace(/\s+/g, "-")}-fuel-report.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  // Get selected driver info for display
  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);

  return (
    <div className="space-y-6">
      {/* Driver and Date Range Selectors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            {autoFilterUserId
              ? "Your Fuel Records"
              : "Select Driver and Date Range"}
          </CardTitle>
          {((selectedDriverId && fuelHistory) ||
            (autoFilterUserId && fuelHistory?.records.length > 0)) && (
            <Button
              onClick={handleExportDriver}
              variant="outline"
              size="sm"
            >
              <IconDownload className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Driver Selector - Only show if NOT auto-filtered */}
          {!autoFilterUserId && (
            <div className="space-y-2">
              <Label htmlFor="driver-select">Driver</Label>
              <Select
                onValueChange={handleDriverChange}
                value={selectedDriverId || ""}
                disabled={loadingDrivers}
              >
                <SelectTrigger id="driver-select">
                  <SelectValue
                    placeholder={
                      loadingDrivers ? "Loading..." : "Select a driver"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range Filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleApplyFilters}
                disabled={!selectedDriverId || loadingHistory}
                className="w-full"
              >
                {loadingHistory ? "Loading..." : "Apply Filters"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {!autoFilterUserId && !selectedDriverId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconUser className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Select a driver to view their fuel history
            </p>
          </CardContent>
        </Card>
      ) : loadingHistory ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : fuelHistory ? (
        <>
          {/* Anomaly Summary Card */}
          {fuelHistory.anomaliesDetected > 0 && (
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <IconAlertTriangle className="h-5 w-5" />
                  Anomalies Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {fuelHistory.anomaliesDetected} anomal
                    {fuelHistory.anomaliesDetected === 1 ? "y" : "ies"} detected
                    in this period ({fuelHistory.records.length} total records)
                  </p>
                  {fuelHistory.anomalyRecords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Anomaly Details:
                      </p>
                      <ul className="space-y-1">
                        {fuelHistory.anomalyRecords.map((anomaly, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2"
                          >
                            <Badge
                              variant={
                                Math.abs(anomaly.deltaPercent) >= 20
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {anomaly.deltaPercent > 0 ? "+" : ""}
                              {anomaly.deltaPercent.toFixed(1)}%
                            </Badge>
                            <span>{anomaly.liters.toFixed(2)} L consumed</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fuel Records Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {autoFilterUserId
                    ? "Your Fuel History"
                    : `Fuel History for ${selectedDriver?.name || fuelHistory.driverId}`}
                </CardTitle>
                <Badge variant="outline">
                  {fuelHistory.records.length} record
                  {fuelHistory.records.length === 1 ? "" : "s"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {fuelHistory.records.length > 0 ? (
                <FuelRecordsTable
                  records={fuelHistory.records}
                  isLoading={false}
                  showVehicleColumn={true} // Show vehicle column for driver view
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">
                    No fuel records found for this driver in the selected date
                    range.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting the date range or select a different driver.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
