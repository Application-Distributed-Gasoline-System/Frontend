import {
  Vehicle,
  VehicleFormData,
  ApiVehiclesResponse,
  VehiclesResponse,
  ApiVehicle,
  ApiVehicleRequest,
  mapApiVehicleToVehicle,
  mapVehicleFormToApi
} from '@/lib/types/vehicle';
import { apiClient, makeApiCall, API_BASE_URL } from './client';

export interface ApiError {
  message: string;
  statusCode?: number;
}

/**
 * Get all vehicles with pagination
 */
export async function getVehicles(page?: number, limit?: number): Promise<VehiclesResponse> {
  // Build query string with pagination parameters
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', page.toString());
  if (limit !== undefined) params.append('limit', limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : '';

  const data = await makeApiCall<ApiVehiclesResponse>(
    () => apiClient.get(`${API_BASE_URL}/vehicles${queryString}`),
    'Failed to fetch vehicles'
  );

  // Map backend vehicles to frontend format and include pagination metadata
  return {
    vehicles: data.vehicles.map(mapApiVehicleToVehicle),
    total: data.total,
    page: data.page,
    totalPages: data.totalPages,
  };
}

/**
 * Get a single vehicle by ID
 */
export async function getVehicleById(id: string): Promise<Vehicle> {
  const data = await makeApiCall<ApiVehicle>(
    () => apiClient.get(`${API_BASE_URL}/vehicles/${id}`),
    'Failed to fetch vehicle'
  );
  
  return mapApiVehicleToVehicle(data);
}

/**
 * Create a new vehicle
 */
export async function createVehicle(vehicleData: VehicleFormData): Promise<Vehicle> {
  const apiData = mapVehicleFormToApi(vehicleData);
  
  const data = await makeApiCall<ApiVehicle>(
    () => apiClient.post(`${API_BASE_URL}/vehicles`, apiData),
    'Failed to create vehicle'
  );
  
  return mapApiVehicleToVehicle(data);
}

/**
 * Update an existing vehicle
 */
export async function updateVehicle(id: string, vehicleData: Partial<VehicleFormData>): Promise<Vehicle> {
  // Convert partial form data to API request format
  const apiData: Partial<ApiVehicleRequest> = {};

  if (vehicleData.plate !== undefined) apiData.plate = vehicleData.plate;
  if (vehicleData.brand !== undefined) apiData.brand = vehicleData.brand;
  if (vehicleData.model !== undefined) apiData.model = vehicleData.model;
  if (vehicleData.year !== undefined) apiData.year = vehicleData.year;
  if (vehicleData.engineType !== undefined) apiData.engineType = vehicleData.engineType;
  if (vehicleData.category !== undefined) apiData.machineryType = vehicleData.category;
  if (vehicleData.tankCapacity !== undefined) apiData.tankCapacity = vehicleData.tankCapacity;
  if (vehicleData.engineDisplacement !== undefined) apiData.engineDisplacement = vehicleData.engineDisplacement;
  if (vehicleData.averageConsumption !== undefined) apiData.averageConsumption = vehicleData.averageConsumption;
  if (vehicleData.mileage !== undefined) apiData.mileage = vehicleData.mileage;
  if (vehicleData.available !== undefined) apiData.available = vehicleData.available;

  const data = await makeApiCall<ApiVehicle>(
    () => apiClient.patch(`${API_BASE_URL}/vehicles/${id}`, apiData),
    'Failed to update vehicle'
  );

  return mapApiVehicleToVehicle(data);
}

/**
 * Delete a vehicle
 */
export async function deleteVehicle(id: string): Promise<void> {
  await makeApiCall<void>(
    () => apiClient.delete(`${API_BASE_URL}/vehicles/${id}`),
    'Failed to delete vehicle'
  );
}

/**
 * Toggle vehicle availability
 */
export async function toggleVehicleAvailability(id: string, available: boolean): Promise<Vehicle> {
  return updateVehicle(id, { available });
}
