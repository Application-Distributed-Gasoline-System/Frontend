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
  PLANNED: "#3b82f6", // Azul (Blue-500)
  IN_PROGRESS: "#eab308", // Amarillo (Yellow-500)
  COMPLETED: "#22c55e", // Verde (Green-500)
  CANCELLED: "#ef4444", // Rojo (Red-500)
};

const STATUS_LABELS = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function RouteStatusChart({ routes }: RouteStatusChartProps) {
  const statusCounts = routes.reduce((acc, route) => {
    acc[route.status] = (acc[route.status] || 0) + 1;
    return acc;
  }, {} as Record<RouteStatus, number>);

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
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.status}
                    // Aquí usamos los colores HEX seguros
                    fill={STATUS_COLORS[entry.status]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  color: "hsl(var(--popover-foreground))",
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              {/* CORRECCIÓN: wrapperStyle en Legend para cambiar el color del texto */}
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  color: "#888888",
                  fontSize: "12px",
                  paddingTop: "10px",
                }}
              />
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
