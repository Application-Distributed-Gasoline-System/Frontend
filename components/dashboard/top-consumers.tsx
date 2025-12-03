"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FuelReportItem } from "@/lib/types/fuel";

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
            layout="horizontal"
            margin={{ top: 5, right: 20, bottom: 5, left: 60 }}
          >
            <XAxis type="number" className="text-xs" />
            <YAxis
              type="category"
              dataKey="plate"
              className="text-xs"
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              formatter={(value: number) => [`${value}L`, "Total Fuel"]}
            />
            <Bar
              dataKey="totalLiters"
              fill="hsl(var(--chart-1))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2">
          {topConsumers.map((vehicle, index) => (
            <div
              key={vehicle.plate}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{vehicle.plate}</p>
                  <p className="text-xs text-muted-foreground">
                    {vehicle.avgPerKm} L/km average
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
