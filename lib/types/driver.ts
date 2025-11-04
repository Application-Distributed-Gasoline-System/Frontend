import { z } from "zod";

// License type enum
export enum License {
  C = "C",
  D = "D",
  E = "E",
  G = "G",
}

// Frontend driver type
export interface Driver {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  license: License | null;
  birthDate: string | null; // ISO date string from backend
  isAvailable: boolean;
  registrationDate: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Backend API response structure (same as frontend for drivers)
export interface ApiDriver extends Driver {}

// Zod validation schema for driver update form
export const driverFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  license: z.nativeEnum(License).nullable().optional(),
  phone: z
    .string()
    .min(7, "Phone must be at least 7 characters")
    .max(15, "Phone must not exceed 15 characters")
    .optional()
    .or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")), // ISO date string
});

// Type inference from schema
export type DriverFormData = z.infer<typeof driverFormSchema>;

// Mapping function: API to Frontend (in this case they're the same)
export function mapApiDriverToDriver(apiDriver: ApiDriver): Driver {
  return apiDriver;
}

// Helper to format license for display
export function getLicenseDisplayName(license: License | null): string {
  if (!license) return "Not set";
  return `License ${license}`;
}

// Helper to format date for display
export function formatDate(dateString: string | null): string {
  if (!dateString) return "Not set";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "Invalid date";
  }
}
