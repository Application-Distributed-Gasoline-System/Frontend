"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Route, RouteStatus } from "@/lib/types/route";

interface RouteStatusChartProps {
  routes: Route[];
}

const STATUS_COLORS = {
  PLANNED: "hsl(var(--chart-1))",     // Blue
  IN_PROGRESS: "hsl(var(--chart-4))", // Yellow
  COMPLETED: "hsl(var(--chart-2))",   // Green
  CANCELLED: "hsl(var(--destructive))", // Red
};

const STATUS_LABELS = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function RouteStatusChart({ routes }: RouteStatusChartProps) {
  // Count routes by status
  const statusCounts = routes.reduce(
    (acc, route) => {
      acc[route.status] = (acc[route.status] || 0) + 1;
      return acc;
    },
    {} as Record<RouteStatus, number>
  );

  // Transform to chart data
  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[status as RouteStatus],
    value: count,
    status: status as RouteStatus,
  }));

  const totalRoutes = routes.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold">{totalRoutes}</p>
            <p className="text-sm text-muted-foreground">Total Routes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
