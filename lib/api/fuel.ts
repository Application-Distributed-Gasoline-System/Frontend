import { apiClient, makeApiCall, API_BASE_URL } from "./client";
import {
  FuelRecord,
  VehicleFuelHistory,
  FuelReportItem,
  FuelFormData,
  CreateFuelRequest,
  mapFuelFormToApi,
  DriverFuelHistory,
} from "@/lib/types/fuel";

/**
 * Create a manual fuel record
 * POST /fuel
 */
export async function createFuelRecord(
  data: FuelFormData
): Promise<FuelRecord> {
  // Simplemente usa la función de mapeo que ya tienes
  const apiData = mapFuelFormToApi(data);

  return makeApiCall<FuelRecord>(
    () => apiClient.post(`${API_BASE_URL}/fuel`, apiData),
    "Failed to create fuel record"
  );
}

/**
 * Get vehicle fuel history with optional date filters
 * GET /fuel/vehicle/:id?from=&to=
 */
export async function getVehicleFuelHistory(
  vehicleId: number,
  from?: string,
  to?: string
): Promise<VehicleFuelHistory> {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/fuel/vehicle/${vehicleId}${
    queryString ? `?${queryString}` : ""
  }`;

  return makeApiCall<VehicleFuelHistory>(
    () => apiClient.get(url),
    "Failed to fetch vehicle fuel history"
  );
}

/**
 * Get driver fuel records with optional date filters
 * GET /fuel/driver/:id?from=&to=
 */
export async function getDriverFuelHistory(
  driverId: string,
  from?: string,
  to?: string
): Promise<DriverFuelHistory> {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/fuel/driver/${driverId}${
    queryString ? `?${queryString}` : ""
  }`;

  return makeApiCall<DriverFuelHistory>(
    () => apiClient.get(url),
    "Failed to fetch vehicle fuel history"
  );
}

/**
 * Get fleet fuel report
 * GET /fuel/report?from=&to=&vehicleIds=&machineryType=
 * This endpoint is also used for the "Recent Records" tab
 */
export async function getFuelReport(
  from: string,
  to: string,
  vehicleIds?: number[],
  machineryType?: "LIGHT" | "HEAVY"
): Promise<FuelReportItem[]> {
  const params = new URLSearchParams();
  params.append("from", from);
  params.append("to", to);

  if (vehicleIds && vehicleIds.length > 0) {
    vehicleIds.forEach((id) => params.append("vehicleIds", id.toString()));
  }

  if (machineryType) {
    params.append("machineryType", machineryType);
  }

  const url = `${API_BASE_URL}/fuel/report?${params.toString()}`;

  return makeApiCall<FuelReportItem[]>(
    () => apiClient.get(url),
    "Failed to fetch fuel report"
  );
}

/**
 * Helper function to get date range for default filters
 * Returns ISO date strings for from/to dates
 */
export function getDefaultDateRange(days: number = 30): {
  from: string;
  to: string;
} {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  return {
    from: from.toISOString().split("T")[0], // Format: YYYY-MM-DD
    to: to.toISOString().split("T")[0], // Format: YYYY-MM-DD
  };
}
