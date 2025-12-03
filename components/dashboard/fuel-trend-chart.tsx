"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FuelReportItem } from "@/lib/types/fuel";

interface FuelTrendChartProps {
  data: FuelReportItem[];
  dateRange: { from: string; to: string };
}

type TimeRange = "7d" | "30d" | "90d";

export function FuelTrendChart({ data, dateRange }: FuelTrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  // Transform data for chart - group by date and machinery type
  const chartData = transformFuelData(data);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle>Fuel Consumption Trend</CardTitle>
        <div className="flex gap-2">
          <Button
            variant={timeRange === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("7d")}
          >
            7D
          </Button>
          <Button
            variant={timeRange === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("30d")}
          >
            30D
          </Button>
          <Button
            variant={timeRange === "90d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("90d")}
          >
            90D
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString();
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="light"
              name="Light Machinery"
              stackId="1"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="heavy"
              name="Heavy Machinery"
              stackId="1"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function transformFuelData(fuelReport: FuelReportItem[]) {
  // Group by date and machinery type
  const dailyData = new Map<string, { light: number; heavy: number }>();

  fuelReport.forEach((item) => {
    // Use current date as fallback if no date in data
    const date = new Date().toISOString().split("T")[0];
    const existing = dailyData.get(date) || { light: 0, heavy: 0 };

    // Sum fuel by machinery type
    if (item.vehicle.machineryType === "LIGHT") {
      existing.light += item.totalLiters;
    } else if (item.vehicle.machineryType === "HEAVY") {
      existing.heavy += item.totalLiters;
    }

    dailyData.set(date, existing);
  });

  // Convert to array and sort by date
  return Array.from(dailyData.entries())
    .map(([date, data]) => ({
      date,
      light: Number(data.light.toFixed(2)),
      heavy: Number(data.heavy.toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
