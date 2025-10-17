import { getToken } from '@/lib/auth/storage';
import {
  Vehicle,
  VehicleFormData,
  ApiVehiclesResponse,
  ApiVehicle,
  mapApiVehicleToVehicle,
  mapVehicleFormToApi
} from '@/lib/types/vehicle';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiError {
  message: string;
  statusCode?: number;
}


/**
 * Get authorization headers with JWT token
 */
function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Handle API errors
 */
function handleApiError(error: ApiError): never {
  if (error.statusCode) {
    throw error;
  }
  throw {
    message: 'Network error. Please check your connection.',
    statusCode: 0,
  } as ApiError;
}

/**
 * Get all vehicles
 */
export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch vehicles' }));
      throw {
        message: errorData.message || 'Failed to fetch vehicles',
        statusCode: response.status,
      } as ApiError;
    }

    const data: ApiVehiclesResponse = await response.json();

    // Map backend vehicles to frontend format
    return data.vehicles.map(mapApiVehicleToVehicle);
  } catch (error) {
    return handleApiError(error as ApiError);
  }
}

/**
 * Get a single vehicle by ID
 */
export async function getVehicleById(id: string): Promise<Vehicle> {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch vehicle' }));
      throw {
        message: errorData.message || 'Failed to fetch vehicle',
        statusCode: response.status,
      } as ApiError;
    }

    const data: ApiVehicle = await response.json();
    return mapApiVehicleToVehicle(data);
  } catch (error) {
    return handleApiError(error as ApiError);
  }
}

/**
 * Create a new vehicle
 */
export async function createVehicle(vehicleData: VehicleFormData): Promise<Vehicle> {
  try {
    const apiData = mapVehicleFormToApi(vehicleData);

    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create vehicle' }));
      throw {
        message: errorData.message || 'Failed to create vehicle',
        statusCode: response.status,
      } as ApiError;
    }

    const data: ApiVehicle = await response.json();
    return mapApiVehicleToVehicle(data);
  } catch (error) {
    return handleApiError(error as ApiError);
  }
}

/**
 * Update an existing vehicle
 */
export async function updateVehicle(id: string, vehicleData: Partial<VehicleFormData>): Promise<Vehicle> {
  try {
    // Convert partial form data to API format
    const apiData: Partial<Omit<ApiVehicle, 'id'>> = {};

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

    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update vehicle' }));
      throw {
        message: errorData.message || 'Failed to update vehicle',
        statusCode: response.status,
      } as ApiError;
    }

    const data: ApiVehicle = await response.json();
    return mapApiVehicleToVehicle(data);
  } catch (error) {
    return handleApiError(error as ApiError);
  }
}

/**
 * Delete a vehicle
 */
export async function deleteVehicle(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete vehicle' }));
      throw {
        message: errorData.message || 'Failed to delete vehicle',
        statusCode: response.status,
      } as ApiError;
    }
  } catch (error) {
    return handleApiError(error as ApiError);
  }
}

/**
 * Toggle vehicle availability
 */
export async function toggleVehicleAvailability(id: string, available: boolean): Promise<Vehicle> {
  return updateVehicle(id, { available });
}
