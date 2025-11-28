// OSRM (Open Source Routing Machine) types

export interface OsrmCoordinate {
  lat: number;
  lon: number;
}

export interface OsrmRouteResponse {
  code: string;
  routes: OsrmRoute[];
  waypoints: OsrmWaypoint[];
}

export interface OsrmRoute {
  distance: number; // Distance in meters
  duration: number; // Duration in seconds
  weight: number;
  weight_name: string;
  legs: OsrmLeg[];
}

export interface OsrmLeg {
  distance: number;
  duration: number;
  weight: number;
  summary: string;
  steps: OsrmStep[];
}

export interface OsrmStep {
  distance: number;
  duration: number;
  geometry: string;
  name: string;
  mode: string;
  maneuver: OsrmManeuver;
}

export interface OsrmManeuver {
  location: [number, number];
  bearing_before: number;
  bearing_after: number;
  type: string;
  modifier?: string;
}

export interface OsrmWaypoint {
  hint: string;
  distance: number;
  name: string;
  location: [number, number];
}

// Simplified route result for our use case
export interface RouteDistance {
  distanceKm: number;
  durationMinutes: number;
}
