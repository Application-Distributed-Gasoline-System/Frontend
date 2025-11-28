import { apiClient, makeApiCall, API_BASE_URL } from "./client";
import {
  Route,
  ApiRoute,
  RoutesResponse,
  CreateRouteRequest,
  UpdateRouteRequest,
  mapApiRouteToRoute,
} from "../types/route";

// API response structure for paginated routes
interface ApiRoutesResponse {
  routes: ApiRoute[];
  total: number;
  page: number;
  totalPages: number;
}

// Get all routes with pagination
export async function getRoutes(
  page?: number,
  limit?: number
): Promise<RoutesResponse> {
  const params = new URLSearchParams();
  if (page !== undefined) params.append("page", page.toString());
  if (limit !== undefined) params.append("limit", limit.toString());

  const queryString = params.toString();
  const url = queryString
    ? `${API_BASE_URL}/routes?${queryString}`
    : `${API_BASE_URL}/routes`;

  const data = await makeApiCall<ApiRoutesResponse>(
    () => apiClient.get(url),
    "Failed to fetch routes"
  );

  return {
    routes: data.routes.map(mapApiRouteToRoute),
    total: data.total,
    page: data.page,
    totalPages: data.totalPages,
  };
}

// Get route by ID
export async function getRouteById(id: number): Promise<Route> {
  const data = await makeApiCall<ApiRoute>(
    () => apiClient.get(`${API_BASE_URL}/routes/${id}`),
    "Failed to fetch route"
  );

  return mapApiRouteToRoute(data);
}

// Create a new route
export async function createRoute(routeData: CreateRouteRequest): Promise<Route> {
  const data = await makeApiCall<ApiRoute>(
    () => apiClient.post(`${API_BASE_URL}/routes`, routeData),
    "Failed to create route"
  );

  return mapApiRouteToRoute(data);
}

// Update an existing route
export async function updateRoute(
  id: number,
  routeData: UpdateRouteRequest
): Promise<Route> {
  const data = await makeApiCall<ApiRoute>(
    () => apiClient.patch(`${API_BASE_URL}/routes/${id}`, routeData),
    "Failed to update route"
  );

  return mapApiRouteToRoute(data);
}

// Delete a route
export async function deleteRoute(id: number): Promise<void> {
  await makeApiCall(
    () => apiClient.delete(`${API_BASE_URL}/routes/${id}`),
    "Failed to delete route"
  );
}

// Start a route (change status to IN_PROGRESS)
export async function startRoute(id: number): Promise<Route> {
  return updateRoute(id, { status: "IN_PROGRESS" as any });
}

// Complete a route (change status to COMPLETED with actual fuel)
export async function completeRoute(
  id: number,
  actualFuelL: number
): Promise<Route> {
  return updateRoute(id, {
    status: "COMPLETED" as any,
    actualFuelL,
  });
}

// Cancel a route (change status to CANCELLED)
export async function cancelRoute(id: number): Promise<Route> {
  return updateRoute(id, { status: "CANCELLED" as any });
}
