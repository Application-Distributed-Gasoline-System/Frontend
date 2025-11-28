import type { OsrmRouteResponse, OsrmCoordinate, RouteDistance } from "../types/osrm";

const OSRM_BASE_URL = "https://router.project-osrm.org";

export const osrmApi = {
  /**
   * Get route distance and duration between two coordinates
   * Uses OSRM public API for driving routes
   */
  async getRouteDistance(
    origin: OsrmCoordinate,
    destination: OsrmCoordinate
  ): Promise<RouteDistance> {
    // OSRM expects coordinates as lon,lat
    const coordinates = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
    const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?overview=false`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Gas-System-App",
        },
      });

      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status}`);
      }

      const data: OsrmRouteResponse = await response.json();

      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw new Error("No route found between the specified locations");
      }

      const route = data.routes[0];

      return {
        distanceKm: Number((route.distance / 1000).toFixed(1)), // Convert meters to km
        durationMinutes: Number((route.duration / 60).toFixed(0)), // Convert seconds to minutes
      };
    } catch (error) {
      console.error("OSRM API error:", error);
      throw error;
    }
  },

  /**
   * Calculate straight-line distance between two coordinates (fallback)
   * Uses Haversine formula
   */
  calculateStraightLineDistance(
    origin: OsrmCoordinate,
    destination: OsrmCoordinate
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(destination.lat - origin.lat);
    const dLon = toRad(destination.lon - origin.lon);
    const lat1 = toRad(origin.lat);
    const lat2 = toRad(destination.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Number(distance.toFixed(2));
  },
};

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
