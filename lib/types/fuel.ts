import { z } from "zod";
import { MachineryType } from "./vehicle";

// Fuel source enum
export enum FuelSource {
  MANUAL = "manual",
  SENSOR = "sensor",
  ROUTE_COMPLETION = "route-completion",
}

// Fuel record from API
export interface FuelRecord {
  id: string;
  externalId?: string;
  driverId: string;
  vehicleId: number;
  routeId?: number;
  liters: number;
  odometer?: number;
  gpsLocation?: string;
  source: FuelSource;
  estimatedFuelL?: number;
  deltaPercent?: number;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
  // Enriched data from backend
  driver?: {
    id: string;
    name: string;
  };
  vehicle?: {
    id: number;
    plate: string;
    brand: string;
    model: string;
  };
  routeCode?: string;
  distanceKm?: number;
  machineryType?: MachineryType;
  fuelType?: string;
}

// Vehicle fuel history response
export interface VehicleFuelHistory {
  vehicle: {
    id: number;
    plate: string;
    brand: string;
    model: string;
  };
  records: FuelRecord[];
  anomaliesDetected: number;
  anomalyRecords: Array<{
    recordId: string;
    deltaPercent: number;
    liters: number;
  }>;
}

// Driver fuel history response
export interface DriverFuelHistory {
  driverId: string;
  records: FuelRecord[];
  anomaliesDetected: number;
  anomalyRecords: Array<{
    recordId: string;
    deltaPercent: number;
    liters: number;
  }>;
}

// Fuel report item
export interface FuelReportItem {
  vehicle: {
    id: number;
    plate: string;
    machineryType: MachineryType;
    brand: string;
    model: string;
  };
  totalLiters: number;
  avgLitersPerKm: number;
  recordsCount: number;
  anomaliesDetected: number;
  anomalyRecords?: Array<{
    recordId: string;
    deltaPercent: number;
    liters: number;
    estimatedFuelL: number,
    distanceKm: number,
    recordedAt: string,
  }>;
}

// Zod validation schema for fuel form (simplified - only basic fields)
export const fuelFormSchema = z.object({
  driverId: z.string().min(1, "Driver is required"),
  vehicleId: z.number().min(1, "Vehicle is required"),
  liters: z.number().min(0.1, "Liters must be greater than 0"),
  odometer: z.number().optional(),
  routeId: z.number().optional(),
  // source is always "manual" - not in form, added in API call
});

export type FuelFormData = z.infer<typeof fuelFormSchema>;

// API request structure for creating a fuel record
export interface CreateFuelRequest {
  driverId: string;
  vehicleId: string;
  liters: number;
  odometer?: number;
  routeId?: string;
  source: "manual";
}

// Mapping function: Form data to API request
export function mapFuelFormToApi(formData: FuelFormData): CreateFuelRequest {
  let formattedRouteId: string | undefined = undefined;
  if (formData.routeId && formData.routeId > 0) {
    formattedRouteId = String(formData.routeId);
  }

  const formattedVehicleId: string = String(formData.vehicleId);

  return {
    driverId: formData.driverId,
    vehicleId: formattedVehicleId,
    liters: Number(formData.liters.toFixed(2)),
    odometer: formData.odometer,
    routeId: formattedRouteId,
    source: "manual",
  };
}

// Helper to format date for display
export function formatFuelDate(dateString: string | undefined): string {
  if (!dateString) return "Not set";
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return "Invalid date";
  }
}

// Helper to get anomaly badge info
export function getAnomalyInfo(record: FuelRecord): {
  variant: "outline" | "default" | "destructive" | "secondary";
  label: string;
  className?: string;
} {
  if (!record.deltaPercent) {
    return {
      variant: "outline",
      label: "Normal",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };
  }

  const delta = Math.abs(record.deltaPercent);

  if (delta < 10) {
    return {
      variant: "outline",
      label: "Normal",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };
  } else if (delta < 20) {
    return {
      variant: "secondary",
      label: `Warning (${delta.toFixed(1)}%)`,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };
  } else {
    const type = record.deltaPercent > 0 ? "Theft" : "Leak";
    return {
      variant: "destructive",
      label: `${type} (${delta.toFixed(1)}%)`,
    };
  }
}

// Helper to get source badge variant
export function getSourceBadgeVariant(
  source: FuelSource
): "outline" | "default" | "secondary" {
  switch (source) {
    case FuelSource.MANUAL:
      return "secondary";
    case FuelSource.SENSOR:
      return "default";
    case FuelSource.ROUTE_COMPLETION:
      return "outline";
    default:
      return "outline";
  }
}

// Helper to get source display name
export function getSourceDisplayName(source: FuelSource): string {
  switch (source) {
    case FuelSource.MANUAL:
      return "Manual";
    case FuelSource.SENSOR:
      return "Sensor";
    case FuelSource.ROUTE_COMPLETION:
      return "Route";
    default:
      return source;
  }
}
