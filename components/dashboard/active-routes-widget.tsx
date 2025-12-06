"use client";

import Link from "next/link";
import { Truck, MapPin, User, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Route } from "@/lib/types/route";

interface ActiveRoutesWidgetProps {
  routes: Route[];
}

export function ActiveRoutesWidget({ routes }: ActiveRoutesWidgetProps) {
  // Show first 5 active routes
  const displayRoutes = routes.slice(0, 5);

  if (routes.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Active Routes</CardTitle>
          <Badge variant="secondary">0</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Truck className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              No active routes at the moment
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Active Routes</CardTitle>
        <Badge>{routes.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayRoutes.map((route) => (
          <div
            key={route.id}
            className="flex items-start justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium flex-1">{route.code}</span>
                <div className="ml-2">
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                  >
                    {Number(route.distanceKm).toFixed(2)} km
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{route.driver.name}</span>
                <span>•</span>
                <span>{route.vehicle.plate}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">
                  {route.origin} → {route.destination}
                </span>
              </div>
            </div>
          </div>
        ))}

        {routes.length > 5 && (
          <p className="text-center text-xs text-muted-foreground">
            +{routes.length - 5} more route{routes.length - 5 === 1 ? "" : "s"}
          </p>
        )}

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/dashboard/routes" className="flex items-center gap-2">
            View All Routes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
