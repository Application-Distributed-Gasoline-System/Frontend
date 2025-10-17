import { z } from 'zod';

// Engine type enum (matching backend numeric values)
export enum EngineType {
  DIESEL = 0,
  GASOLINE = 1,
  ELECTRIC = 2,
  HYBRID = 3,
}

// Machinery type enum (matching backend numeric values)
export enum MachineryType {
  LIGHT = 0,
  HEAVY = 1,
}

// Backend API response structure for a single vehicle
export interface ApiVehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  year: number;
  engineType: number; // 0=DIESEL, 1=GASOLINE, 2=ELECTRIC, 3=HYBRID
  machineryType: number; // 0=LIGHT, 1=HEAVY
  tankCapacity: number;
  engineDisplacement: number;
  averageConsumption: number;
  mileage: number;
  available: boolean;
}

// Backend API response for vehicles list
export interface ApiVehiclesResponse {
  vehicles: ApiVehicle[];
  total: number;
  page: number;
  totalPages: number;
}

// Frontend vehicle type
export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  engineType: EngineType;
  category: MachineryType;
  tankCapacity: number;
  engineDisplacement: number;
  averageConsumption: number;
  mileage: number;
  available: boolean;
}

// Zod schema for vehicle form validation
export const vehicleFormSchema = z.object({
  plate: z.string()
    .min(1, 'Plate number is required')
    .max(20, 'Plate number must be 20 characters or less')
    .regex(/^[A-Z0-9-]+$/i, 'Plate must contain only letters, numbers, and hyphens'),
  brand: z.string()
    .min(1, 'Brand is required')
    .max(50, 'Brand must be 50 characters or less'),
  model: z.string()
    .min(1, 'Model is required')
    .max(50, 'Model must be 50 characters or less'),
  year: z.number()
    .int()
    .min(2000, 'Year must be 2000 or later')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  engineType: z.enum(EngineType),
  category: z.enum(MachineryType),
  tankCapacity: z.number()
    .positive('Tank capacity must be positive'),
  engineDisplacement: z.number()
    .positive('Engine displacement must be positive'),
  averageConsumption: z.number()
    .positive('Average consumption must be positive'),
  mileage: z.number()
    .min(0, 'Mileage cannot be negative'),
  available: z.boolean(),
});

export type VehicleFormData = z.infer<typeof vehicleFormSchema>;

/**
 * Convert backend API vehicle to frontend vehicle
 */
export function mapApiVehicleToVehicle(apiVehicle: ApiVehicle): Vehicle {
  return {
    id: apiVehicle.id.toString(),
    plate: apiVehicle.plate,
    brand: apiVehicle.brand,
    model: apiVehicle.model,
    year: apiVehicle.year,
    engineType: apiVehicle.engineType as EngineType,
    category: apiVehicle.machineryType as MachineryType,
    tankCapacity: apiVehicle.tankCapacity,
    engineDisplacement: apiVehicle.engineDisplacement,
    averageConsumption: apiVehicle.averageConsumption,
    mileage: apiVehicle.mileage,
    available: apiVehicle.available,
  };
}

/**
 * Convert frontend vehicle form data to backend API format
 */
export function mapVehicleFormToApi(formData: VehicleFormData): Omit<ApiVehicle, 'id'> {
  return {
    plate: formData.plate,
    brand: formData.brand,
    model: formData.model,
    year: formData.year,
    engineType: formData.engineType,
    machineryType: formData.category,
    tankCapacity: formData.tankCapacity,
    engineDisplacement: formData.engineDisplacement,
    averageConsumption: formData.averageConsumption,
    mileage: formData.mileage,
    available: formData.available,
  };
}

// Helper function to get engine type badge variant
export function getEngineTypeBadgeVariant(engineType: EngineType): 'default' | 'secondary' | 'outline' {
  switch (engineType) {
    case EngineType.DIESEL:
      return 'default';
    case EngineType.GASOLINE:
      return 'secondary';
    default:
      return 'outline';
  }
}

// Helper function to get engine type display name
export function getEngineTypeDisplay(engineType: EngineType): string {
  switch (engineType) {
    case EngineType.DIESEL:
      return 'Diesel';
    case EngineType.GASOLINE:
      return 'Gasoline';
    case EngineType.ELECTRIC:
      return 'Electric';
    case EngineType.HYBRID:
      return 'Hybrid';
    default:
      return 'Unknown';
  }
}

// Helper function to get category display name
export function getCategoryDisplay(category: MachineryType): string {
  switch (category) {
    case MachineryType.LIGHT:
      return 'Light';
    case MachineryType.HEAVY:
      return 'Heavy';
    default:
      return 'Unknown';
  }
}
