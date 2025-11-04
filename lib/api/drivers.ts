import { apiClient, makeApiCall, API_BASE_URL } from "./client";
import {
  Driver,
  DriverFormData,
  ApiDriver,
  mapApiDriverToDriver,
} from "../types/driver";


// Response type for getDrivers (with pagination)
interface DriversResponse {
  drivers: Driver[];
  total: number;
  page: number;
  totalPages: number;
}

// Response type from API
interface ApiDriversResponse {
  drivers: ApiDriver[];
  total: number;
  page: number;
  totalPages: number;
}

// Get all drivers with pagination
export async function getDrivers(
  page?: number,
  limit?: number
): Promise<DriversResponse> {
  const params = new URLSearchParams();
  if (page !== undefined) params.append("page", page.toString());
  if (limit !== undefined) params.append("limit", limit.toString());

  const queryString = params.toString();
  const url = queryString
    ? `${API_BASE_URL}/drivers?${queryString}`
    : `${API_BASE_URL}/drivers`;

  const data = await makeApiCall<ApiDriversResponse>(
    () => apiClient.get(url),
    "Failed to fetch drivers"
  );

  return {
    drivers: data.drivers.map(mapApiDriverToDriver),
    total: data.total,
    page: data.page,
    totalPages: data.totalPages,
  };
}

// Get driver by ID
export async function getDriverById(id: string): Promise<Driver> {
  const data = await makeApiCall<ApiDriver>(
    () => apiClient.get(`${API_BASE_URL}/drivers/${id}`),
    "Failed to fetch driver"
  );

  return mapApiDriverToDriver(data);
}

// Update an existing driver
export async function updateDriver(
  id: string,
  driverData: Partial<DriverFormData>
): Promise<Driver> {
  // Prepare the update payload
  const updatePayload: any = {};

  if (driverData.name !== undefined) updatePayload.name = driverData.name;
  if (driverData.license !== undefined) updatePayload.license = driverData.license;
  if (driverData.phone !== undefined && driverData.phone !== "") {
    updatePayload.phone = driverData.phone;
  }
  if (driverData.birthDate !== undefined && driverData.birthDate !== "") {
    updatePayload.birthDate = driverData.birthDate;
  }

  const data = await makeApiCall<ApiDriver>(
    () => apiClient.patch(`${API_BASE_URL}/drivers/${id}`, updatePayload),
    "Failed to update driver"
  );

  return mapApiDriverToDriver(data);
}

// Delete a driver
export async function deleteDriver(id: string): Promise<void> {
  await makeApiCall(
    () => apiClient.delete(`${API_BASE_URL}/drivers/${id}`),
    "Failed to delete driver"
  );
}
