"use client";

import Link from "next/link";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FuelReportItem } from "@/lib/types/fuel";

interface AnomalyAlertsProps {
  fuelData: FuelReportItem[];
}

export function AnomalyAlerts({ fuelData }: AnomalyAlertsProps) {
  // Filter vehicles with anomalies and sort by severity
  const anomalies = fuelData
    .filter((item) => item.anomaliesDetected > 0)
    .sort((a, b) => b.anomaliesDetected - a.anomaliesDetected)
    .slice(0, 5); // Show top 5

  if (anomalies.length === 0) {
    return null; // Don't show if no anomalies
  }

  const totalAnomalies = anomalies.reduce(
    (sum, item) => sum + item.anomaliesDetected,
    0
  );

  return (
    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle className="text-yellow-900 dark:text-yellow-100">
        Fuel Anomalies Detected
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          {totalAnomalies} anomal{totalAnomalies === 1 ? "y" : "ies"} detected
          across {anomalies.length} vehicle{anomalies.length === 1 ? "" : "s"}.
          Please investigate potential fuel theft or leaks.
        </p>

        <div className="space-y-2">
          {anomalies.map((item) => {
            // Get the highest delta % from anomaly records
            const maxDelta =
              item.anomalyRecords && item.anomalyRecords.length > 0
                ? Math.max(...item.anomalyRecords.map((r) => r.deltaPercent))
                : 0;

            const severity =
              maxDelta > 20 ? "critical" : maxDelta > 10 ? "warning" : "info";
            const severityColor =
              severity === "critical"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                : severity === "warning"
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";

            return (
              <div
                key={item.vehicle.id}
                className="flex items-center justify-between rounded-md border border-yellow-200 bg-white p-3 dark:border-yellow-800 dark:bg-yellow-950/50"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      {item.vehicle.plate}
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      {item.anomaliesDetected} anomal
                      {item.anomaliesDetected === 1 ? "y" : "ies"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={severityColor}>
                    {maxDelta > 0 ? `+${maxDelta.toFixed(1)}%` : "N/A"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/fuel">View Fuel Management</Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
