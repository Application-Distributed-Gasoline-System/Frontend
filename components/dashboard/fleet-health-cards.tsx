"use client";

import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FleetHealthCardsProps {
  anomalyRate: number; // percentage
  fleetAvailability: number; // percentage
  routeCompletionRate: number; // percentage
}

export function FleetHealthCards({
  anomalyRate,
  fleetAvailability,
  routeCompletionRate,
}: FleetHealthCardsProps) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Anomaly Rate</CardTitle>
          <AlertTriangle
            className={cn(
              "h-4 w-4",
              anomalyRate < 5
                ? "text-green-600"
                : anomalyRate < 10
                  ? "text-yellow-600"
                  : "text-red-600"
            )}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {anomalyRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {anomalyRate < 5 ? (
              <span className="flex items-center gap-1 text-green-600">
                <TrendingDown className="h-3 w-3" />
                Excellent
              </span>
            ) : anomalyRate < 10 ? (
              <span className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                Monitor closely
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600">
                <TrendingUp className="h-3 w-3" />
                Action required
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Fleet Availability
          </CardTitle>
          <CheckCircle
            className={cn(
              "h-4 w-4",
              fleetAvailability >= 80
                ? "text-green-600"
                : fleetAvailability >= 60
                  ? "text-yellow-600"
                  : "text-red-600"
            )}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {fleetAvailability.toFixed(0)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {fleetAvailability >= 80 ? (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                Strong capacity
              </span>
            ) : fleetAvailability >= 60 ? (
              <span className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                Moderate capacity
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-3 w-3" />
                Low capacity
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Completion Rate
          </CardTitle>
          <TrendingUp
            className={cn(
              "h-4 w-4",
              routeCompletionRate >= 90
                ? "text-green-600"
                : routeCompletionRate >= 75
                  ? "text-yellow-600"
                  : "text-red-600"
            )}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {routeCompletionRate.toFixed(0)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {routeCompletionRate >= 90 ? (
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                Excellent performance
              </span>
            ) : routeCompletionRate >= 75 ? (
              <span className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                Good performance
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600">
                <TrendingDown className="h-3 w-3" />
                Needs improvement
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
