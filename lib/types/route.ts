import { z } from "zod";
import { EngineType } from "./vehicle";

// Route status enum
export enum RouteStatus {
  PLANNED = "PLANNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Machinery type enum
export enum MachineryType {
  LIGHT = "LIGHT",
  HEAVY = "HEAVY",
}

export enum VehicleStatus {
  OPERATIONAL = "OPERATIONAL",
  UNDER_MAINTENANCE = "UNDER_MAINTENANCE",
  OUT_OF_SERVICE = "OUT_OF_SERVICE",
}

// License type enum
export enum License {
  C = "C",
  D = "D",
  E = "E",
  G = "G",
}


// Nested driver info in route response
export interface RouteDriver {
  id: string;
  name: string;
  license?: License,
  isAvailable: boolean
}

// Nested vehicle info in route response
export interface RouteVehicle {
  id: number;
  plate: string;
  engineType?: EngineType,
  machineryType?: MachineryType,
  tankCapacity?: number,
  engineDisplacement?: number,
  averageConsumption?: number,
  mileage?: number,
  available?: boolean,
  status?: VehicleStatus
}

// Backend API response structure
export interface ApiRoute {
  id: number;
  code: string;
  origin: string;
  destination: string;
  distanceKm: number;
  machineryType: MachineryType;
  estimatedFuelL: number;
  actualFuelL?: number;
  status: RouteStatus;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  driver: RouteDriver;
  vehicle: RouteVehicle;
}

// Frontend route type
export interface Route {
  id: number;
  code: string;
  origin: string;
  destination: string;
  distanceKm: number;
  machineryType: MachineryType;
  estimatedFuelL: number;
  actualFuelL?: number;
  status: RouteStatus;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  driver: RouteDriver;
  vehicle: RouteVehicle;
}

// Paginated response
export interface RoutesResponse {
  routes: Route[];
  total: number;
  page: number;
  totalPages: number;
}

// Zod validation schema for route form
export const routeFormSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  distanceKm: z.number().min(0.1, "Distance must be at least 0.1 km"),
  machineryType: z.nativeEnum(MachineryType),
  driverId: z.string().min(1, "Driver is required"),
  vehicleId: z.number().min(1, "Vehicle is required"),
  scheduledAt: z.string().optional(),
  estimatedFuelL: z.number().optional(),
  // Coordinates for origin and destination (used for distance calculation)
  originLat: z.number().optional(),
  originLon: z.number().optional(),
  destinationLat: z.number().optional(),
  destinationLon: z.number().optional(),
});

// Type inference from schema
export type RouteFormData = z.infer<typeof routeFormSchema>;

// Schema for status update (completing a route)
export const routeStatusSchema = z.object({
  status: z.nativeEnum(RouteStatus),
  actualFuelL: z.number().optional(),
});

export type RouteStatusData = z.infer<typeof routeStatusSchema>;

// API request structure for creating a route
export interface CreateRouteRequest {
  origin: string;
  destination: string;
  distanceKm: number;
  machineryType: MachineryType;
  driverId: string;
  vehicleId: number;
  scheduledAt?: string;
  estimatedFuelL?: number;
}

// API request structure for updating a route
export interface UpdateRouteRequest {
  origin?: string;
  destination?: string;
  distanceKm?: number;
  machineryType?: MachineryType;
  driverId?: string;
  vehicleId?: number;
  scheduledAt?: string;
  estimatedFuelL?: number;
  status?: RouteStatus;
  actualFuelL?: number;
}

// Mapping function: API response to Frontend
export function mapApiRouteToRoute(apiRoute: ApiRoute): Route {
  return {
    id: apiRoute.id,
    code: apiRoute.code,
    origin: apiRoute.origin,
    destination: apiRoute.destination,
    distanceKm: apiRoute.distanceKm,
    machineryType: apiRoute.machineryType,
    estimatedFuelL: apiRoute.estimatedFuelL,
    actualFuelL: apiRoute.actualFuelL,
    status: apiRoute.status,
    scheduledAt: apiRoute.scheduledAt,
    startedAt: apiRoute.startedAt,
    completedAt: apiRoute.completedAt,
    createdAt: apiRoute.createdAt,
    updatedAt: apiRoute.updatedAt,
    driver: apiRoute.driver,
    vehicle: apiRoute.vehicle,
  };
}

// Mapping function: Form data to API request
export function mapRouteFormToApi(formData: RouteFormData): CreateRouteRequest {
  const scheduledAtFormatted = formData.scheduledAt === ""
    ? new Date().toISOString()
    : formData.scheduledAt
      ? new Date(formData.scheduledAt).toISOString()
      : undefined;

  return {
    origin: formData.origin,
    destination: formData.destination,
    distanceKm: Number(formData.distanceKm.toFixed(2)),
    machineryType: formData.machineryType,
    driverId: formData.driverId,
    vehicleId: formData.vehicleId,
    scheduledAt: scheduledAtFormatted,
    estimatedFuelL: Number(formData.estimatedFuelL?.toFixed(2) || 0),
  };
}

// Helper to format date for display
export function formatRouteDate(dateString: string | undefined): string {
  if (!dateString) return "Not set";
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return "Invalid date";
  }
}

// Helper to get status badge variant
export function getStatusBadgeVariant(status: RouteStatus): string {
  switch (status) {
    case RouteStatus.PLANNED:
      return "secondary";
    case RouteStatus.IN_PROGRESS:
      return "default";
    case RouteStatus.COMPLETED:
      return "default"; // Will use green color
    case RouteStatus.CANCELLED:
      return "destructive";
    default:
      return "outline";
  }
}

// Helper to get status display name
export function getStatusDisplayName(status: RouteStatus): string {
  switch (status) {
    case RouteStatus.PLANNED:
      return "Planned";
    case RouteStatus.IN_PROGRESS:
      return "In Progress";
    case RouteStatus.COMPLETED:
      return "Completed";
    case RouteStatus.CANCELLED:
      return "Cancelled";
    default:
      return status;
  }
}

// Helper to get machinery type display name
export function getMachineryTypeDisplayName(type: MachineryType): string {
  switch (type) {
    case MachineryType.LIGHT:
      return "Light";
    case MachineryType.HEAVY:
      return "Heavy";
    default:
      return type;
  }
}
