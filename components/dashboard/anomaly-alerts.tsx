"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FuelReportItem } from "@/lib/types/fuel";

interface AnomalyAlertsProps {
  fuelData: FuelReportItem[];
}

export function AnomalyAlerts({ fuelData }: AnomalyAlertsProps) {
  const anomalies = fuelData
    .filter((item) => item.anomaliesDetected > 0)
    .sort((a, b) => b.anomaliesDetected - a.anomaliesDetected)
    .slice(0, 3); // Reducido a mostrar solo los 3 principales para ahorrar espacio

  if (anomalies.length === 0) {
    // Puedes retornar una tarjeta vacía sutil o null si prefieres que desaparezca
    return null;
  }

  const totalAnomalies = anomalies.reduce(
    (sum, item) => sum + item.anomaliesDetected,
    0
  );

  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {/* Icono y título más sutiles */}
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg font-semibold">
            Anomaly Alerts
          </CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
          <Link href="/dashboard/fuel">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4 flex items-center text-sm">
          <span className="font-medium text-amber-600 dark:text-amber-400 mr-1">
            {totalAnomalies} issues found
          </span>
          <span>
            across {anomalies.length} vehicle{anomalies.length === 1 ? "" : "s"}
            .
          </span>
        </CardDescription>

        <div className="space-y-2">
          {anomalies.map((item) => {
            const maxDelta =
              item.anomalyRecords && item.anomalyRecords.length > 0
                ? Math.max(...item.anomalyRecords.map((r) => r.deltaPercent))
                : 0;

            const severityColor =
              maxDelta > 20
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";

            return (
              <div
                key={item.vehicle.id}
                className="flex items-center justify-between rounded-lg border p-2 text-sm hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{item.vehicle.plate}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.anomaliesDetected} incident
                    {item.anomaliesDetected > 1 ? "s" : ""}
                  </span>
                </div>

                <Badge
                  variant="outline"
                  className={`${severityColor} font-mono`}
                >
                  {maxDelta > 0 ? `+${maxDelta.toFixed(1)}%` : "N/A"}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
