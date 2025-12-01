"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { IconCar, IconAlertTriangle } from "@tabler/icons-react";

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

import type { Vehicle } from "@/lib/types/vehicle";
import type { VehicleFuelHistory } from "@/lib/types/fuel";
import { getVehicles } from "@/lib/api/vehicles";
import { getVehicleFuelHistory, getDefaultDateRange } from "@/lib/api/fuel";

export function VehicleFuelHistory() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  );
  const [fuelHistory, setFuelHistory] = useState<VehicleFuelHistory | null>(
    null
  );
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Date range state
  const { from: defaultFrom, to: defaultTo } = getDefaultDateRange(30);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const response = await getVehicles(1, 100);
      setVehicles(response.vehicles);
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch vehicles";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchHistory = async () => {
    if (!selectedVehicleId) {
      toast.error("Please select a vehicle");
      return;
    }

    try {
      setLoadingHistory(true);
      const history = await getVehicleFuelHistory(
        selectedVehicleId,
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

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(parseInt(vehicleId));
    setFuelHistory(null);
  };

  const handleApplyFilters = () => {
    if (fromDate > toDate) {
      toast.error("From date must be before To date");
      return;
    }
    fetchHistory();
  };

  return (
    <div className="space-y-6">
      {/* Vehicle and Date Range Selectors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCar className="h-5 w-5" />
            Select Vehicle and Date Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vehicle Selector */}
          <div className="space-y-2">
            <Label htmlFor="vehicle-select">Vehicle</Label>
            <Select
              onValueChange={handleVehicleChange}
              value={selectedVehicleId?.toString() || ""}
              disabled={loadingVehicles}
            >
              <SelectTrigger id="vehicle-select">
                <SelectValue
                  placeholder={
                    loadingVehicles ? "Loading..." : "Select a vehicle"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                    {vehicle.plate} - {vehicle.brand} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                disabled={!selectedVehicleId || loadingHistory}
                className="w-full"
              >
                {loadingHistory ? "Loading..." : "Apply Filters"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {!selectedVehicleId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconCar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Select a vehicle to view its fuel history
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
                    in this period ({fuelHistory.records.length || "N/A"} total
                    records)
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
                  Fuel History for {fuelHistory.vehicle.plate}
                </CardTitle>
                {!fuelHistory.records ? null : (
                  <Badge variant="outline">
                    {fuelHistory.records.length} record
                    {fuelHistory.records.length === 1 ? "" : "s"}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {fuelHistory.vehicle.brand} {fuelHistory.vehicle.model}
              </p>
            </CardHeader>
            <CardContent>
              {fuelHistory.records ? (
                <FuelRecordsTable
                  records={fuelHistory.records}
                  isLoading={false}
                  showVehicleColumn={false}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">
                    No fuel records found for this vehicle in the selected date
                    range.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting the date range or select a different vehicle.
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
