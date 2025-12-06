"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Label,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { FuelReportItem } from "@/lib/types/fuel";

interface EfficiencyScatterChartProps {
  data: FuelReportItem[];
}

interface ScatterDataPoint {
  plate: string;
  brand: string;
  model: string;
  distance: number;
  liters: number;
  isAnomaly: boolean;
  deltaPercent: number;
  estimatedFuelL?: number;
}

const CHART_COLORS = {
  text: "#9CA3AF",
  grid: "#374151",
  normal: "#22c55e",
  anomaly: "#ef4444",
};

export function EfficiencyScatterChart({ data }: EfficiencyScatterChartProps) {
  const plotData: ScatterDataPoint[] = data
    .flatMap(
      (item) =>
        item.anomalyRecords?.map((record) => ({
          plate: item.vehicle.plate,
          brand: item.vehicle.brand,
          model: item.vehicle.model,
          distance: record.distanceKm,
          liters: record.liters,
          isAnomaly: true,
          deltaPercent: record.deltaPercent,
        })) || []
    )
    .filter((point) => point.distance > 0 && point.liters > 0)
    .slice(0, 100);

  if (plotData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Efficiency Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No anomaly data available for analysis
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Efficiency Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distance vs Fuel Consumed
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
              opacity={0.5}
            />

            <XAxis
              type="number"
              dataKey="distance"
              name="Distance"
              unit=" km"
              className="text-xs"
              stroke={CHART_COLORS.text}
              tick={{ fill: CHART_COLORS.text }}
            >
              <Label
                value="Distance Traveled (km)"
                offset={-10}
                position="insideBottom"
                fill={CHART_COLORS.text}
                style={{ fontSize: "12px" }}
              />
            </XAxis>

            <YAxis
              type="number"
              dataKey="liters"
              name="Fuel"
              unit=" L"
              className="text-xs"
              stroke={CHART_COLORS.text}
              tick={{ fill: CHART_COLORS.text }}
            >
              <Label
                value="Fuel Consumed (L)"
                angle={-90}
                position="insideLeft"
                fill={CHART_COLORS.text}
                style={{ fontSize: "12px" }}
              />
            </YAxis>

            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: CHART_COLORS.text }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ScatterDataPoint;
                  return (
                    <div className="rounded-lg border bg-popover p-3 text-popover-foreground shadow-md">
                      <p className="font-semibold">{data.plate}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.brand} {data.model}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          Distance:{" "}
                          <span className="font-medium">
                            {data.distance.toFixed(1)} km
                          </span>
                        </p>
                        <p className="text-sm">
                          Estimatted Fuel:{" "}
                          <span className="font-medium">
                            {data.estimatedFuelL?.toFixed(1)} L
                          </span>
                        </p>
                        <p className="text-sm">
                          Fuel:{" "}
                          <span className="font-medium">
                            {data.liters.toFixed(1)} L
                          </span>
                        </p>
                        <p className="text-sm">
                          Deviation:{" "}
                          <span className="font-bold text-red-500">
                            +{data.deltaPercent.toFixed(1)}%
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Fuel Records" data={plotData}>
              {plotData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.isAnomaly ? CHART_COLORS.anomaly : CHART_COLORS.normal
                  }
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
