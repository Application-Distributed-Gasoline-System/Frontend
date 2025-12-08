"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { IconCar, IconTruck } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FuelReportItem } from "@/lib/types/fuel";
import { MachineryType } from "@/lib/types/vehicle";

interface TopConsumersProps {
  fuelData: FuelReportItem[];
}

export function TopConsumers({ fuelData }: TopConsumersProps) {
  // Get top 5 consumers sorted by total liters
  const topConsumers = fuelData
    .sort((a, b) => b.totalLiters - a.totalLiters)
    .slice(0, 5)
    .map((item) => ({
      plate: item.vehicle.plate,
      brand: item.vehicle.brand,
      model: item.vehicle.model,
      machineryType: item.vehicle.machineryType,
      hasAnomalies: item.anomaliesDetected > 0,
      anomalyCount: item.anomaliesDetected,
      totalLiters: Number(item.totalLiters.toFixed(1)),
      avgPerKm: Number(item.avgLitersPerKm.toFixed(2)),
      efficiency:
        item.avgLitersPerKm < 0.15
          ? "excellent"
          : item.avgLitersPerKm < 0.25
          ? "good"
          : item.avgLitersPerKm < 0.35
          ? "average"
          : "poor",
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Consuming Vehicles</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={topConsumers}
            layout="vertical"
            margin={{ top: 5, right: 20, bottom: 5, left: 60 }}
          >
            <XAxis type="number" className="text-xs" stroke="#888888" />

            <YAxis
              type="category"
              dataKey="plate"
              className="text-xs"
              width={60}
              stroke="#888888"
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value: number) => [`${value}L`, "Total Fuel"]}
              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
            />

            <Bar dataKey="totalLiters" fill="#6366F1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2">
          {topConsumers.map((vehicle, index) => (
            <div
              key={vehicle.plate}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-md border p-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {index + 1}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  {vehicle.machineryType === MachineryType.LIGHT ? (
                    <IconCar className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <IconTruck className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        ({vehicle.plate})
                      </span>
                      {vehicle.hasAnomalies && (
                        <Badge variant="destructive" className="h-5 text-xs">
                          ⚠ {vehicle.anomalyCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {vehicle.avgPerKm} L/km average
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:shrink-0 pl-9 sm:pl-0">
                <Badge
                  variant={
                    vehicle.efficiency === "excellent"
                      ? "default"
                      : vehicle.efficiency === "good"
                      ? "secondary"
                      : vehicle.efficiency === "average"
                      ? "outline"
                      : "destructive"
                  }
                >
                  {vehicle.efficiency}
                </Badge>
                <span className="text-sm font-semibold">
                  {vehicle.totalLiters}L
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
